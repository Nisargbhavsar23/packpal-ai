from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.password_reset import (
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
)
from app.services.password_reset_service import RESET_SUCCESS_MESSAGE, create_password_reset_token, reset_password

router = APIRouter(prefix="/auth")


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)) -> ForgotPasswordResponse:
    reset_data = create_password_reset_token(db, payload.email)
    return ForgotPasswordResponse(**reset_data)


@router.post("/reset-password", response_model=ResetPasswordResponse)
def reset_password_endpoint(payload: ResetPasswordRequest, db: Session = Depends(get_db)) -> ResetPasswordResponse:
    reset_password(db, payload.token, payload.new_password)
    return ResetPasswordResponse(message=RESET_SUCCESS_MESSAGE)
