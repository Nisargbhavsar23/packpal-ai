from fastapi import APIRouter

from app.core.config import settings

router = APIRouter()


@router.get("/health")
def health_check() -> dict[str, str]:
    return {
        "status": "ok",
        "message": "PackPal AI backend is running",
        "version": settings.PROJECT_VERSION,
    }
