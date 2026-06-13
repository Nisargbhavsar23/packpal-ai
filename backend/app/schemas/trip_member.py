import uuid
from datetime import datetime

from pydantic import BaseModel, field_validator

from app.models.enums import TripRole


class TripMemberAdd(BaseModel):
    email: str
    role: TripRole = TripRole.MEMBER

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        value = value.strip().lower()
        if "@" not in value:
            raise ValueError("Enter a valid email address")
        return value


class TripMemberRoleUpdate(BaseModel):
    role: TripRole


class TripMemberRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    email: str
    role: TripRole
    joined_at: datetime


class TripMemberDeleteResponse(BaseModel):
    message: str
