import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        nullable=False,
    )

    created_trips = relationship("Trip", back_populates="creator", cascade="all, delete-orphan")
    memberships = relationship("TripMember", back_populates="user", cascade="all, delete-orphan")
    assigned_items = relationship("Item", back_populates="assigned_user", foreign_keys="Item.assigned_to_id")
    created_items = relationship("Item", back_populates="created_by", foreign_keys="Item.created_by_id")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
