from collections import defaultdict
from typing import Any

from app.models.enums import ItemStatus
from app.models.item import Item
from app.models.trip import Trip


COUNTRY_HINTS = {
    "goa": "India",
    "ladakh": "India",
    "manali": "India",
    "rajasthan": "India",
    "delhi": "India",
    "mumbai": "India",
    "kerala": "India",
    "maldives": "Maldives",
    "switzerland": "Switzerland",
    "japan": "Japan",
    "vietnam": "Vietnam",
    "thailand": "Thailand",
    "bali": "Indonesia",
    "dubai": "United Arab Emirates",
    "singapore": "Singapore",
}


def build_travel_context(trip: Trip, weather: dict[str, Any] | None = None) -> dict[str, Any]:
    items = list(trip.items)
    total_items = len(items)
    packed_count = sum(1 for item in items if item.status == ItemStatus.PACKED)
    delivered_count = sum(1 for item in items if item.status == ItemStatus.DELIVERED)
    pending_count = sum(1 for item in items if item.status == ItemStatus.PENDING)
    duration_days = max((trip.end_date - trip.start_date).days + 1, 1)

    return {
        "destination": trip.destination,
        "country": infer_country(trip.destination),
        "trip_start_date": trip.start_date.isoformat(),
        "trip_end_date": trip.end_date.isoformat(),
        "duration_days": duration_days,
        "trip_type": trip.trip_type,
        "weather": weather or unavailable_weather("Weather was not requested."),
        "checklist_summary": {
            "total_items": total_items,
            "packed_count": packed_count,
            "delivered_count": delivered_count,
            "pending_count": pending_count,
            "readiness_score": 0 if total_items == 0 else round(((packed_count + delivered_count) / total_items) * 100),
            "high_priority_pending_count": sum(
                1 for item in items if item.priority.value == "HIGH" and item.status == ItemStatus.PENDING
            ),
        },
        "category_breakdown": build_category_breakdown(items),
    }


def infer_country(destination: str | None) -> str:
    normalized_destination = (destination or "").strip().lower()
    for keyword, country in COUNTRY_HINTS.items():
        if keyword in normalized_destination:
            return country
    return "Unknown"


def build_category_breakdown(items: list[Item]) -> list[dict[str, Any]]:
    grouped_items: dict[str, list[Item]] = defaultdict(list)
    for item in items:
        grouped_items[item.category.name if item.category else "Uncategorized"].append(item)

    breakdown = []
    for category_name, category_items in sorted(grouped_items.items()):
        total = len(category_items)
        packed = sum(1 for item in category_items if item.status == ItemStatus.PACKED)
        delivered = sum(1 for item in category_items if item.status == ItemStatus.DELIVERED)
        pending = sum(1 for item in category_items if item.status == ItemStatus.PENDING)
        breakdown.append(
            {
                "category": category_name,
                "total_items": total,
                "packed_items": packed,
                "delivered_items": delivered,
                "pending_items": pending,
                "readiness_score": 0 if total == 0 else round(((packed + delivered) / total) * 100),
            }
        )
    return breakdown


def unavailable_weather(reason: str) -> dict[str, Any]:
    return {
        "available": False,
        "summary": reason,
        "expected_temperature": None,
        "conditions": None,
        "rain_probability": None,
        "wind_conditions": None,
    }
