import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.enums import TripRole
from app.models.trip import Trip
from app.models.trip_member import TripMember
from app.models.user import User
from app.schemas.trip import TripCreate, TripDetail, TripListItem, TripMemberRead, TripUpdate


def get_trip_by_id(db: Session, trip_id: uuid.UUID) -> Trip | None:
    return db.get(Trip, trip_id)


def get_user_trip_membership(db: Session, trip_id: uuid.UUID, user_id: uuid.UUID) -> TripMember | None:
    return db.scalar(
        select(TripMember).where(
            TripMember.trip_id == trip_id,
            TripMember.user_id == user_id,
        )
    )


def ensure_trip_member(db: Session, trip_id: uuid.UUID, user_id: uuid.UUID) -> TripMember:
    membership = get_user_trip_membership(db, trip_id, user_id)
    if membership is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this trip",
        )
    return membership


def ensure_trip_admin_or_owner(db: Session, trip_id: uuid.UUID, user_id: uuid.UUID) -> TripMember:
    membership = ensure_trip_member(db, trip_id, user_id)
    if membership.role not in {TripRole.OWNER, TripRole.ADMIN}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only trip owners or admins can update this trip",
        )
    return membership


def ensure_trip_owner(db: Session, trip_id: uuid.UUID, user_id: uuid.UUID) -> TripMember:
    membership = ensure_trip_member(db, trip_id, user_id)
    if membership.role != TripRole.OWNER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the trip owner can delete this trip",
        )
    return membership


def create_trip(db: Session, trip_create: TripCreate, current_user: User) -> Trip:
    trip = Trip(
        title=trip_create.title,
        destination=trip_create.destination,
        trip_type=trip_create.trip_type,
        start_date=trip_create.start_date,
        end_date=trip_create.end_date,
        description=trip_create.description,
        created_by_id=current_user.id,
    )
    membership = TripMember(
        trip=trip,
        user_id=current_user.id,
        role=TripRole.OWNER,
    )

    try:
        db.add(trip)
        db.add(membership)
        db.commit()
        db.refresh(trip)
        return trip
    except Exception:
        db.rollback()
        raise


def get_user_trips(db: Session, current_user: User) -> list[TripListItem]:
    memberships = db.scalars(
        select(TripMember)
        .options(selectinload(TripMember.trip))
        .where(TripMember.user_id == current_user.id)
        .order_by(TripMember.joined_at.desc())
    ).all()

    return [
        TripListItem(
            id=membership.trip.id,
            title=membership.trip.title,
            destination=membership.trip.destination,
            trip_type=membership.trip.trip_type,
            start_date=membership.trip.start_date,
            end_date=membership.trip.end_date,
            role=membership.role,
            created_at=membership.trip.created_at,
        )
        for membership in memberships
    ]


def get_trip_detail(db: Session, trip_id: uuid.UUID, current_user: User) -> TripDetail:
    ensure_trip_member(db, trip_id, current_user.id)
    trip = db.scalar(
        select(Trip)
        .options(
            selectinload(Trip.creator),
            selectinload(Trip.members).selectinload(TripMember.user),
        )
        .where(Trip.id == trip_id)
    )
    if trip is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found",
        )

    return _build_trip_detail(trip)


def update_trip(db: Session, trip_id: uuid.UUID, trip_update: TripUpdate, current_user: User) -> Trip:
    ensure_trip_admin_or_owner(db, trip_id, current_user.id)
    trip = get_trip_by_id(db, trip_id)
    if trip is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found",
        )

    update_data = trip_update.model_dump(exclude_unset=True)
    new_start_date = update_data.get("start_date", trip.start_date)
    new_end_date = update_data.get("end_date", trip.end_date)
    if new_start_date > new_end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="start_date cannot be after end_date",
        )

    for field, value in update_data.items():
        setattr(trip, field, value)

    db.commit()
    db.refresh(trip)
    return trip


def delete_trip(db: Session, trip_id: uuid.UUID, current_user: User) -> None:
    ensure_trip_owner(db, trip_id, current_user.id)
    trip = get_trip_by_id(db, trip_id)
    if trip is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found",
        )

    db.delete(trip)
    db.commit()


def _build_trip_detail(trip: Trip) -> TripDetail:
    return TripDetail(
        id=trip.id,
        title=trip.title,
        destination=trip.destination,
        trip_type=trip.trip_type,
        start_date=trip.start_date,
        end_date=trip.end_date,
        description=trip.description,
        created_by_id=trip.created_by_id,
        created_at=trip.created_at,
        updated_at=trip.updated_at,
        creator=trip.creator,
        members=[
            TripMemberRead(
                id=member.id,
                user_id=member.user_id,
                name=member.user.name,
                email=member.user.email,
                role=member.role,
                joined_at=member.joined_at,
            )
            for member in trip.members
        ],
    )
