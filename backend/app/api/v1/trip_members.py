import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_active_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.trip_member import (
    TripMemberAdd,
    TripMemberDeleteResponse,
    TripMemberRead,
    TripMemberRoleUpdate,
)
from app.services.trip_member_service import (
    add_trip_member,
    get_trip_members,
    leave_trip,
    remove_trip_member,
    update_trip_member_role,
)

router = APIRouter(prefix="/trips/{trip_id}/members")


@router.get("", response_model=list[TripMemberRead])
def list_trip_members_endpoint(
    trip_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return get_trip_members(db=db, trip_id=trip_id, current_user=current_user)


@router.post("", response_model=TripMemberRead, status_code=status.HTTP_201_CREATED)
def add_trip_member_endpoint(
    trip_id: uuid.UUID,
    member_data: TripMemberAdd,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return add_trip_member(db=db, trip_id=trip_id, member_data=member_data, current_user=current_user)


@router.delete("/me", response_model=TripMemberDeleteResponse)
def leave_trip_endpoint(
    trip_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    leave_trip(db=db, trip_id=trip_id, current_user=current_user)
    return TripMemberDeleteResponse(message="You left the trip successfully")


@router.patch("/{member_id}/role", response_model=TripMemberRead)
def update_trip_member_role_endpoint(
    trip_id: uuid.UUID,
    member_id: uuid.UUID,
    role_update: TripMemberRoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return update_trip_member_role(
        db=db,
        trip_id=trip_id,
        member_id=member_id,
        role_update=role_update,
        current_user=current_user,
    )


@router.delete("/{member_id}", response_model=TripMemberDeleteResponse)
def remove_trip_member_endpoint(
    trip_id: uuid.UUID,
    member_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    remove_trip_member(db=db, trip_id=trip_id, member_id=member_id, current_user=current_user)
    return TripMemberDeleteResponse(message="Trip member removed successfully")
