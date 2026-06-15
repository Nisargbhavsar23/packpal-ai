import json
import re
from abc import ABC, abstractmethod
from typing import Any

import httpx

from app.core.config import settings
from app.models.enums import ItemPriority
from app.services.ai_prompt_service import (
    SYSTEM_PROMPT,
    ask_assistant_contract,
    build_json_prompt,
    destination_insights_contract,
    missing_essentials_contract,
    packing_list_contract,
    trip_summary_contract,
)


class AIProviderError(Exception):
    pass


class AIProviderConfigurationError(AIProviderError):
    pass


class AIProviderParseError(AIProviderError):
    pass


def normalize_name(value: str) -> str:
    return " ".join(value.strip().lower().split())


def normalize_priority(value: str | ItemPriority | None) -> str:
    if isinstance(value, ItemPriority):
        return value.value
    if not value:
        return ItemPriority.MEDIUM.value
    normalized = str(value).strip().upper()
    return normalized if normalized in {"LOW", "MEDIUM", "HIGH"} else ItemPriority.MEDIUM.value


class BaseAIProvider(ABC):
    provider_name = "base"
    provider_note: str | None = None

    @abstractmethod
    def generate_packing_list(self, context: dict[str, Any], request_data: dict[str, Any]) -> dict[str, Any]:
        raise NotImplementedError

    @abstractmethod
    def find_missing_essentials(self, context: dict[str, Any], request_data: dict[str, Any]) -> dict[str, Any]:
        raise NotImplementedError

    @abstractmethod
    def generate_trip_summary(self, context: dict[str, Any], request_data: dict[str, Any]) -> dict[str, Any]:
        raise NotImplementedError

    @abstractmethod
    def answer_question(self, context: dict[str, Any], request_data: dict[str, Any]) -> dict[str, Any]:
        raise NotImplementedError

    @abstractmethod
    def generate_destination_insights(self, context: dict[str, Any], request_data: dict[str, Any]) -> dict[str, Any]:
        raise NotImplementedError


class MockAIProvider(BaseAIProvider):
    provider_name = "mock"

    def __init__(self, provider_name: str = "mock", provider_note: str | None = None) -> None:
        self.provider_name = provider_name
        self.provider_note = provider_note

    def generate_packing_list(self, context: dict[str, Any], request_data: dict[str, Any]) -> dict[str, Any]:
        trip = context["trip"]
        existing = _existing_item_names(context)
        categories = _category_names(context)
        duration = trip.get("duration_days", 1)
        context_text = _context_text(context, request_data)
        weather = _weather_context(context)
        candidates = [
            _item("Government ID", "Documents", 1, "HIGH", "Needed for hotel check-ins and travel verification.", "Keep a digital backup too."),
            _item("Travel Tickets", "Documents", 1, "HIGH", "Keeps transport details easy to access.", "Save offline copies before departure."),
            _item("Phone Charger", "Tech", 1, "HIGH", "Essential for navigation, calls, and coordination.", "Pack a compatible cable and adapter."),
            _item("Power Bank", "Tech", 1, "MEDIUM", "Useful when the group is away from charging points.", "Charge it the night before travel."),
            _item("First Aid Kit", "Emergency", 1, "HIGH", "Helpful for small cuts, headaches, or travel discomfort.", "Include basic bandages and regular medicines."),
            _item("Reusable Water Bottle", "Food", 1, "MEDIUM", "Helps everyone stay hydrated during travel.", "Refill whenever safe drinking water is available."),
            _item("Hand Sanitizer", "Hygiene", 1, "MEDIUM", "Useful before meals and during transit.", "Carry a small travel-size bottle."),
            _item("Comfortable Clothes", "Clothes", min(max(duration, 2), 6), "MEDIUM", "Matches the trip duration and keeps packing practical.", "Prefer easy-to-layer outfits."),
        ]

        if any(word in context_text for word in ["beach", "goa", "maldives", "island", "hot", "humid", "swim", "swimming"]):
            if "goa" in context_text:
                candidates.extend(
                    [
                        _item("ORS Packets", "Emergency", 2, "MEDIUM", "Goa heat and beach days can make hydration planning useful.", "Carry a couple of sachets in the day bag."),
                        _item("Light Cotton Outfits", "Clothes", min(max(duration, 2), 5), "MEDIUM", "Goa's warm coastal weather suits breathable clothing.", "Prefer quick-drying fabrics."),
                    ]
                )
            if "maldives" in context_text:
                candidates.extend(
                    [
                        _item("Waterproof Dry Bag", "Emergency", 1, "HIGH", "Maldives transfers and water activities can expose essentials to water.", "Use it for documents, phone, and wallet."),
                        _item("Resort Wear", "Clothes", min(max(duration, 2), 5), "LOW", "Maldives itineraries often include resort dining and relaxed evenings.", "Keep it lightweight and compact."),
                    ]
                )
            candidates.extend(
                [
                    _item("Reef-Safe Sunscreen", "Hygiene", 1, "HIGH", "Useful for sunny beach or island travel.", "Choose SPF 50 if possible."),
                    _item("Swimwear", "Clothes", 1, "MEDIUM", "Helpful for beach or pool plans.", "Pack a separate wet bag."),
                    _item("Quick-Dry Towel", "Hygiene", 1, "MEDIUM", "Practical for beach activities and humid weather.", "A compact microfiber towel saves space."),
                    _item("Sandals", "Clothes", 1, "MEDIUM", "Comfortable for beach walks and resort areas.", "Choose a pair with good grip."),
                ]
            )
        if any(word in context_text for word in ["trek", "hike", "mountain", "manali", "ladakh", "switzerland", "cold", "snow", "winter"]):
            candidates.extend(
                [
                    _item("Thermal Wear", "Clothes", 2, "HIGH", "Cold or high-altitude destinations need reliable base layers.", "Pack moisture-wicking thermals."),
                    _item("Insulated Jacket", "Clothes", 1, "HIGH", "Cold weather can change quickly during hill or alpine travel.", "Choose a wind-resistant layer."),
                    _item("Gloves", "Clothes", 1, "MEDIUM", "Useful for cold mornings and exposed areas.", "Add a beanie if evenings are cold."),
                ]
            )
        if any(word in context_text for word in ["trek", "hike", "ladakh", "mountain"]):
            candidates.extend(
                [
                    _item("Hiking Shoes", "Clothes", 1, "HIGH", "Good grip reduces discomfort and safety risks.", "Break them in before the trip."),
                    _item("Hydration Gear", "Food", 1, "HIGH", "Long outdoor days need planned hydration.", "Carry a bottle or hydration bladder."),
                    _item("First Aid Kit", "Emergency", 1, "HIGH", "Trekking plans need basic first-aid coverage.", "Include regular medicines and blister care."),
                ]
            )
        if any(word in context_text for word in ["business", "conference", "meeting"]):
            candidates.extend(
                [
                    _item("Formal Clothes", "Clothes", max(min(duration, 3), 1), "HIGH", "Business travel needs meeting-ready outfits.", "Pack one backup shirt or top."),
                    _item("Laptop", "Tech", 1, "HIGH", "Required for work, presentations, and documents.", "Carry charger and adapter together."),
                    _item("Work Documents", "Documents", 1, "HIGH", "Keeps bookings, IDs, and meeting material ready.", "Save offline copies."),
                ]
            )
        if weather.get("available") and (weather.get("rain_probability") or 0) >= 50:
            candidates.extend(
                [
                    _item("Compact Umbrella", "Emergency", 1, "MEDIUM", "Forecast shows meaningful rain probability.", "Pack it where it is easy to reach."),
                    _item("Rain Jacket", "Clothes", 1, "MEDIUM", "Rain protection keeps day plans comfortable.", "Choose a lightweight layer."),
                ]
            )
        if any(word in context_text for word in ["photography", "camera"]):
            candidates.append(_item("Camera Batteries", "Tech", 2, "MEDIUM", "Photography plans need backup power.", "Carry memory cards if needed."))
        if any(word in context_text for word in ["japan", "international"]):
            candidates.extend(
                [
                    _item("Universal Adapter", "Tech", 1, "HIGH", "International travel often needs plug compatibility.", "Check your device voltage support."),
                    _item("Travel Insurance Details", "Documents", 1, "MEDIUM", "Useful during international travel disruptions.", "Keep a digital and offline copy."),
                ]
            )
        if any(word in context_text for word in ["college", "friends", "hackathon"]):
            candidates.append(_item("Shared Snacks", "Food", 2, "LOW", "Easy group snack options reduce last-minute stops.", "Choose non-messy snacks."))

        items = [_with_known_category(item, categories) for item in candidates if normalize_name(item["name"]) not in existing]
        return {
            "summary": _contextual_summary(context, "packing suggestions"),
            "items": items[:12],
        }

    def find_missing_essentials(self, context: dict[str, Any], request_data: dict[str, Any]) -> dict[str, Any]:
        existing = _existing_item_names(context)
        categories = _category_names(context)
        focus_text = normalize_name(request_data.get("focus") or "")
        context_text = _context_text(context, request_data)
        candidates = [
            _missing("Government ID", "Documents", "HIGH", "Important for check-ins, emergencies, and travel verification."),
            _missing("Emergency Contacts", "Documents", "HIGH", "Useful if phones are unavailable or someone needs quick help."),
            _missing("First Aid Kit", "Emergency", "HIGH", "Useful for small injuries or travel discomfort."),
            _missing("Phone Charger", "Tech", "HIGH", "Keeps navigation and group communication available."),
            _missing("Power Bank", "Tech", "MEDIUM", "Helpful during long travel days."),
            _missing("Hand Sanitizer", "Hygiene", "MEDIUM", "Useful before meals and in transit."),
        ]
        if "safety" in focus_text:
            candidates.append(_missing("Small Flashlight", "Emergency", "MEDIUM", "Useful during low-light travel or power cuts."))
        if "documents" in focus_text:
            candidates.append(_missing("Booking Confirmations", "Documents", "HIGH", "Keeps hotel or activity details ready offline."))
        if any(word in context_text for word in ["beach", "goa", "maldives", "island"]):
            candidates.extend(
                [
                    _missing("Reef-Safe Sunscreen", "Hygiene", "HIGH", "Sunny beach destinations make sun protection essential."),
                    _missing("Swimwear", "Clothes", "MEDIUM", "Useful for beach, pool, or water activities."),
                ]
            )
        if any(word in context_text for word in ["ladakh", "switzerland", "cold", "snow", "mountain"]):
            candidates.extend(
                [
                    _missing("Thermal Wear", "Clothes", "HIGH", "Cold or high-altitude destinations need warm base layers."),
                    _missing("Insulated Jacket", "Clothes", "HIGH", "Cold weather can become uncomfortable without an outer layer."),
                    _missing("Gloves", "Clothes", "MEDIUM", "Helpful for cold mornings and exposed areas."),
                ]
            )
        if any(word in context_text for word in ["business", "conference", "meeting"]):
            candidates.extend(
                [
                    _missing("Formal Clothes", "Clothes", "HIGH", "Business trips need meeting-ready outfits."),
                    _missing("Laptop Charger", "Tech", "HIGH", "Work travel can stall quickly without a charger."),
                ]
            )
        if any(word in context_text for word in ["japan", "international"]):
            candidates.extend(
                [
                    _missing("Universal Adapter", "Tech", "HIGH", "International trips often need plug compatibility."),
                    _missing("Passport", "Documents", "HIGH", "International travel requires verified travel documents."),
                ]
            )

        missing_items = [
            _with_known_category(item, categories)
            for item in candidates
            if normalize_name(item["name"]) not in existing
        ]
        return {
            "summary": _contextual_summary(context, "missing essentials"),
            "missing_items": missing_items[:8],
        }

    def generate_trip_summary(self, context: dict[str, Any], request_data: dict[str, Any]) -> dict[str, Any]:
        items = context["items"]
        total = len(items)
        pending = sum(1 for item in items if item["status"] == "PENDING")
        packed = sum(1 for item in items if item["status"] == "PACKED")
        delivered = sum(1 for item in items if item["status"] == "DELIVERED")
        high_pending = [item for item in items if item["priority"] == "HIGH" and item["status"] == "PENDING"]
        readiness_score = 0 if total == 0 else round(((packed + delivered) / total) * 100)

        member_summary = []
        for member in context["members"]:
            assigned = [item for item in items if item.get("assigned_to_id") == member["user_id"]]
            member_summary.append(
                {
                    "member_name": member["name"],
                    "assigned_items": len(assigned),
                    "pending_items": sum(1 for item in assigned if item["status"] == "PENDING"),
                }
            )

        recommendations = []
        top_missing_priorities = []
        if total == 0:
            recommendations.append("Add essential documents, tech, hygiene, and emergency items before travel.")
        if high_pending:
            recommendations.append("Pack high-priority items before lower-priority extras.")
            top_missing_priorities.extend([item["name"] for item in high_pending[:5]])
        if pending:
            recommendations.append("Review pending items with the group before the travel date.")
        if not recommendations:
            recommendations.append("Do a final check of documents, chargers, and medicines before leaving.")

        return {
            "summary": _contextual_summary(context, "trip readiness"),
            "readiness_score": readiness_score,
            "total_items": total,
            "pending_items": pending,
            "packed_items": packed,
            "delivered_items": delivered,
            "category_breakdown": _category_readiness(context),
            "top_missing_priorities": top_missing_priorities or _top_missing_priorities(context),
            "high_priority_notes": [f"{len(high_pending)} high priority items are still pending."] if high_pending else ["No high priority items are pending."],
            "member_summary": member_summary,
            "recommendations": recommendations,
        }

    def answer_question(self, context: dict[str, Any], request_data: dict[str, Any]) -> dict[str, Any]:
        question = request_data["question"].strip()
        normalized_question = normalize_name(question)
        if not _is_travel_question(normalized_question):
            return {
                "answer": "I can help with packing, travel preparation, and trip logistics for this trip.",
                "suggested_actions": [],
            }

        trip = context["trip"]
        trip_destination = trip.get("destination") or "your current trip"
        asked_destination = _detect_destination(normalized_question)
        destination = asked_destination or trip_destination
        trip_type = _detect_trip_type(normalized_question) or trip.get("trip_type") or "travel"
        duration = _extract_duration(normalized_question) or trip.get("duration_days", 1)
        existing_items = _existing_item_names(context)
        existing_label = _format_existing_items(context)
        mismatch = bool(asked_destination and normalize_name(asked_destination) != normalize_name(trip_destination))
        mismatch_sentence = f"Your current trip is {trip_destination}, but for {destination}, " if mismatch else ""

        if _asks_assignment_question(normalized_question):
            return _assignment_answer(context, mismatch_sentence)
        if _asks_document_question(normalized_question):
            return _document_answer(destination, trip_destination, mismatch_sentence, bool(asked_destination))

        essentials = _question_specific_essentials(normalized_question, destination, trip_type)
        already_present = [item for item in essentials if normalize_name(item) in existing_items]
        to_add = [item for item in essentials if normalize_name(item) not in existing_items]
        weather = _weather_context(context)
        weather_sentence = f"Weather context: {_weather_phrase(weather)}. "
        live_data_sentence = _live_data_sentence(normalized_question)

        answer = (
            f"{mismatch_sentence}for a {duration}-day {trip_type.lower()} to {destination}, prioritize "
            f"{_comma_list(essentials)}. "
            f"{weather_sentence}"
            f"Your current checklist includes {existing_label}. "
        )
        if already_present:
            answer += f"Since it already includes {_comma_list(already_present)}, focus next on {_comma_list(to_add[:6] or essentials[:4])}. "
        else:
            answer += f"Start by adding {_comma_list(to_add[:6])}. "
        answer += live_data_sentence

        return {
            "answer": answer.strip(),
            "suggested_actions": [_action_for_item(item) for item in to_add[:5]],
        }

    def generate_destination_insights(self, context: dict[str, Any], request_data: dict[str, Any]) -> dict[str, Any]:
        travel_context = context.get("travel_context", {})
        destination = travel_context.get("destination") or context["trip"].get("destination")
        country = travel_context.get("country") or "the destination"
        duration = travel_context.get("duration_days") or context["trip"].get("duration_days")
        checklist = travel_context.get("checklist_summary", {})
        weather = travel_context.get("weather", {})
        context_text = _context_text(context, request_data)
        weather_phrase = _weather_phrase(weather)

        packing_warnings = [
            f"For {destination}, use the {duration}-day duration and current checklist status ({checklist.get('pending_count', 0)} pending items) to avoid overpacking.",
        ]
        if any(word in context_text for word in ["goa", "maldives", "beach", "island"]):
            packing_warnings.append("Protect electronics and documents from sand, humidity, and water exposure.")
        if any(word in context_text for word in ["ladakh", "switzerland", "cold", "mountain"]):
            packing_warnings.append("Prioritize warm layers, hydration, and medicines before optional clothing.")
        if any(word in context_text for word in ["japan"]):
            packing_warnings.append("Pack compactly because train and city transfers are easier with lighter luggage.")

        return {
            "summary": f"For {destination} in {country}, this {duration}-day trip should account for {weather_phrase} and {checklist.get('pending_count', 0)} pending checklist items.",
            "local_travel_tips": _destination_tips(destination, context_text),
            "cultural_considerations": _cultural_notes(destination, context_text),
            "common_mistakes": _common_mistakes(destination, context_text),
            "packing_warnings": packing_warnings[:4],
            "transportation_notes": _transport_notes(destination, context_text),
            "safety_reminders": _safety_notes(destination, context_text),
        }


class GeminiAIProvider(BaseAIProvider):
    provider_name = "gemini"

    def __init__(self) -> None:
        self.api_key = settings.GEMINI_API_KEY
        self.model = settings.GEMINI_MODEL
        self.temperature = settings.AI_TEMPERATURE

    def generate_packing_list(self, context: dict[str, Any], request_data: dict[str, Any]) -> dict[str, Any]:
        return self._generate_json("Generate a trip-specific packing list and avoid duplicate checklist items.", context, request_data, packing_list_contract())

    def find_missing_essentials(self, context: dict[str, Any], request_data: dict[str, Any]) -> dict[str, Any]:
        return self._generate_json("Suggest important missing essentials for this trip.", context, request_data, missing_essentials_contract())

    def generate_trip_summary(self, context: dict[str, Any], request_data: dict[str, Any]) -> dict[str, Any]:
        return self._generate_json("Generate a readiness summary for this trip.", context, request_data, trip_summary_contract())

    def answer_question(self, context: dict[str, Any], request_data: dict[str, Any]) -> dict[str, Any]:
        return self._generate_json(
            "Answer the latest user question about packing, travel preparation, or group logistics. Treat the question as primary and use trip context only as support.",
            context,
            request_data,
            ask_assistant_contract(),
        )

    def generate_destination_insights(self, context: dict[str, Any], request_data: dict[str, Any]) -> dict[str, Any]:
        return self._generate_json(
            "Generate destination-specific travel insights using destination, duration, weather, trip type, and checklist status.",
            context,
            request_data,
            destination_insights_contract(),
        )

    def _generate_json(
        self,
        task: str,
        context: dict[str, Any],
        request_data: dict[str, Any],
        contract: dict[str, Any],
    ) -> dict[str, Any]:
        if not self.api_key:
            raise AIProviderConfigurationError("Gemini API key is not configured. Add GEMINI_API_KEY in backend .env.")

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent"
        payload = {
            "systemInstruction": {"parts": [{"text": SYSTEM_PROMPT}]},
            "contents": [{"role": "user", "parts": [{"text": build_json_prompt(task, context, request_data, contract)}]}],
            "generationConfig": {
                "temperature": self.temperature,
                "responseMimeType": "application/json",
            },
        }

        try:
            with httpx.Client(timeout=20.0) as client:
                response = client.post(url, params={"key": self.api_key}, json=payload)
                response.raise_for_status()
            data = response.json()
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            return extract_json_object(text)
        except (httpx.HTTPError, KeyError, IndexError, json.JSONDecodeError, TypeError) as error:
            raise AIProviderParseError("AI response could not be parsed. Please try again.") from error


def extract_json_object(text: str) -> dict[str, Any]:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?", "", cleaned).strip()
        cleaned = re.sub(r"```$", "", cleaned).strip()

    try:
        parsed = json.loads(cleaned)
        if isinstance(parsed, dict):
            return parsed
    except json.JSONDecodeError:
        pass

    match = re.search(r"\{.*\}", cleaned, flags=re.DOTALL)
    if not match:
        raise json.JSONDecodeError("No JSON object found", cleaned, 0)
    parsed = json.loads(match.group(0))
    if not isinstance(parsed, dict):
        raise json.JSONDecodeError("JSON response is not an object", cleaned, 0)
    return parsed


def get_ai_provider() -> BaseAIProvider:
    requested_provider = settings.AI_PROVIDER.strip().lower()
    if requested_provider == "mock":
        return MockAIProvider()
    if requested_provider == "gemini":
        if not settings.GEMINI_API_KEY:
            raise AIProviderConfigurationError("Gemini API key is not configured. Add GEMINI_API_KEY in backend .env.")
        return GeminiAIProvider()
    raise AIProviderConfigurationError(
        f"Unsupported AI provider '{settings.AI_PROVIDER}'. Use 'gemini' or 'mock'."
    )


def _item(name: str, category: str, quantity: int, priority: str, reason: str, notes: str) -> dict[str, Any]:
    return {
        "name": name,
        "category": category,
        "quantity": quantity,
        "priority": normalize_priority(priority),
        "reason": reason,
        "notes": notes,
    }


def _missing(name: str, category: str, priority: str, reason: str) -> dict[str, Any]:
    return {
        "name": name,
        "category": category,
        "priority": normalize_priority(priority),
        "reason": reason,
    }


def _category_names(context: dict[str, Any]) -> set[str]:
    return {normalize_name(category["name"]) for category in context["categories"]}


def _existing_item_names(context: dict[str, Any]) -> set[str]:
    return {normalize_name(item["name"]) for item in context["items"]}


def _with_known_category(item: dict[str, Any], categories: set[str]) -> dict[str, Any]:
    if normalize_name(item["category"]) in categories:
        return item
    return {**item, "category": "Custom"}


def _context_text(context: dict[str, Any], request_data: dict[str, Any]) -> str:
    trip = context["trip"]
    travel_context = context.get("travel_context", {})
    weather = travel_context.get("weather", {})
    return normalize_name(
        " ".join(
            str(value or "")
            for value in [
                trip.get("title"),
                trip.get("destination"),
                trip.get("trip_type"),
                trip.get("description"),
                travel_context.get("country"),
                weather.get("summary"),
                weather.get("conditions"),
                request_data.get("travel_style"),
                request_data.get("weather_notes"),
                request_data.get("special_needs"),
                request_data.get("extra_instructions"),
                request_data.get("focus"),
                request_data.get("question"),
            ]
        )
    )


def _detect_destination(question: str) -> str | None:
    destinations = {
        "goa": "Goa",
        "vietnam": "Vietnam",
        "manali": "Manali",
        "rajasthan": "Rajasthan",
        "delhi": "Delhi",
        "mumbai": "Mumbai",
        "kerala": "Kerala",
        "maldives": "Maldives",
        "bali": "Bali",
        "thailand": "Thailand",
        "dubai": "Dubai",
        "singapore": "Singapore",
        "europe": "Europe",
        "usa": "USA",
        "japan": "Japan",
        "ladakh": "Ladakh",
        "switzerland": "Switzerland",
    }
    for keyword, destination in destinations.items():
        if keyword in question:
            return destination
    return None


def _detect_trip_type(question: str) -> str | None:
    trip_types = [
        ("beach", "Beach Trip"),
        ("coastal", "Beach Trip"),
        ("swimming", "Beach Trip"),
        ("trek", "Trekking Trip"),
        ("hike", "Trekking Trip"),
        ("mountain", "Mountain Trip"),
        ("business", "Business Trip"),
        ("hackathon", "Hackathon Trip"),
        ("college", "College Trip"),
        ("family", "Family Trip"),
        ("solo", "Solo Trip"),
        ("international", "International Travel"),
        ("city", "City Trip"),
        ("desert", "Desert Trip"),
    ]
    for keyword, trip_type in trip_types:
        if keyword in question:
            return trip_type
    return None


def _extract_duration(question: str) -> int | None:
    match = re.search(r"\b(\d{1,2})\s*(?:day|days|night|nights)\b", question)
    if not match:
        return None
    return max(int(match.group(1)), 1)


def _question_specific_essentials(question: str, destination: str, trip_type: str) -> list[str]:
    essentials = [
        "government ID",
        "phone charger",
        "power bank",
        "basic medicines",
        "reusable water bottle",
    ]
    destination_text = normalize_name(destination)
    combined = f"{question} {destination_text} {normalize_name(trip_type)}"

    if any(word in combined for word in ["goa", "maldives", "beach", "coastal", "island", "swimming"]):
        essentials.extend(["light cotton clothes", "swimwear", "reef-safe sunscreen", "sunglasses", "sandals", "quick-dry towel", "waterproof pouch", "after-sun lotion"])
    if any(word in combined for word in ["vietnam", "international", "tropical", "city"]):
        essentials.extend(["passport", "travel bookings", "travel insurance if applicable", "universal adapter", "light breathable clothes", "rain jacket", "mosquito repellent", "local currency or travel card"])
    if any(word in combined for word in ["manali", "ladakh", "switzerland", "mountain", "trek", "cold", "winter", "snow"]):
        essentials.extend(["thermal wear", "insulated jacket", "hiking shoes", "wool socks", "gloves", "hydration gear", "lip balm"])
    if any(word in combined for word in ["rajasthan", "desert", "summer", "hot"]):
        essentials.extend(["breathable cotton clothes", "wide-brim hat", "sunscreen", "sunglasses", "ORS packets", "scarf"])
    if "business" in combined:
        essentials.extend(["formal outfits", "laptop charger", "presentation documents", "notebook", "business cards"])
    if any(word in combined for word in ["hackathon", "college"]):
        essentials.extend(["laptop charger", "extension board", "ID card", "comfortable hoodie", "shared snacks"])
    if any(word in combined for word in ["monsoon", "rainy", "rain"]):
        essentials.extend(["compact umbrella", "rain jacket", "waterproof footwear", "dry bag"])

    return _dedupe_preserve_order(essentials)


def _format_existing_items(context: dict[str, Any]) -> str:
    if not context["items"]:
        return "no checklist items yet"
    return _comma_list([item["name"] for item in context["items"][:6]])


def _weather_sentence(question: str) -> str:
    if any(word in question for word in ["weather", "rain", "rainy", "monsoon", "cold", "winter", "hot", "summer", "humid"]):
        return "I do not have live weather data yet, so use your latest forecast notes to adjust layers, rain protection, and hydration. "
    return ""


def _weather_context(context: dict[str, Any]) -> dict[str, Any]:
    return context.get("travel_context", {}).get("weather", {}) or {}


def _weather_phrase(weather: dict[str, Any]) -> str:
    if weather.get("available"):
        return weather.get("summary") or "available weather context"
    return weather.get("summary") or "weather data unavailable"


def _contextual_summary(context: dict[str, Any], topic: str) -> str:
    trip = context["trip"]
    travel_context = context.get("travel_context", {})
    checklist = travel_context.get("checklist_summary", {})
    weather = travel_context.get("weather", {})
    destination = travel_context.get("destination") or trip.get("destination")
    duration = travel_context.get("duration_days") or trip.get("duration_days")
    return (
        f"{topic.capitalize()} for {destination}, a {duration}-day {trip.get('trip_type', 'trip')}, "
        f"using weather context ({_weather_phrase(weather)}) and checklist status "
        f"({checklist.get('pending_count', 0)} pending of {checklist.get('total_items', len(context.get('items', [])))} items)."
    )


def _category_readiness(context: dict[str, Any]) -> list[dict[str, Any]]:
    breakdown = context.get("travel_context", {}).get("category_breakdown", [])
    return [
        {
            "category": category.get("category", "Uncategorized"),
            "readiness_score": category.get("readiness_score", 0),
            "total_items": category.get("total_items", 0),
            "pending_items": category.get("pending_items", 0),
        }
        for category in breakdown
    ]


def _top_missing_priorities(context: dict[str, Any]) -> list[str]:
    pending_high = [
        item["name"]
        for item in context.get("items", [])
        if item.get("priority") == "HIGH" and item.get("status") == "PENDING"
    ]
    if pending_high:
        return pending_high[:5]
    if not context.get("items"):
        return ["Government ID", "Phone Charger", "First Aid Kit"]
    return []


def _destination_tips(destination: str, context_text: str) -> list[str]:
    if any(word in context_text for word in ["goa", "maldives", "beach", "island"]):
        return [
            f"For {destination}, keep sunscreen, water, and a quick-dry towel accessible during day outings.",
            "Use waterproof pouches for phone, cash, IDs, and room keys.",
        ]
    if any(word in context_text for word in ["ladakh", "mountain"]):
        return [
            "Keep warm layers, water, and medicines in a day bag because temperatures and altitude comfort can change quickly.",
            "Avoid packing only heavy clothing; use layers that can be added or removed.",
        ]
    if "switzerland" in context_text:
        return [
            "Pack compact luggage for train transfers and changing weather between cities and alpine areas.",
            "Keep a light waterproof layer ready even if the main forecast looks clear.",
        ]
    if "japan" in context_text:
        return [
            "Pack light and organized because station transfers and city walking are easier with compact luggage.",
            "Keep documents, transit cards, and adapters in a quick-access pouch.",
        ]
    return [
        f"For {destination}, keep core documents, chargers, medicines, and weather protection easy to access.",
        "Review the checklist before departure and assign shared items clearly.",
    ]


def _cultural_notes(destination: str, context_text: str) -> list[str]:
    if "japan" in context_text:
        return ["Be mindful of quiet public transport etiquette and carry a small bag for personal trash when bins are limited."]
    if any(word in context_text for word in ["maldives", "goa"]):
        return ["Respect beach, resort, and local community rules, especially around dress expectations outside tourist areas."]
    if "switzerland" in context_text:
        return ["Plan around punctual public transport and keep tickets or passes easy to show."]
    if "ladakh" in context_text:
        return ["Respect local monasteries, landscapes, and altitude-sensitive travel pace."]
    return [f"Check local customs for {destination} and keep group plans respectful and flexible."]


def _common_mistakes(destination: str, context_text: str) -> list[str]:
    if any(word in context_text for word in ["goa", "maldives", "beach", "island"]):
        return ["Underpacking sun protection and overpacking heavy clothes are common beach-trip mistakes."]
    if any(word in context_text for word in ["ladakh", "switzerland", "mountain"]):
        return ["Relying on one heavy jacket instead of layers can make changing temperatures harder to manage."]
    if "japan" in context_text:
        return ["Large, disorganized luggage can make station transfers and hotel changes harder."]
    return [f"A common mistake for {destination} is leaving documents, chargers, and medicines until the final packing pass."]


def _transport_notes(destination: str, context_text: str) -> list[str]:
    if "japan" in context_text:
        return ["Use compact luggage for trains and keep essentials ready during station transfers."]
    if "switzerland" in context_text:
        return ["Keep train passes, booking confirmations, and weather layers handy during intercity or alpine transfers."]
    if any(word in context_text for word in ["goa", "maldives"]):
        return ["Keep sandals, waterproof pouches, and a small day bag ready for beach transfers or boat rides."]
    if "ladakh" in context_text:
        return ["Road transfers can be long, so keep water, snacks, warm layers, and medicines within reach."]
    return [f"Keep tickets, IDs, chargers, and a small day bag accessible while moving around {destination}."]


def _safety_notes(destination: str, context_text: str) -> list[str]:
    if any(word in context_text for word in ["goa", "maldives", "beach", "island"]):
        return ["Stay hydrated, protect against strong sun, and keep electronics dry."]
    if any(word in context_text for word in ["ladakh", "mountain"]):
        return ["Pace activities carefully, hydrate often, and keep warm layers and medicines accessible."]
    if "switzerland" in context_text:
        return ["Watch weather shifts in mountain areas and keep suitable footwear for walks or viewpoints."]
    if "japan" in context_text:
        return ["Keep documents and emergency contacts accessible in crowded transit areas."]
    return [f"For {destination}, keep emergency contacts, medicines, IDs, and charged phones available."]


def _live_data_sentence(question: str) -> str:
    if any(word in question for word in ["visa", "flight", "airline", "baggage", "restriction", "rules", "weather"]):
        return "I do not have live data in this assistant yet, so please verify current rules/weather before travelling."
    return ""


def _asks_document_question(question: str) -> bool:
    return any(word in question for word in ["document", "passport", "visa", "id proof", "international travel", "carry for international"])


def _asks_assignment_question(question: str) -> bool:
    return any(phrase in question for phrase in ["divide packing", "divide items", "assign", "among members", "who should bring"])


def _document_answer(destination: str, trip_destination: str, mismatch_sentence: str, has_asked_destination: bool) -> dict[str, Any]:
    destination_phrase = f" for {destination}" if has_asked_destination else ""
    answer = (
        f"{mismatch_sentence}carry passport if travelling internationally, government ID, tickets or booking confirmations, "
        f"hotel details, emergency contacts, insurance details if applicable, payment cards, and copies of key documents{destination_phrase}. "
        "I do not have live data in this assistant yet, so please verify current rules/weather before travelling."
    )
    if not has_asked_destination:
        answer = (
            f"For your current trip to {trip_destination}, carry government ID, tickets or booking confirmations, hotel details, "
            "emergency contacts, payment cards, and any trip-specific permits or documents. "
            "For international travel, add passport, insurance details if applicable, and verified entry documents. "
            "I do not have live data in this assistant yet, so please verify current rules/weather before travelling."
        )
    return {
        "answer": answer,
        "suggested_actions": [
            "Add government ID under Documents",
            "Add travel bookings under Documents",
            "Add emergency contacts under Documents",
            "Add insurance details under Documents if applicable",
        ],
    }


def _assignment_answer(context: dict[str, Any], mismatch_sentence: str) -> dict[str, Any]:
    members = context["members"]
    items = context["items"]
    member_names = [member["name"] for member in members] or ["Trip Lead", "Member 1", "Member 2"]
    answer = (
        f"{mismatch_sentence}divide packing by ownership and urgency: one person handles documents and bookings, one handles tech and chargers, "
        "one handles medicines and first-aid, and one handles shared food or hygiene items. "
    )
    if items:
        answer += "Assign high-priority pending items first, then split remaining shared items evenly across members."
    else:
        answer += "Create the shared checklist first, then assign each high-priority item to one accountable member."
    return {
        "answer": answer.strip(),
        "suggested_actions": [
            f"Assign documents to {member_names[0]}",
            f"Assign tech items to {member_names[min(1, len(member_names) - 1)]}",
            f"Assign medicines and first-aid to {member_names[min(2, len(member_names) - 1)]}",
        ],
    }


def _action_for_item(item: str) -> str:
    category = "Custom"
    normalized_item = normalize_name(item)
    if any(word in normalized_item for word in ["id", "passport", "booking", "document", "ticket", "insurance", "contacts"]):
        category = "Documents"
    elif any(word in normalized_item for word in ["charger", "power bank", "adapter", "laptop", "camera"]):
        category = "Tech"
    elif any(word in normalized_item for word in ["sunscreen", "sanitizer", "towel", "after-sun", "hygiene"]):
        category = "Hygiene"
    elif any(word in normalized_item for word in ["medicine", "first", "ors", "repellent", "balm"]):
        category = "Medicines"
    elif any(word in normalized_item for word in ["clothes", "swimwear", "jacket", "shoes", "socks", "gloves", "hoodie"]):
        category = "Clothes"
    elif any(word in normalized_item for word in ["snack", "water", "food"]):
        category = "Food"
    elif any(word in normalized_item for word in ["torch", "umbrella", "rain", "dry bag", "waterproof"]):
        category = "Emergency"
    return f"Add {item} under {category}"


def _comma_list(values: list[str]) -> str:
    cleaned = [value for value in values if value]
    if not cleaned:
        return "the essentials"
    if len(cleaned) == 1:
        return cleaned[0]
    return f"{', '.join(cleaned[:-1])}, and {cleaned[-1]}"


def _dedupe_preserve_order(values: list[str]) -> list[str]:
    seen = set()
    result = []
    for value in values:
        normalized_value = normalize_name(value)
        if normalized_value in seen:
            continue
        seen.add(normalized_value)
        result.append(value)
    return result


def _is_travel_question(question: str) -> bool:
    allowed_terms = {
        "pack",
        "packing",
        "travel",
        "trip",
        "checklist",
        "carry",
        "missing",
        "member",
        "assign",
        "safety",
        "document",
        "tech",
        "hygiene",
        "food",
        "snack",
        "emergency",
        "logistics",
        "clothes",
        "medicine",
        "weather",
        "visa",
        "passport",
        "baggage",
        "goa",
        "vietnam",
        "manali",
        "rajasthan",
        "maldives",
        "bali",
        "thailand",
        "dubai",
        "singapore",
        "europe",
        "usa",
        "japan",
        "ladakh",
        "switzerland",
        "beach",
        "trek",
        "business",
        "hackathon",
        "college",
        "international",
    }
    return any(term in question for term in allowed_terms)
