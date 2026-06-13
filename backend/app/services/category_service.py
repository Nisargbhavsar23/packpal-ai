import uuid

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.item import Item
from app.schemas.category import CategoryCreate, CategoryUpdate

DEFAULT_CATEGORIES = [
    "Clothes",
    "Hygiene",
    "Tech",
    "Documents",
    "Medicines",
    "Food",
    "Emergency",
    "Custom",
]


def ensure_default_categories(db: Session) -> None:
    category_count = db.scalar(select(func.count()).select_from(Category))
    if category_count:
        return

    db.add_all(
        Category(name=name, description=f"Default {name.lower()} packing category", is_default=True)
        for name in DEFAULT_CATEGORIES
    )
    db.commit()


def get_categories(db: Session) -> list[Category]:
    ensure_default_categories(db)
    return list(db.scalars(select(Category).order_by(Category.is_default.desc(), Category.name.asc())).all())


def get_category_by_id(db: Session, category_id: uuid.UUID) -> Category | None:
    return db.get(Category, category_id)


def get_category_by_name(db: Session, name: str) -> Category | None:
    normalized_name = name.strip().lower()
    return db.scalar(select(Category).where(func.lower(Category.name) == normalized_name))


def create_category(db: Session, category_create: CategoryCreate) -> Category:
    ensure_default_categories(db)
    if get_category_by_name(db, category_create.name) is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category name already exists",
        )

    category = Category(
        name=category_create.name,
        description=category_create.description,
        is_default=category_create.is_default,
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def update_category(db: Session, category_id: uuid.UUID, category_update: CategoryUpdate) -> Category:
    ensure_default_categories(db)
    category = get_category_by_id(db, category_id)
    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    update_data = category_update.model_dump(exclude_unset=True)
    if "name" in update_data:
        existing_category = get_category_by_name(db, update_data["name"])
        if existing_category is not None and existing_category.id != category.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category name already exists",
            )

    for field, value in update_data.items():
        setattr(category, field, value)

    db.commit()
    db.refresh(category)
    return category


def delete_category(db: Session, category_id: uuid.UUID) -> None:
    ensure_default_categories(db)
    category = get_category_by_id(db, category_id)
    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )
    if category.is_default:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Default categories cannot be deleted",
        )

    linked_item_count = db.scalar(select(func.count()).select_from(Item).where(Item.category_id == category_id))
    if linked_item_count:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete a category that has linked items",
        )

    db.delete(category)
    db.commit()
