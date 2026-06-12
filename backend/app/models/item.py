import uuid
from datetime import date, datetime, timezone

from sqlalchemy import Date, DateTime, Enum as SQLEnum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import ItemPriority, ItemStatus


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Item(Base):
    __tablename__ = "items"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trip_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("trips.id"), nullable=False)
    category_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("categories.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    priority: Mapped[ItemPriority] = mapped_column(
        SQLEnum(ItemPriority, name="item_priority"),
        default=ItemPriority.MEDIUM,
        nullable=False,
    )
    status: Mapped[ItemStatus] = mapped_column(
        SQLEnum(ItemStatus, name="item_status"),
        default=ItemStatus.PENDING,
        nullable=False,
    )
    assigned_to_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    created_by_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        nullable=False,
    )

    trip = relationship("Trip", back_populates="items")
    category = relationship("Category", back_populates="items")
    assigned_user = relationship("User", back_populates="assigned_items", foreign_keys=[assigned_to_id])
    created_by = relationship("User", back_populates="created_items", foreign_keys=[created_by_id])
    status_logs = relationship("ItemStatusLog", back_populates="item", cascade="all, delete-orphan")
