import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_active_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryDeleteResponse, CategoryRead, CategoryUpdate
from app.services.category_service import create_category, delete_category, get_categories, update_category

router = APIRouter(prefix="/categories")


@router.get("", response_model=list[CategoryRead])
def list_categories_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return get_categories(db)


@router.post("", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
def create_category_endpoint(
    category_create: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return create_category(db, category_create)


@router.patch("/{category_id}", response_model=CategoryRead)
def update_category_endpoint(
    category_id: uuid.UUID,
    category_update: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return update_category(db, category_id, category_update)


@router.delete("/{category_id}", response_model=CategoryDeleteResponse)
def delete_category_endpoint(
    category_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    delete_category(db, category_id)
    return CategoryDeleteResponse(message="Category deleted successfully")
