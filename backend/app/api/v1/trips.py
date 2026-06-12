import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_active_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.trip import TripCreate, TripDeleteResponse, TripDetail, TripListItem, TripRead, TripUpdate
from app.services.trip_service import create_trip, delete_trip, get_trip_detail, get_user_trips, update_trip

router = APIRouter(prefix="/trips")


@router.post("", response_model=TripRead, status_code=status.HTTP_201_CREATED)
def create_trip_endpoint(
    trip_create: TripCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return create_trip(db=db, trip_create=trip_create, current_user=current_user)


@router.get("", response_model=list[TripListItem])
def list_trips_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return get_user_trips(db=db, current_user=current_user)


@router.get("/{trip_id}", response_model=TripDetail)
def get_trip_endpoint(
    trip_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return get_trip_detail(db=db, trip_id=trip_id, current_user=current_user)


@router.patch("/{trip_id}", response_model=TripRead)
def update_trip_endpoint(
    trip_id: uuid.UUID,
    trip_update: TripUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return update_trip(db=db, trip_id=trip_id, trip_update=trip_update, current_user=current_user)


@router.delete("/{trip_id}", response_model=TripDeleteResponse)
def delete_trip_endpoint(
    trip_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    delete_trip(db=db, trip_id=trip_id, current_user=current_user)
    return TripDeleteResponse(message="Trip deleted successfully")
