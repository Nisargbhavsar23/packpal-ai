import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator


class CategoryCreate(BaseModel):
    name: str
    description: str | None = None
    is_default: bool = False

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Category name cannot be empty")
        return value


class CategoryUpdate(BaseModel):
    name: str | None = None
    description: str | None = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str | None) -> str | None:
        if value is None:
            return value
        value = value.strip()
        if not value:
            raise ValueError("Category name cannot be empty")
        return value


class CategoryRead(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None
    is_default: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CategoryDeleteResponse(BaseModel):
    message: str
