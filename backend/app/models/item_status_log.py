import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum as SQLEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import ItemStatus
from app.utils.time import utc_now


class ItemStatusLog(Base):
    __tablename__ = "item_status_logs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    item_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("items.id"), nullable=False)
    old_status: Mapped[ItemStatus | None] = mapped_column(SQLEnum(ItemStatus, name="item_status"), nullable=True)
    new_status: Mapped[ItemStatus] = mapped_column(SQLEnum(ItemStatus, name="item_status"), nullable=False)
    changed_by_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    changed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    item = relationship("Item", back_populates="status_logs")
    changed_by = relationship("User")
