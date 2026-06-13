import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.models.password_reset_token import PasswordResetToken
from app.models.user import User
from app.services.auth_service import get_user_by_email

RESET_TOKEN_EXPIRE_MINUTES = 15
FORGOT_PASSWORD_MESSAGE = "If the email exists, a password reset link has been generated."
PRODUCTION_FORGOT_PASSWORD_MESSAGE = "If the email exists, password reset instructions have been sent."
RESET_SUCCESS_MESSAGE = "Password reset successful. You can now login with your new password."


def hash_reset_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


def create_raw_reset_token() -> str:
    return secrets.token_urlsafe(32)


def send_password_reset_email_placeholder(user: User, reset_url: str) -> None:
    # Real email delivery will be added in a later production integration phase.
    return None


def create_password_reset_token(db: Session, email: str) -> dict[str, str | None]:
    user = get_user_by_email(db, email)
    is_development = settings.ENVIRONMENT.lower() == "development"
    message = FORGOT_PASSWORD_MESSAGE if is_development else PRODUCTION_FORGOT_PASSWORD_MESSAGE

    if user is None:
        return {
            "message": message,
            "reset_token": None,
            "reset_url": None,
        }

    now = datetime.now(timezone.utc)
    unused_tokens = db.scalars(
        select(PasswordResetToken).where(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.used_at.is_(None),
        )
    ).all()
    for token in unused_tokens:
        token.used_at = now

    raw_token = create_raw_reset_token()
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={raw_token}"
    db.add(
        PasswordResetToken(
            user_id=user.id,
            token_hash=hash_reset_token(raw_token),
            expires_at=now + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES),
        )
    )
    db.commit()

    if not is_development:
        send_password_reset_email_placeholder(user, reset_url)

    return {
        "message": message,
        "reset_token": raw_token if is_development else None,
        "reset_url": reset_url if is_development else None,
    }


def reset_password(db: Session, raw_token: str, new_password: str) -> None:
    token_hash = hash_reset_token(raw_token)
    reset_token = db.scalar(
        select(PasswordResetToken)
        .where(PasswordResetToken.token_hash == token_hash)
        .order_by(PasswordResetToken.created_at.desc())
    )

    if reset_token is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )

    now = datetime.now(timezone.utc)
    if reset_token.used_at is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token has already been used",
        )
    expires_at = reset_token.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if expires_at < now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token has expired",
        )

    user = db.get(User, reset_token.user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )

    user.password_hash = hash_password(new_password)
    reset_token.used_at = now
    db.commit()
