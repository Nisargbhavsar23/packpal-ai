from app.api.v1.ai import router as ai_router
from app.api.v1.auth import router as auth_router
from app.api.v1.categories import router as categories_router
from app.api.v1.db_check import router as db_check_router
from app.api.v1.export import router as export_router
from app.api.v1.health import router as health_router
from app.api.v1.items import router as items_router
from app.api.v1.password_reset import router as password_reset_router
from app.api.v1.trip_members import router as trip_members_router
from app.api.v1.trips import router as trips_router

__all__ = [
    "auth_router",
    "ai_router",
    "categories_router",
    "db_check_router",
    "export_router",
    "health_router",
    "items_router",
    "password_reset_router",
    "trip_members_router",
    "trips_router",
]
