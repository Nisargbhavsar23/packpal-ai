import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, field_validator, model_validator

from app.models.enums import TripRole


class TripBase(BaseModel):
    title: str
    destination: str
    trip_type: str
    start_date: date
    end_date: date
    description: str | None = None

    @field_validator("title", "destination", "trip_type")
    @classmethod
    def validate_required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field cannot be empty")
        return value

    @model_validator(mode="after")
    def validate_dates(self):
        if self.start_date > self.end_date:
            raise ValueError("start_date cannot be after end_date")
        return self


class TripCreate(TripBase):
    pass


class TripUpdate(BaseModel):
    title: str | None = None
    destination: str | None = None
    trip_type: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    description: str | None = None

    @field_validator("title", "destination", "trip_type")
    @classmethod
    def validate_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return value
        value = value.strip()
        if not value:
            raise ValueError("This field cannot be empty")
        return value


class TripRead(BaseModel):
    id: uuid.UUID
    title: str
    destination: str
    trip_type: str
    start_date: date
    end_date: date
    description: str | None
    created_by_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TripListItem(BaseModel):
    id: uuid.UUID
    title: str
    destination: str
    trip_type: str
    start_date: date
    end_date: date
    role: TripRole
    created_at: datetime


class TripCreatorRead(BaseModel):
    id: uuid.UUID
    name: str
    email: str

    model_config = ConfigDict(from_attributes=True)


class TripMemberRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    email: str
    role: TripRole
    joined_at: datetime


class TripDetail(TripRead):
    creator: TripCreatorRead
    members: list[TripMemberRead]


class TripDeleteResponse(BaseModel):
    message: str
