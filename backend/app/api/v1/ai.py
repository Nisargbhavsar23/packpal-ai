import uuid

from fastapi import APIRouter, Body, Depends, Query
from sqlalchemy.orm import Session

from app.core.deps import get_current_active_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.ai import (
    AISuggestionHistoryItem,
    ApplyItemsRequest,
    ApplyItemsResponse,
    AskAssistantRequest,
    AskAssistantResponse,
    DestinationInsightsResponse,
    MissingEssentialsRequest,
    MissingEssentialsResponse,
    PackingListRequest,
    PackingListResponse,
    TripSummaryRequest,
    TripSummaryResponse,
)
from app.services.ai_assistant_service import (
    apply_suggested_items,
    ask_assistant,
    find_missing_essentials,
    generate_destination_insights,
    generate_packing_list,
    generate_trip_summary,
    list_ai_suggestions,
)

router = APIRouter(prefix="/trips/{trip_id}/ai")


@router.post("/packing-list", response_model=PackingListResponse)
def generate_packing_list_endpoint(
    trip_id: uuid.UUID,
    request_data: PackingListRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return generate_packing_list(db=db, trip_id=trip_id, request_data=request_data, current_user=current_user)


@router.post("/missing-essentials", response_model=MissingEssentialsResponse)
def missing_essentials_endpoint(
    trip_id: uuid.UUID,
    request_data: MissingEssentialsRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return find_missing_essentials(db=db, trip_id=trip_id, request_data=request_data, current_user=current_user)


@router.post("/trip-summary", response_model=TripSummaryResponse)
def trip_summary_endpoint(
    trip_id: uuid.UUID,
    request_data: TripSummaryRequest | None = Body(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return generate_trip_summary(
        db=db,
        trip_id=trip_id,
        request_data=request_data or TripSummaryRequest(),
        current_user=current_user,
    )


@router.post("/ask", response_model=AskAssistantResponse)
def ask_assistant_endpoint(
    trip_id: uuid.UUID,
    request_data: AskAssistantRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return ask_assistant(db=db, trip_id=trip_id, request_data=request_data, current_user=current_user)


@router.get("/destination-insights", response_model=DestinationInsightsResponse)
def destination_insights_endpoint(
    trip_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return generate_destination_insights(db=db, trip_id=trip_id, current_user=current_user)


@router.get("/suggestions", response_model=list[AISuggestionHistoryItem])
def list_ai_suggestions_endpoint(
    trip_id: uuid.UUID,
    suggestion_type: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return list_ai_suggestions(
        db=db,
        trip_id=trip_id,
        current_user=current_user,
        suggestion_type=suggestion_type,
    )


@router.post("/apply-items", response_model=ApplyItemsResponse)
def apply_items_endpoint(
    trip_id: uuid.UUID,
    request_data: ApplyItemsRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return apply_suggested_items(db=db, trip_id=trip_id, request_data=request_data, current_user=current_user)
