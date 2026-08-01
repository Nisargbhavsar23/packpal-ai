import uuid
from collections.abc import Callable
from typing import Any, TypeVar

from fastapi import HTTPException, status
from fastapi.encoders import jsonable_encoder
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.ai_suggestion import AISuggestion
from app.models.category import Category
from app.models.item import Item
from app.models.trip import Trip
from app.models.trip_member import TripMember
from app.models.user import User
from app.schemas.ai import (
    AISuggestionHistoryItem,
    ApplyItemsRequest,
    ApplyItemsResponse,
    AskAssistantRequest,
    AskAssistantResponse,
    BudgetPlanRequest,
    BudgetPlanResponse,
    DestinationInsightsResponse,
    GroupPackingAnalysisResponse,
    MissingEssentialsRequest,
    MissingEssentialsResponse,
    PackingListRequest,
    PackingListResponse,
    TravelReadinessResponse,
    SkippedSuggestedItem,
    TripSummaryRequest,
    TripSummaryResponse,
)
from app.schemas.item import ItemRead, UserBasicRead
from app.services.ai_provider import (
    AIProviderConfigurationError,
    AIProviderError,
    AIProviderParseError,
    get_ai_provider,
    normalize_name,
)
from app.services.category_service import ensure_default_categories, get_category_by_name
from app.services.readiness_engine import build_readiness_dashboard
from app.services.trip_service import ensure_trip_admin_or_owner, ensure_trip_member
from app.services.travel_context_service import build_travel_context
from app.services.weather_service import get_weather_context

T = TypeVar("T")


def run_ai_provider(provider_call: Callable[[], dict[str, Any]]) -> dict[str, Any]:
    try:
        return provider_call()
    except AIProviderConfigurationError as error:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(error)) from error
    except AIProviderParseError as error:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(error)) from error
    except AIProviderError as error:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="AI provider request failed. Please try again.") from error


def validate_ai_response(response_factory: Callable[[], T]) -> T:
    try:
        return response_factory()
    except ValidationError as error:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="AI response could not be parsed. Please try again.") from error


def generate_packing_list(
    db: Session,
    trip_id: uuid.UUID,
    request_data: PackingListRequest,
    current_user: User,
) -> PackingListResponse:
    context = build_trip_ai_context(db, trip_id, current_user)
    provider = get_ai_provider()
    payload = jsonable_encoder(request_data)
    output = run_ai_provider(lambda: provider.generate_packing_list(context, payload))
    output["items"] = filter_existing_suggested_items(output.get("items", []), context)

    response_data = {
        "provider": provider.provider_name,
        "provider_note": provider.provider_note,
        "type": "PACKING_LIST",
        **output,
    }
    response = validate_ai_response(lambda: PackingListResponse(suggestion_id=uuid.uuid4(), **response_data))
    suggestion = save_ai_suggestion(db, trip_id, "PACKING_LIST", payload, response_data, provider.provider_name)
    return response.model_copy(update={"suggestion_id": suggestion.id})


def find_missing_essentials(
    db: Session,
    trip_id: uuid.UUID,
    request_data: MissingEssentialsRequest,
    current_user: User,
) -> MissingEssentialsResponse:
    context = build_trip_ai_context(db, trip_id, current_user)
    provider = get_ai_provider()
    payload = jsonable_encoder(request_data)
    output = run_ai_provider(lambda: provider.find_missing_essentials(context, payload))
    output["missing_items"] = filter_existing_suggested_items(output.get("missing_items", []), context)

    response_data = {
        "provider": provider.provider_name,
        "provider_note": provider.provider_note,
        "type": "MISSING_ESSENTIALS",
        **output,
    }
    response = validate_ai_response(lambda: MissingEssentialsResponse(suggestion_id=uuid.uuid4(), **response_data))
    suggestion = save_ai_suggestion(db, trip_id, "MISSING_ESSENTIALS", payload, response_data, provider.provider_name)
    return response.model_copy(update={"suggestion_id": suggestion.id})


def generate_trip_summary(
    db: Session,
    trip_id: uuid.UUID,
    request_data: TripSummaryRequest,
    current_user: User,
) -> TripSummaryResponse:
    context = build_trip_ai_context(db, trip_id, current_user)
    provider = get_ai_provider()
    payload = jsonable_encoder(request_data)
    output = run_ai_provider(lambda: provider.generate_trip_summary(context, payload))

    response_data = {
        "provider": provider.provider_name,
        "provider_note": provider.provider_note,
        "type": "TRIP_SUMMARY",
        **output,
    }
    response = validate_ai_response(lambda: TripSummaryResponse(suggestion_id=uuid.uuid4(), **response_data))
    suggestion = save_ai_suggestion(db, trip_id, "TRIP_SUMMARY", payload, response_data, provider.provider_name)
    return response.model_copy(update={"suggestion_id": suggestion.id})


def ask_assistant(
    db: Session,
    trip_id: uuid.UUID,
    request_data: AskAssistantRequest,
    current_user: User,
) -> AskAssistantResponse:
    context = build_trip_ai_context(db, trip_id, current_user)
    provider = get_ai_provider()
    payload = jsonable_encoder(request_data)
    output = run_ai_provider(lambda: provider.answer_question(context, payload))

    response_data = {
        "provider": provider.provider_name,
        "provider_note": provider.provider_note,
        "type": "ASK_ASSISTANT",
        **output,
    }
    response = validate_ai_response(lambda: AskAssistantResponse(suggestion_id=uuid.uuid4(), **response_data))
    suggestion = save_ai_suggestion(db, trip_id, "ASK_ASSISTANT", payload, response_data, provider.provider_name)
    return response.model_copy(update={"suggestion_id": suggestion.id})


def generate_destination_insights(
    db: Session,
    trip_id: uuid.UUID,
    current_user: User,
) -> DestinationInsightsResponse:
    context = build_trip_ai_context(db, trip_id, current_user)
    provider = get_ai_provider()
    payload: dict[str, Any] = {}
    output = run_ai_provider(lambda: provider.generate_destination_insights(context, payload))

    response_data = {
        "provider": provider.provider_name,
        "provider_note": provider.provider_note,
        "type": "DESTINATION_INSIGHTS",
        **output,
    }
    response = validate_ai_response(lambda: DestinationInsightsResponse(suggestion_id=uuid.uuid4(), **response_data))
    suggestion = save_ai_suggestion(db, trip_id, "DESTINATION_INSIGHTS", payload, response_data, provider.provider_name)
    return response.model_copy(update={"suggestion_id": suggestion.id})


def generate_readiness_dashboard(
    db: Session,
    trip_id: uuid.UUID,
    current_user: User,
) -> TravelReadinessResponse:
    context = build_trip_ai_context(db, trip_id, current_user)
    provider = get_ai_provider()
    payload = {"intent": "travel_readiness"}
    ai_analysis = run_ai_provider(lambda: provider.analyze_travel_readiness(context, payload))
    dashboard = build_readiness_dashboard(context, ai_analysis)
    return validate_ai_response(lambda: TravelReadinessResponse(**dashboard))


def generate_risk_analysis(db: Session, trip_id: uuid.UUID, current_user: User):
    return generate_readiness_dashboard(db=db, trip_id=trip_id, current_user=current_user).top_risks


def generate_alerts(db: Session, trip_id: uuid.UUID, current_user: User):
    return generate_readiness_dashboard(db=db, trip_id=trip_id, current_user=current_user).alerts


def generate_recommendations(db: Session, trip_id: uuid.UUID, current_user: User) -> list[str]:
    return generate_readiness_dashboard(db=db, trip_id=trip_id, current_user=current_user).recommendations


def analyze_group_packing(
    db: Session,
    trip_id: uuid.UUID,
    current_user: User,
) -> GroupPackingAnalysisResponse:
    context = build_trip_ai_context(db, trip_id, current_user)
    provider = get_ai_provider()
    payload: dict[str, Any] = {}
    output = run_ai_provider(lambda: provider.analyze_group_packing(context, payload))

    response_data = {
        "provider": provider.provider_name,
        "provider_note": provider.provider_note,
        "type": "GROUP_PACKING_ANALYSIS",
        **output,
    }
    response = validate_ai_response(lambda: GroupPackingAnalysisResponse(suggestion_id=uuid.uuid4(), **response_data))
    suggestion = save_ai_suggestion(db, trip_id, "GROUP_PACKING_ANALYSIS", payload, response_data, provider.provider_name)
    return response.model_copy(update={"suggestion_id": suggestion.id})


def generate_budget_plan(
    db: Session,
    trip_id: uuid.UUID,
    request_data: BudgetPlanRequest,
    current_user: User,
) -> BudgetPlanResponse:
    context = build_trip_ai_context(db, trip_id, current_user)
    provider = get_ai_provider()
    payload = request_data.model_dump()
    output = run_ai_provider(lambda: provider.generate_budget_plan(context, payload))

    response_data = {
        "provider": provider.provider_name,
        "provider_note": provider.provider_note,
        "type": "BUDGET_PLAN",
        **output,
    }
    response = validate_ai_response(lambda: BudgetPlanResponse(suggestion_id=uuid.uuid4(), **response_data))
    suggestion = save_ai_suggestion(db, trip_id, "BUDGET_PLAN", payload, response_data, provider.provider_name)
    return response.model_copy(update={"suggestion_id": suggestion.id})


def list_ai_suggestions(
    db: Session,
    trip_id: uuid.UUID,
    current_user: User,
    suggestion_type: str | None = None,
) -> list[AISuggestionHistoryItem]:
    ensure_trip_exists(db, trip_id)
    ensure_trip_member(db, trip_id, current_user.id)
    query = select(AISuggestion).where(AISuggestion.trip_id == trip_id)
    if suggestion_type:
        query = query.where(AISuggestion.suggestion_type == suggestion_type)
    suggestions = db.scalars(query.order_by(AISuggestion.created_at.desc()).limit(20)).all()
    return [AISuggestionHistoryItem.model_validate(suggestion, from_attributes=True) for suggestion in suggestions]


def apply_suggested_items(
    db: Session,
    trip_id: uuid.UUID,
    request_data: ApplyItemsRequest,
    current_user: User,
) -> ApplyItemsResponse:
    ensure_trip_exists(db, trip_id)
    ensure_trip_admin_or_owner(db, trip_id, current_user.id)
    suggestion = db.get(AISuggestion, request_data.suggestion_id)
    if suggestion is None or suggestion.trip_id != trip_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="AI suggestion not found for this trip",
        )

    ensure_default_categories(db)
    custom_category = resolve_category(db, "Custom")
    existing_names = {
        normalize_name(name)
        for name in db.scalars(select(Item.name).where(Item.trip_id == trip_id)).all()
    }

    created_items: list[ItemRead] = []
    skipped_items: list[SkippedSuggestedItem] = []

    for suggested_item in request_data.items:
        normalized_item_name = normalize_name(suggested_item.name)
        if normalized_item_name in existing_names:
            skipped_items.append(SkippedSuggestedItem(name=suggested_item.name, reason="Item already exists in this trip."))
            continue

        category = resolve_category(db, suggested_item.category) or custom_category
        item = Item(
            trip_id=trip_id,
            category_id=category.id,
            name=suggested_item.name,
            quantity=suggested_item.quantity,
            priority=suggested_item.priority,
            created_by_id=current_user.id,
            notes=suggested_item.notes,
        )
        db.add(item)
        db.flush()
        existing_names.add(normalized_item_name)
        created_items.append(_build_item_read(item, category=category, created_by=current_user))

    db.commit()

    return ApplyItemsResponse(
        message="Selected AI suggestions were added to the checklist.",
        created_items=created_items,
        skipped_items=skipped_items,
    )


def build_trip_ai_context(db: Session, trip_id: uuid.UUID, current_user: User) -> dict[str, Any]:
    trip = db.scalar(
        select(Trip)
        .options(
            selectinload(Trip.members).selectinload(TripMember.user),
            selectinload(Trip.items).selectinload(Item.category),
            selectinload(Trip.items).selectinload(Item.assigned_user),
        )
        .where(Trip.id == trip_id)
    )
    if trip is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")

    ensure_trip_member(db, trip_id, current_user.id)
    categories = list(db.scalars(select(Category).order_by(Category.name.asc())).all())
    duration_days = max((trip.end_date - trip.start_date).days + 1, 1)
    weather_context = get_weather_context(trip.destination, trip.start_date, trip.end_date)
    travel_context = build_travel_context(trip, weather_context)

    return {
        "trip": {
            "id": str(trip.id),
            "title": trip.title,
            "destination": trip.destination,
            "trip_type": trip.trip_type,
            "start_date": trip.start_date.isoformat(),
            "end_date": trip.end_date.isoformat(),
            "duration_days": duration_days,
            "description": trip.description,
        },
        "members": [
            {
                "user_id": str(member.user_id),
                "name": member.user.name,
                "email": member.user.email,
                "role": member.role.value,
            }
            for member in trip.members
        ],
        "items": [
            {
                "id": str(item.id),
                "name": item.name,
                "category": item.category.name,
                "quantity": item.quantity,
                "priority": item.priority.value,
                "status": item.status.value,
                "assigned_to_id": str(item.assigned_to_id) if item.assigned_to_id else None,
                "assigned_to_name": item.assigned_user.name if item.assigned_user else None,
                "due_date": item.due_date.isoformat() if item.due_date else None,
                "notes": item.notes,
            }
            for item in trip.items
        ],
        "categories": [{"id": str(category.id), "name": category.name} for category in categories],
        "existing_items": [item.name for item in trip.items],
        "travel_context": travel_context,
    }


def save_ai_suggestion(
    db: Session,
    trip_id: uuid.UUID,
    suggestion_type: str,
    input_data: dict[str, Any],
    output_data: dict[str, Any],
    provider: str,
) -> AISuggestion:
    suggestion = AISuggestion(
        trip_id=trip_id,
        suggestion_type=suggestion_type,
        input_data=jsonable_encoder(input_data),
        output_data=jsonable_encoder(output_data),
        provider=provider,
    )
    db.add(suggestion)
    db.commit()
    db.refresh(suggestion)
    return suggestion


def ensure_trip_exists(db: Session, trip_id: uuid.UUID) -> None:
    if db.get(Trip, trip_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")


def filter_existing_suggested_items(items: list[dict[str, Any]], context: dict[str, Any]) -> list[dict[str, Any]]:
    existing_names = _existing_context_item_names(context)
    filtered_items = []
    seen_names = set()
    for item in items:
        normalized_name = normalize_name(str(item.get("name", "")))
        if not normalized_name or normalized_name in existing_names or normalized_name in seen_names:
            continue
        seen_names.add(normalized_name)
        filtered_items.append(item)
    return filtered_items


def _existing_context_item_names(context: dict[str, Any]) -> set[str]:
    return {normalize_name(item["name"]) for item in context.get("items", []) if item.get("name")}


def resolve_category(db: Session, category_name: str) -> Category | None:
    category = get_category_by_name(db, category_name)
    if category is not None:
        return category
    return get_category_by_name(db, "Custom")


def _build_user_basic(user: User) -> UserBasicRead:
    return UserBasicRead(id=user.id, name=user.name, email=user.email)


def _build_item_read(item: Item, category: Category, created_by: User) -> ItemRead:
    return ItemRead(
        id=item.id,
        trip_id=item.trip_id,
        category_id=category.id,
        category_name=category.name,
        name=item.name,
        quantity=item.quantity,
        priority=item.priority,
        status=item.status,
        assigned_to=None,
        created_by=_build_user_basic(created_by),
        due_date=item.due_date,
        notes=item.notes,
        created_at=item.created_at,
        updated_at=item.updated_at,
    )
