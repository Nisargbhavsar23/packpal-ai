import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.enums import ItemPriority, ItemStatus


class UserBasicRead(BaseModel):
    id: uuid.UUID
    name: str
    email: str

    model_config = ConfigDict(from_attributes=True)


class ItemCreate(BaseModel):
    category_id: uuid.UUID
    name: str
    quantity: int = Field(default=1, ge=1)
    priority: ItemPriority = ItemPriority.MEDIUM
    assigned_to_id: uuid.UUID | None = None
    due_date: date | None = None
    notes: str | None = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Item name cannot be empty")
        return value


class ItemUpdate(BaseModel):
    category_id: uuid.UUID | None = None
    name: str | None = None
    quantity: int | None = Field(default=None, ge=1)
    priority: ItemPriority | None = None
    assigned_to_id: uuid.UUID | None = None
    due_date: date | None = None
    notes: str | None = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str | None) -> str | None:
        if value is None:
            return value
        value = value.strip()
        if not value:
            raise ValueError("Item name cannot be empty")
        return value


class ItemStatusUpdate(BaseModel):
    status: ItemStatus


class ItemRead(BaseModel):
    id: uuid.UUID
    trip_id: uuid.UUID
    category_id: uuid.UUID
    category_name: str
    name: str
    quantity: int
    priority: ItemPriority
    status: ItemStatus
    assigned_to: UserBasicRead | None
    created_by: UserBasicRead
    due_date: date | None
    notes: str | None
    created_at: datetime
    updated_at: datetime


class ItemStatusLogRead(BaseModel):
    id: uuid.UUID
    old_status: ItemStatus | None
    new_status: ItemStatus
    changed_by: UserBasicRead
    changed_at: datetime


class ItemDetail(ItemRead):
    status_logs: list[ItemStatusLogRead]


class ItemDeleteResponse(BaseModel):
    message: str
