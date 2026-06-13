import uuid

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from app.models.enums import TripRole
from app.models.trip_member import TripMember
from app.models.user import User
from app.schemas.trip_member import TripMemberAdd, TripMemberRead, TripMemberRoleUpdate
from app.services.auth_service import get_user_by_email
from app.services.trip_service import ensure_trip_admin_or_owner, ensure_trip_member, ensure_trip_owner, get_trip_by_id


def get_trip_members(db: Session, trip_id: uuid.UUID, current_user: User) -> list[TripMemberRead]:
    _ensure_trip_exists(db, trip_id)
    ensure_trip_member(db, trip_id, current_user.id)

    members = db.scalars(
        select(TripMember)
        .options(selectinload(TripMember.user))
        .where(TripMember.trip_id == trip_id)
        .order_by(TripMember.joined_at.asc())
    ).all()

    return [_build_member_read(member) for member in members]


def add_trip_member(
    db: Session,
    trip_id: uuid.UUID,
    member_data: TripMemberAdd,
    current_user: User,
) -> TripMemberRead:
    _ensure_trip_exists(db, trip_id)
    manager_membership = ensure_can_manage_members(db, trip_id, current_user)

    if manager_membership.role == TripRole.ADMIN and member_data.role not in {TripRole.MEMBER, TripRole.VIEWER}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admins can add only MEMBER or VIEWER roles",
        )

    user_to_add = get_user_by_email(db, member_data.email)
    if user_to_add is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User with this email was not found",
        )

    existing_membership = ensure_member_optional(db, trip_id, user_to_add.id)
    if existing_membership is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a member of this trip",
        )

    membership = TripMember(
        trip_id=trip_id,
        user_id=user_to_add.id,
        role=member_data.role,
    )

    try:
        db.add(membership)
        db.commit()
        db.refresh(membership)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a member of this trip",
        ) from None

    membership = ensure_member_belongs_to_trip(db, trip_id, membership.id)
    return _build_member_read(membership)


def update_trip_member_role(
    db: Session,
    trip_id: uuid.UUID,
    member_id: uuid.UUID,
    role_update: TripMemberRoleUpdate,
    current_user: User,
) -> TripMemberRead:
    _ensure_trip_exists(db, trip_id)
    ensure_owner(db, trip_id, current_user)
    membership = ensure_member_belongs_to_trip(db, trip_id, member_id)

    if membership.role == TripRole.OWNER and role_update.role != TripRole.OWNER and count_trip_owners(db, trip_id) <= 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot demote the last trip owner",
        )

    membership.role = role_update.role
    db.commit()
    db.refresh(membership)
    membership = ensure_member_belongs_to_trip(db, trip_id, membership.id)
    return _build_member_read(membership)


def remove_trip_member(
    db: Session,
    trip_id: uuid.UUID,
    member_id: uuid.UUID,
    current_user: User,
) -> None:
    _ensure_trip_exists(db, trip_id)
    ensure_owner(db, trip_id, current_user)
    membership = ensure_member_belongs_to_trip(db, trip_id, member_id)

    if membership.role == TripRole.OWNER and count_trip_owners(db, trip_id) <= 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove the last trip owner",
        )

    db.delete(membership)
    db.commit()


def leave_trip(db: Session, trip_id: uuid.UUID, current_user: User) -> None:
    _ensure_trip_exists(db, trip_id)
    membership = ensure_member_optional(db, trip_id, current_user.id)
    if membership is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="You are not a member of this trip",
        )

    if membership.role == TripRole.OWNER and count_trip_owners(db, trip_id) <= 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The only trip owner cannot leave the trip",
        )

    db.delete(membership)
    db.commit()


def count_trip_owners(db: Session, trip_id: uuid.UUID) -> int:
    return db.scalar(
        select(func.count()).select_from(TripMember).where(
            TripMember.trip_id == trip_id,
            TripMember.role == TripRole.OWNER,
        )
    )


def ensure_member_belongs_to_trip(db: Session, trip_id: uuid.UUID, member_id: uuid.UUID) -> TripMember:
    membership = db.scalar(
        select(TripMember)
        .options(selectinload(TripMember.user))
        .where(
            TripMember.id == member_id,
            TripMember.trip_id == trip_id,
        )
    )
    if membership is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member was not found in this trip",
        )
    return membership


def ensure_can_manage_members(db: Session, trip_id: uuid.UUID, current_user: User) -> TripMember:
    return ensure_trip_admin_or_owner(db, trip_id, current_user.id)


def ensure_owner(db: Session, trip_id: uuid.UUID, current_user: User) -> TripMember:
    return ensure_trip_owner(db, trip_id, current_user.id)


def ensure_member_optional(db: Session, trip_id: uuid.UUID, user_id: uuid.UUID) -> TripMember | None:
    return db.scalar(
        select(TripMember).where(
            TripMember.trip_id == trip_id,
            TripMember.user_id == user_id,
        )
    )


def _ensure_trip_exists(db: Session, trip_id: uuid.UUID) -> None:
    if get_trip_by_id(db, trip_id) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found",
        )


def _build_member_read(member: TripMember) -> TripMemberRead:
    return TripMemberRead(
        id=member.id,
        user_id=member.user_id,
        name=member.user.name,
        email=member.user.email,
        role=member.role,
        joined_at=member.joined_at,
    )
