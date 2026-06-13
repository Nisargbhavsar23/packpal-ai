import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_active_user
from app.db.database import get_db
from app.models.enums import ItemPriority, ItemStatus
from app.models.user import User
from app.schemas.item import ItemCreate, ItemDeleteResponse, ItemDetail, ItemRead, ItemStatusUpdate, ItemUpdate
from app.services.item_service import (
    create_item,
    delete_item,
    get_item_detail,
    get_trip_items,
    update_item,
    update_item_status,
)

router = APIRouter(prefix="/trips/{trip_id}/items")


@router.post("", response_model=ItemRead, status_code=status.HTTP_201_CREATED)
def create_item_endpoint(
    trip_id: uuid.UUID,
    item_create: ItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return create_item(db=db, trip_id=trip_id, item_create=item_create, current_user=current_user)


@router.get("", response_model=list[ItemRead])
def list_trip_items_endpoint(
    trip_id: uuid.UUID,
    status_filter: ItemStatus | None = Query(default=None, alias="status"),
    priority_filter: ItemPriority | None = Query(default=None, alias="priority"),
    category_id: uuid.UUID | None = None,
    assigned_to_id: uuid.UUID | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return get_trip_items(
        db=db,
        trip_id=trip_id,
        current_user=current_user,
        status_filter=status_filter,
        priority_filter=priority_filter,
        category_id=category_id,
        assigned_to_id=assigned_to_id,
    )


@router.get("/{item_id}", response_model=ItemDetail)
def get_item_detail_endpoint(
    trip_id: uuid.UUID,
    item_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return get_item_detail(db=db, trip_id=trip_id, item_id=item_id, current_user=current_user)


@router.patch("/{item_id}", response_model=ItemRead)
def update_item_endpoint(
    trip_id: uuid.UUID,
    item_id: uuid.UUID,
    item_update: ItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return update_item(db=db, trip_id=trip_id, item_id=item_id, item_update=item_update, current_user=current_user)


@router.patch("/{item_id}/status", response_model=ItemRead)
def update_item_status_endpoint(
    trip_id: uuid.UUID,
    item_id: uuid.UUID,
    status_update: ItemStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return update_item_status(
        db=db,
        trip_id=trip_id,
        item_id=item_id,
        status_update=status_update,
        current_user=current_user,
    )


@router.delete("/{item_id}", response_model=ItemDeleteResponse)
def delete_item_endpoint(
    trip_id: uuid.UUID,
    item_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    delete_item(db=db, trip_id=trip_id, item_id=item_id, current_user=current_user)
    return ItemDeleteResponse(message="Item deleted successfully")
