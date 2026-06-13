from app.api.v1.auth import router as auth_router
from app.api.v1.db_check import router as db_check_router
from app.api.v1.health import router as health_router
from app.api.v1.trip_members import router as trip_members_router
from app.api.v1.trips import router as trips_router

__all__ = [
    "auth_router",
    "db_check_router",
    "health_router",
    "trip_members_router",
    "trips_router",
]
