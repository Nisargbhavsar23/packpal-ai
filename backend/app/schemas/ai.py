import uuid
from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator

from app.models.enums import ItemPriority
from app.schemas.item import ItemRead

SuggestionType = Literal["PACKING_LIST", "MISSING_ESSENTIALS", "TRIP_SUMMARY", "ASK_ASSISTANT", "DESTINATION_INSIGHTS"]


class PackingListRequest(BaseModel):
    travel_style: str | None = None
    weather_notes: str | None = None
    special_needs: str | None = None
    extra_instructions: str | None = None


class MissingEssentialsRequest(BaseModel):
    focus: str | None = None


class TripSummaryRequest(BaseModel):
    detail_level: str | None = "concise"


class AskAssistantRequest(BaseModel):
    question: str

    @field_validator("question")
    @classmethod
    def validate_question(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Question cannot be empty")
        return value


class AISuggestedItem(BaseModel):
    name: str
    category: str
    quantity: int = Field(default=1, ge=1)
    priority: ItemPriority = ItemPriority.MEDIUM
    reason: str | None = None
    notes: str | None = None

    @field_validator("name", "category")
    @classmethod
    def validate_required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field cannot be empty")
        return value


class AIMissingItem(BaseModel):
    name: str
    category: str
    priority: ItemPriority = ItemPriority.MEDIUM
    reason: str


class MemberAssignmentSummary(BaseModel):
    member_name: str
    assigned_items: int
    pending_items: int


class CategoryReadinessSummary(BaseModel):
    category: str
    readiness_score: int = Field(ge=0, le=100)
    total_items: int = 0
    pending_items: int = 0


class AIBaseResponse(BaseModel):
    suggestion_id: uuid.UUID
    provider: str
    type: SuggestionType
    provider_note: str | None = None


class PackingListResponse(AIBaseResponse):
    type: Literal["PACKING_LIST"] = "PACKING_LIST"
    summary: str
    items: list[AISuggestedItem]


class MissingEssentialsResponse(AIBaseResponse):
    type: Literal["MISSING_ESSENTIALS"] = "MISSING_ESSENTIALS"
    summary: str
    missing_items: list[AIMissingItem]


class TripSummaryResponse(AIBaseResponse):
    type: Literal["TRIP_SUMMARY"] = "TRIP_SUMMARY"
    summary: str
    readiness_score: int = Field(ge=0, le=100)
    total_items: int = 0
    pending_items: int = 0
    packed_items: int = 0
    delivered_items: int = 0
    category_breakdown: list[CategoryReadinessSummary] = []
    top_missing_priorities: list[str] = []
    high_priority_notes: list[str]
    member_summary: list[MemberAssignmentSummary]
    recommendations: list[str]


class AskAssistantResponse(AIBaseResponse):
    type: Literal["ASK_ASSISTANT"] = "ASK_ASSISTANT"
    answer: str
    suggested_actions: list[str]


class DestinationInsightsResponse(AIBaseResponse):
    type: Literal["DESTINATION_INSIGHTS"] = "DESTINATION_INSIGHTS"
    summary: str
    local_travel_tips: list[str]
    cultural_considerations: list[str]
    common_mistakes: list[str]
    packing_warnings: list[str]
    transportation_notes: list[str]
    safety_reminders: list[str]


class AISuggestionHistoryItem(BaseModel):
    id: uuid.UUID
    trip_id: uuid.UUID
    suggestion_type: str
    input_data: dict[str, Any]
    output_data: dict[str, Any]
    provider: str
    created_at: datetime


class ApplySuggestedItem(BaseModel):
    name: str
    category: str
    quantity: int = Field(default=1, ge=1)
    priority: ItemPriority = ItemPriority.MEDIUM
    notes: str | None = None

    @field_validator("name", "category")
    @classmethod
    def validate_apply_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field cannot be empty")
        return value


class ApplyItemsRequest(BaseModel):
    suggestion_id: uuid.UUID
    items: list[ApplySuggestedItem] = Field(min_length=1)


class SkippedSuggestedItem(BaseModel):
    name: str
    reason: str


class ApplyItemsResponse(BaseModel):
    message: str
    created_items: list[ItemRead]
    skipped_items: list[SkippedSuggestedItem]
