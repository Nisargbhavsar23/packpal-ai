import uuid

from fastapi import HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.orm import Session, selectinload

from app.models.category import Category
from app.models.enums import ItemPriority, ItemStatus, TripRole
from app.models.item import Item
from app.models.item_status_log import ItemStatusLog
from app.models.user import User
from app.schemas.item import (
    ItemCreate,
    ItemDetail,
    ItemRead,
    ItemStatusLogRead,
    ItemStatusUpdate,
    ItemUpdate,
    UserBasicRead,
)
from app.services.trip_service import ensure_trip_admin_or_owner, ensure_trip_member, get_trip_by_id


def create_item(db: Session, trip_id: uuid.UUID, item_create: ItemCreate, current_user: User) -> ItemRead:
    _ensure_trip_exists(db, trip_id)
    ensure_trip_admin_or_owner(db, trip_id, current_user.id)
    ensure_category_exists(db, item_create.category_id)
    if item_create.assigned_to_id is not None:
        ensure_assigned_user_is_trip_member(db, trip_id, item_create.assigned_to_id)

    item = Item(
        trip_id=trip_id,
        category_id=item_create.category_id,
        name=item_create.name,
        quantity=item_create.quantity,
        priority=item_create.priority,
        status=ItemStatus.PENDING,
        assigned_to_id=item_create.assigned_to_id,
        created_by_id=current_user.id,
        due_date=item_create.due_date,
        notes=item_create.notes,
    )
    db.add(item)
    db.commit()
    item = ensure_item_belongs_to_trip(db, trip_id, item.id)
    return _build_item_read(item)


def get_trip_items(
    db: Session,
    trip_id: uuid.UUID,
    current_user: User,
    status_filter: ItemStatus | None = None,
    priority_filter: ItemPriority | None = None,
    category_id: uuid.UUID | None = None,
    assigned_to_id: uuid.UUID | None = None,
) -> list[ItemRead]:
    _ensure_trip_exists(db, trip_id)
    ensure_trip_member(db, trip_id, current_user.id)

    query = _item_base_query().where(Item.trip_id == trip_id)
    if status_filter is not None:
        query = query.where(Item.status == status_filter)
    if priority_filter is not None:
        query = query.where(Item.priority == priority_filter)
    if category_id is not None:
        query = query.where(Item.category_id == category_id)
    if assigned_to_id is not None:
        query = query.where(Item.assigned_to_id == assigned_to_id)

    items = db.scalars(query.order_by(Item.created_at.desc())).all()
    return [_build_item_read(item) for item in items]


def get_item_detail(db: Session, trip_id: uuid.UUID, item_id: uuid.UUID, current_user: User) -> ItemDetail:
    _ensure_trip_exists(db, trip_id)
    ensure_trip_member(db, trip_id, current_user.id)
    item = ensure_item_belongs_to_trip(db, trip_id, item_id, include_logs=True)
    return _build_item_detail(item)


def update_item(db: Session, trip_id: uuid.UUID, item_id: uuid.UUID, item_update: ItemUpdate, current_user: User) -> ItemRead:
    _ensure_trip_exists(db, trip_id)
    ensure_trip_admin_or_owner(db, trip_id, current_user.id)
    item = ensure_item_belongs_to_trip(db, trip_id, item_id)

    update_data = item_update.model_dump(exclude_unset=True)
    if "category_id" in update_data and update_data["category_id"] is not None:
        ensure_category_exists(db, update_data["category_id"])
    if "assigned_to_id" in update_data and update_data["assigned_to_id"] is not None:
        ensure_assigned_user_is_trip_member(db, trip_id, update_data["assigned_to_id"])

    for field, value in update_data.items():
        setattr(item, field, value)

    db.commit()
    item = ensure_item_belongs_to_trip(db, trip_id, item.id)
    return _build_item_read(item)


def update_item_status(
    db: Session,
    trip_id: uuid.UUID,
    item_id: uuid.UUID,
    status_update: ItemStatusUpdate,
    current_user: User,
) -> ItemRead:
    _ensure_trip_exists(db, trip_id)
    item = ensure_item_belongs_to_trip(db, trip_id, item_id)
    if not can_update_item_status(db, trip_id, item, current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update this item status",
        )

    if item.status == status_update.status:
        return _build_item_read(item)

    old_status = item.status
    item.status = status_update.status
    db.add(
        ItemStatusLog(
            item_id=item.id,
            old_status=old_status,
            new_status=status_update.status,
            changed_by_id=current_user.id,
        )
    )
    db.commit()
    item = ensure_item_belongs_to_trip(db, trip_id, item.id)
    return _build_item_read(item)


def delete_item(db: Session, trip_id: uuid.UUID, item_id: uuid.UUID, current_user: User) -> None:
    _ensure_trip_exists(db, trip_id)
    ensure_trip_admin_or_owner(db, trip_id, current_user.id)
    item = ensure_item_belongs_to_trip(db, trip_id, item_id)

    db.execute(delete(ItemStatusLog).where(ItemStatusLog.item_id == item.id))
    db.delete(item)
    db.commit()


def ensure_item_belongs_to_trip(
    db: Session,
    trip_id: uuid.UUID,
    item_id: uuid.UUID,
    include_logs: bool = False,
) -> Item:
    options = [
        selectinload(Item.category),
        selectinload(Item.assigned_user),
        selectinload(Item.created_by),
    ]
    if include_logs:
        options.append(selectinload(Item.status_logs).selectinload(ItemStatusLog.changed_by))

    item = db.scalar(select(Item).options(*options).where(Item.id == item_id, Item.trip_id == trip_id))
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found in this trip",
        )
    return item


def ensure_category_exists(db: Session, category_id: uuid.UUID) -> Category:
    category = db.get(Category, category_id)
    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )
    return category


def ensure_assigned_user_is_trip_member(db: Session, trip_id: uuid.UUID, assigned_to_id: uuid.UUID) -> None:
    ensure_trip_member(db, trip_id, assigned_to_id)


def can_update_item_status(db: Session, trip_id: uuid.UUID, item: Item, current_user: User) -> bool:
    membership = ensure_trip_member(db, trip_id, current_user.id)
    if membership.role in {TripRole.OWNER, TripRole.ADMIN}:
        return True
    if membership.role == TripRole.VIEWER:
        return False
    return item.assigned_to_id == current_user.id


def _ensure_trip_exists(db: Session, trip_id: uuid.UUID) -> None:
    if get_trip_by_id(db, trip_id) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found",
        )


def _item_base_query():
    return select(Item).options(
        selectinload(Item.category),
        selectinload(Item.assigned_user),
        selectinload(Item.created_by),
    )


def _build_user_basic(user: User) -> UserBasicRead:
    return UserBasicRead(id=user.id, name=user.name, email=user.email)


def _build_item_read(item: Item) -> ItemRead:
    return ItemRead(
        id=item.id,
        trip_id=item.trip_id,
        category_id=item.category_id,
        category_name=item.category.name,
        name=item.name,
        quantity=item.quantity,
        priority=item.priority,
        status=item.status,
        assigned_to=_build_user_basic(item.assigned_user) if item.assigned_user else None,
        created_by=_build_user_basic(item.created_by),
        due_date=item.due_date,
        notes=item.notes,
        created_at=item.created_at,
        updated_at=item.updated_at,
    )


def _build_item_detail(item: Item) -> ItemDetail:
    item_data = _build_item_read(item).model_dump()
    status_logs = sorted(item.status_logs, key=lambda log: log.changed_at)
    return ItemDetail(
        **item_data,
        status_logs=[
            ItemStatusLogRead(
                id=log.id,
                old_status=log.old_status,
                new_status=log.new_status,
                changed_by=_build_user_basic(log.changed_by),
                changed_at=log.changed_at,
            )
            for log in status_logs
        ],
    )
