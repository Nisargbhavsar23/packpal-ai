import uuid

from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.core.deps import get_current_active_user
from app.db.database import get_db
from app.models.user import User
from app.services.pdf_export_service import build_trip_pdf_report

router = APIRouter(prefix="/trips/{trip_id}/export")


@router.get("/pdf")
def export_trip_pdf_endpoint(
    trip_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Response:
    pdf_bytes, content_disposition = build_trip_pdf_report(db=db, trip_id=trip_id, current_user=current_user)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": content_disposition},
    )
