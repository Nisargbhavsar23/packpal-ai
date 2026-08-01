import uuid
from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator

from app.models.enums import ItemPriority
from app.schemas.item import ItemRead

SuggestionType = Literal[
    "PACKING_LIST",
    "MISSING_ESSENTIALS",
    "TRIP_SUMMARY",
    "ASK_ASSISTANT",
    "DESTINATION_INSIGHTS",
    "GROUP_PACKING_ANALYSIS",
    "BUDGET_PLAN",
]


class PackingListRequest(BaseModel):
    travel_style: str | None = Field(default=None, max_length=200)
    weather_notes: str | None = Field(default=None, max_length=200)
    special_needs: str | None = Field(default=None, max_length=200)
    extra_instructions: str | None = Field(default=None, max_length=300)


class MissingEssentialsRequest(BaseModel):
    focus: str | None = Field(default=None, max_length=200)


class TripSummaryRequest(BaseModel):
    detail_level: str | None = "concise"


class AskAssistantRequest(BaseModel):
    question: str = Field(max_length=500)

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


class AIRiskItem(BaseModel):
    severity: Literal["HIGH", "MEDIUM", "LOW"]
    title: str
    description: str


class AIAlertItem(BaseModel):
    priority: Literal["HIGH", "MEDIUM", "LOW"]
    message: str


class ReadinessCategoryScore(BaseModel):
    score: int = Field(ge=0, le=100)
    status: str


class TravelReadinessResponse(BaseModel):
    overall_score: int = Field(ge=0, le=100)
    status: str
    category_scores: dict[str, ReadinessCategoryScore]
    top_risks: list[AIRiskItem]
    alerts: list[AIAlertItem]
    recommendations: list[str]


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


# ─── Group Packing Analysis ──────────────────────────────────────────────────

class GroupPackingRequest(BaseModel):
    """Request for AI-powered group packing analysis."""
    pass  # Uses trip context; no additional user input required


class DuplicateItemDetection(BaseModel):
    item_name: str
    assigned_to: list[str]
    recommendation: str


class MemberLoadSummary(BaseModel):
    member_name: str
    assigned_items: int
    pending_items: int
    readiness_score: int = Field(ge=0, le=100)
    load_status: str  # "Overloaded" | "Balanced" | "Underloaded" | "Empty"


class GroupPackingAnalysisResponse(AIBaseResponse):
    type: Literal["GROUP_PACKING_ANALYSIS"] = "GROUP_PACKING_ANALYSIS"
    summary: str
    group_readiness_score: int = Field(ge=0, le=100)
    member_summaries: list[MemberLoadSummary]
    duplicate_detections: list[DuplicateItemDetection]
    unassigned_essential_count: int
    load_balance_recommendations: list[str]
    group_readiness_notes: list[str]


# ─── Budget Planner ───────────────────────────────────────────────────────────

class BudgetPlanRequest(BaseModel):
    """Request for AI-powered travel budget estimation."""
    currency: str = Field(default="INR", pattern="^(INR|USD|EUR|GBP|AED|SGD)$")
    budget_style: str | None = Field(
        default="mid-range",
        description="budget | mid-range | premium",
        max_length=50,
    )
    group_size: int | None = Field(default=None, ge=1, le=50)
    extra_notes: str | None = Field(default=None, max_length=300)


class BudgetCategory(BaseModel):
    category: str
    estimated_amount: float = Field(ge=0)
    per_person_amount: float = Field(ge=0)
    notes: str


class BudgetPlanResponse(AIBaseResponse):
    type: Literal["BUDGET_PLAN"] = "BUDGET_PLAN"
    summary: str
    currency: str
    group_size: int
    duration_days: int
    total_estimated: float = Field(ge=0)
    per_person_total: float = Field(ge=0)
    categories: list[BudgetCategory]
    budget_advice: list[str]
    hidden_costs: list[str]
    money_saving_tips: list[str]
    usd_equivalent: float | None = None
    inr_equivalent: float | None = None
