from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import (
    ai_router,
    auth_router,
    categories_router,
    db_check_router,
    export_router,
    health_router,
    items_router,
    password_reset_router,
    trip_members_router,
    trips_router,
)
from app.core.config import settings


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.PROJECT_VERSION,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["Content-Disposition"],
    )

    @app.get("/health", tags=["health"])
    def root_health_check() -> dict[str, str]:
        return {
            "status": "ok",
            "message": "PackPal AI backend is running",
            "version": settings.PROJECT_VERSION,
        }

    app.include_router(health_router, prefix="/api/v1", tags=["health"])
    app.include_router(db_check_router, prefix="/api/v1", tags=["database"])
    app.include_router(auth_router, prefix="/api/v1", tags=["auth"])
    app.include_router(password_reset_router, prefix="/api/v1", tags=["auth"])
    app.include_router(categories_router, prefix="/api/v1", tags=["categories"])
    app.include_router(trips_router, prefix="/api/v1", tags=["trips"])
    app.include_router(trip_members_router, prefix="/api/v1", tags=["trip members"])
    app.include_router(items_router, prefix="/api/v1", tags=["items"])
    app.include_router(ai_router, prefix="/api/v1", tags=["ai assistant"])
    app.include_router(export_router, prefix="/api/v1", tags=["export"])

    return app


app = create_app()
