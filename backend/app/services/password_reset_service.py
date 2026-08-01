import hashlib
import logging
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
from app.services.email_service import send_password_reset_email

logger = logging.getLogger(__name__)

RESET_TOKEN_EXPIRE_MINUTES = 15
FORGOT_PASSWORD_MESSAGE = "If the email exists, a password reset link has been generated."
PRODUCTION_FORGOT_PASSWORD_MESSAGE = "If the email exists, password reset instructions have been sent."
RESET_SUCCESS_MESSAGE = "Password reset successful. You can now login with your new password."


def hash_reset_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


def create_raw_reset_token() -> str:
    return secrets.token_urlsafe(32)


def create_password_reset_token(db: Session, email: str) -> dict[str, str | None]:
    user = get_user_by_email(db, email)
    is_development = settings.ENVIRONMENT.lower() == "development"

    # In production-mode with SMTP configured, use the production message.
    # In development, always show the dev message (token in response).
    if is_development:
        message = FORGOT_PASSWORD_MESSAGE
    elif settings.resend_configured:
        message = PRODUCTION_FORGOT_PASSWORD_MESSAGE
    else:
        # Production env but Resend not configured — fall back to dev message so
        # the reset link is visible in the API response (same as pure dev mode).
        logger.warning(
            "ENVIRONMENT=%s but Resend is not configured. "
            "Returning reset token in response. "
            "Set RESEND_API_KEY and RESEND_FROM_EMAIL in .env to send real emails.",
            settings.ENVIRONMENT,
        )
        message = FORGOT_PASSWORD_MESSAGE

    if user is None:
        return {
            "message": message,
            "reset_token": None,
            "reset_url": None,
        }

    # Invalidate any existing unused tokens for this user
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

    # Attempt real email delivery when Resend is configured
    email_sent = False
    if settings.resend_configured:
        email_sent = send_password_reset_email(
            to_email=user.email,
            to_name=user.name,
            reset_url=reset_url,
            expire_minutes=RESET_TOKEN_EXPIRE_MINUTES,
        )
        if not email_sent:
            logger.error(
                "Failed to deliver password reset email to %s via Resend. "
                "The reset token is still valid — user can request again.",
                user.email,
            )

    # In development mode, OR when Resend is not configured (any env), expose the
    # reset token/URL in the API response so developers can still test the flow.
    expose_token = is_development or not settings.resend_configured

    return {
        "message": message,
        "reset_token": raw_token if expose_token else None,
        "reset_url": reset_url if expose_token else None,
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
