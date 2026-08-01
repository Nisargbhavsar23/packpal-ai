from datetime import date
from typing import Any

FIXED_CATEGORIES = [
    "Documents",
    "Clothing",
    "Electronics",
    "Medical",
    "Safety",
    "Toiletries",
    "Transportation",
    "Miscellaneous",
]

CATEGORY_ALIASES = {
    "clothes": "Clothing",
    "clothing": "Clothing",
    "tech": "Electronics",
    "electronics": "Electronics",
    "hygiene": "Toiletries",
    "toiletries": "Toiletries",
    "emergency": "Safety",
    "safety": "Safety",
    "food": "Miscellaneous",
    "documents": "Documents",
    "medical": "Medical",
    "medicines": "Medical",
    "transportation": "Transportation",
}

BASE_REQUIRED_ESSENTIALS = {
    "Documents": ["government id", "ticket", "booking"],
    "Clothing": ["clothes"],
    "Electronics": ["charger", "power bank"],
    "Medical": ["first aid", "medicine"],
    "Safety": ["emergency contact"],
    "Toiletries": ["sanitizer", "toothbrush"],
    "Transportation": ["ticket", "booking"],
    "Miscellaneous": ["water", "cash"],
}


def build_readiness_dashboard(context: dict[str, Any], ai_analysis: dict[str, Any] | None = None) -> dict[str, Any]:
    ai_analysis = ai_analysis or {}
    category_scores = build_category_scores(context)
    overall_score = calculate_overall_score(context, category_scores)
    alerts = build_alerts(context)
    top_risks = normalize_risks(ai_analysis.get("top_risks")) or build_deterministic_risks(context)
    recommendations = normalize_recommendations(ai_analysis.get("recommendations")) or build_deterministic_recommendations(context)

    return {
        "overall_score": overall_score,
        "status": readiness_status(overall_score),
        "category_scores": category_scores,
        "top_risks": top_risks[:5],
        "alerts": alerts[:8],
        "recommendations": recommendations[:5],
    }


def calculate_overall_score(context: dict[str, Any], category_scores: dict[str, dict[str, Any]]) -> int:
    items = context.get("items", [])
    total_items = len(items)
    packed_or_delivered = sum(1 for item in items if item.get("status") in {"PACKED", "DELIVERED"})
    completion_score = 0 if total_items == 0 else (packed_or_delivered / total_items) * 40

    required = required_essentials_for_context(context)
    required_total = sum(len(values) for values in required.values())
    required_found = sum(count_matched_essentials(context, values) for values in required.values())
    essentials_score = 0 if required_total == 0 else (required_found / required_total) * 30

    category_average = sum(category["score"] for category in category_scores.values()) / max(len(category_scores), 1)
    category_score = category_average * 0.3

    penalty = (high_priority_pending_count(context) * 4) + (overdue_item_count(context) * 6)
    return clamp_score(round(completion_score + essentials_score + category_score - penalty))


def build_category_scores(context: dict[str, Any]) -> dict[str, dict[str, Any]]:
    items_by_category = {category: [] for category in FIXED_CATEGORIES}
    for item in context.get("items", []):
        items_by_category.setdefault(normalize_category(item.get("category")), []).append(item)

    required = required_essentials_for_context(context)
    scores = {}
    for category in FIXED_CATEGORIES:
        category_items = items_by_category.get(category, [])
        required_terms = required.get(category, [])
        matched_required = count_matched_essentials(context, required_terms)
        required_score = 50 if not required_terms else (matched_required / len(required_terms)) * 50

        if category_items:
            ready_items = sum(1 for item in category_items if item.get("status") in {"PACKED", "DELIVERED"})
            item_score = (ready_items / len(category_items)) * 40
        else:
            item_score = 0

        category_penalty = sum(8 for item in category_items if item.get("priority") == "HIGH" and item.get("status") == "PENDING")
        category_penalty += sum(8 for item in category_items if is_overdue(item))
        score = clamp_score(round(required_score + item_score + 10 - category_penalty))
        scores[category] = {"score": score, "status": category_status(score)}
    return scores


def build_alerts(context: dict[str, Any]) -> list[dict[str, str]]:
    alerts = []
    days_until_start = trip_starts_in_days(context)
    if days_until_start is not None and days_until_start >= 0:
        priority = "HIGH" if days_until_start <= 2 else "MEDIUM" if days_until_start <= 7 else "LOW"
        alerts.append({"priority": priority, "message": f"Trip starts in {days_until_start} day{'s' if days_until_start != 1 else ''}."})

    high_pending = [item for item in context.get("items", []) if item.get("priority") == "HIGH" and item.get("status") == "PENDING"]
    if high_pending:
        alerts.append({"priority": "HIGH", "message": f"{len(high_pending)} high-priority item{'s are' if len(high_pending) != 1 else ' is'} still pending."})

    required = required_essentials_for_context(context)
    if count_matched_essentials(context, required.get("Documents", [])) == 0:
        alerts.append({"priority": "HIGH", "message": "No travel documents detected."})
    if not has_any_item(context, ["first aid", "medicine", "medical"]):
        alerts.append({"priority": "MEDIUM", "message": "No medical kit detected."})
    if should_pack_rain_protection(context) and not has_any_item(context, ["umbrella", "rain jacket", "poncho", "waterproof"]):
        alerts.append({"priority": "MEDIUM", "message": "Weather indicates rain, but rain protection is missing."})
    if is_cold_destination(context) and not has_any_item(context, ["thermal", "jacket", "gloves", "warm layer"]):
        alerts.append({"priority": "HIGH", "message": "Cold destination without thermal clothing detected."})
    if is_international_context(context) and not has_any_item(context, ["adapter", "universal adapter"]):
        alerts.append({"priority": "MEDIUM", "message": "No power adapter detected for international travel."})
    return alerts


def build_deterministic_risks(context: dict[str, Any]) -> list[dict[str, str]]:
    risks = []
    if not has_any_item(context, ["passport", "government id", "id"]):
        risks.append({"severity": "HIGH", "title": "Travel Document Missing", "description": "No travel document appears in the checklist."})
    if high_priority_pending_count(context):
        risks.append({"severity": "HIGH", "title": "High Priority Items Pending", "description": "Important checklist items still need attention."})
    if should_pack_rain_protection(context) and not has_any_item(context, ["umbrella", "rain jacket", "poncho", "waterproof"]):
        risks.append({"severity": "MEDIUM", "title": "Rain Protection Missing", "description": "Weather context indicates rain risk but no rain item was found."})
    if is_cold_destination(context) and not has_any_item(context, ["thermal", "jacket", "gloves"]):
        risks.append({"severity": "HIGH", "title": "Cold Weather Gear Missing", "description": "The destination or weather suggests cold conditions without warm gear."})
    if not risks:
        risks.append({"severity": "LOW", "title": "Low Immediate Risk", "description": "No major readiness risk was detected from the current checklist."})
    return risks


def build_deterministic_recommendations(context: dict[str, Any]) -> list[str]:
    destination = context.get("travel_context", {}).get("destination") or context.get("trip", {}).get("destination") or "the trip"
    recommendations = []
    if not has_any_item(context, ["passport", "government id", "id"]):
        recommendations.append(f"Add travel documents for {destination}.")
    if not has_any_item(context, ["first aid", "medicine"]):
        recommendations.append("Add a first aid kit and regular medicines.")
    if is_cold_destination(context) and not has_any_item(context, ["thermal", "jacket"]):
        recommendations.append(f"Pack thermal wear and an insulated jacket for {destination}.")
    if is_beach_destination(context) and not has_any_item(context, ["sunscreen", "swimwear"]):
        recommendations.append(f"Add sunscreen and swimwear for {destination}.")
    if is_international_context(context) and not has_any_item(context, ["adapter"]):
        recommendations.append("Carry a universal power adapter.")
    if should_pack_rain_protection(context) and not has_any_item(context, ["umbrella", "rain jacket", "waterproof"]):
        recommendations.append("Add rain protection based on the weather context.")
    recommendations.append("Review pending high-priority items with the group.")
    return dedupe(recommendations)[:5]


def required_essentials_for_context(context: dict[str, Any]) -> dict[str, list[str]]:
    required = {category: list(values) for category, values in BASE_REQUIRED_ESSENTIALS.items()}
    if is_international_context(context):
        required["Documents"].extend(["passport", "insurance"])
        required["Electronics"].append("adapter")
    if is_beach_destination(context):
        required["Clothing"].extend(["swimwear", "sandals"])
        required["Toiletries"].append("sunscreen")
        required["Safety"].append("waterproof")
    if is_cold_destination(context):
        required["Clothing"].extend(["thermal", "jacket", "gloves"])
        required["Medical"].append("lip balm")
    if is_trekking_context(context):
        required["Clothing"].append("hiking shoes")
        required["Medical"].append("first aid")
        required["Miscellaneous"].append("hydration")
    if should_pack_rain_protection(context):
        required["Safety"].extend(["umbrella", "rain jacket", "waterproof"])
    return {category: dedupe(values) for category, values in required.items()}


def readiness_status(score: int) -> str:
    if score <= 39:
        return "Not Ready"
    if score <= 69:
        return "Needs Attention"
    if score <= 89:
        return "Almost Ready"
    return "Ready To Travel"


def category_status(score: int) -> str:
    if score >= 90:
        return "Complete"
    if score >= 70:
        return "Almost Ready"
    if score >= 40:
        return "Needs Attention"
    return "Weak"


def normalize_category(category: str | None) -> str:
    normalized = (category or "Miscellaneous").strip().lower()
    return CATEGORY_ALIASES.get(normalized, category or "Miscellaneous")


def count_matched_essentials(context: dict[str, Any], terms: list[str]) -> int:
    return sum(1 for term in terms if has_any_item(context, [term]))


def has_any_item(context: dict[str, Any], terms: list[str]) -> bool:
    item_names = " ".join(item.get("name", "") for item in context.get("items", [])).lower()
    return any(term.lower() in item_names for term in terms)


def high_priority_pending_count(context: dict[str, Any]) -> int:
    return sum(1 for item in context.get("items", []) if item.get("priority") == "HIGH" and item.get("status") == "PENDING")


def overdue_item_count(context: dict[str, Any]) -> int:
    return sum(1 for item in context.get("items", []) if is_overdue(item))


def is_overdue(item: dict[str, Any]) -> bool:
    due_date = item.get("due_date")
    if not due_date or item.get("status") in {"PACKED", "DELIVERED"}:
        return False
    return date.fromisoformat(due_date) < date.today()


def trip_starts_in_days(context: dict[str, Any]) -> int | None:
    start_date = context.get("travel_context", {}).get("trip_start_date") or context.get("trip", {}).get("start_date")
    if not start_date:
        return None
    return (date.fromisoformat(start_date) - date.today()).days


def context_text(context: dict[str, Any]) -> str:
    trip = context.get("trip", {})
    travel_context = context.get("travel_context", {})
    weather = travel_context.get("weather", {})
    return " ".join(
        str(value or "").lower()
        for value in [
            trip.get("destination"),
            trip.get("trip_type"),
            trip.get("description"),
            travel_context.get("destination"),
            travel_context.get("country"),
            weather.get("summary"),
            weather.get("conditions"),
        ]
    )


def is_international_context(context: dict[str, Any]) -> bool:
    text = context_text(context)
    country = (context.get("travel_context", {}).get("country") or "").lower()
    return any(word in text for word in ["international", "japan", "switzerland", "maldives", "vietnam", "thailand"]) or country not in {"", "unknown", "india"}


def is_beach_destination(context: dict[str, Any]) -> bool:
    return any(word in context_text(context) for word in ["goa", "maldives", "beach", "island", "coastal"])


def is_cold_destination(context: dict[str, Any]) -> bool:
    return any(word in context_text(context) for word in ["ladakh", "switzerland", "cold", "snow", "winter", "mountain"])


def is_trekking_context(context: dict[str, Any]) -> bool:
    return any(word in context_text(context) for word in ["trek", "hike", "ladakh", "mountain"])


def should_pack_rain_protection(context: dict[str, Any]) -> bool:
    weather = context.get("travel_context", {}).get("weather", {})
    rain_probability = weather.get("rain_probability") or 0
    return rain_probability >= 50 or any(word in context_text(context) for word in ["rain", "monsoon", "drizzle"])


def normalize_risks(risks: Any) -> list[dict[str, str]]:
    normalized = []
    for risk in risks or []:
        severity = str(risk.get("severity", "LOW")).upper()
        if severity not in {"HIGH", "MEDIUM", "LOW"}:
            severity = "LOW"
        title = str(risk.get("title") or "Travel readiness risk").strip()
        description = str(risk.get("description") or "Review this item before travel.").strip()
        normalized.append({"severity": severity, "title": title, "description": description})
    return normalized


def normalize_recommendations(recommendations: Any) -> list[str]:
    return dedupe([str(recommendation).strip() for recommendation in recommendations or [] if str(recommendation).strip()])


def dedupe(values: list[str]) -> list[str]:
    seen = set()
    result = []
    for value in values:
        key = value.lower()
        if key in seen:
            continue
        seen.add(key)
        result.append(value)
    return result


def clamp_score(score: int) -> int:
    return max(0, min(100, score))
