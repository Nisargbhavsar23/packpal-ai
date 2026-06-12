from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_jwt_token, hash_password, verify_password
from app.models.user import User
from app.schemas.auth import TokenData, UserCreate


def normalize_email(email: str) -> str:
    return email.strip().lower()


def get_user_by_email(db: Session, email: str) -> User | None:
    normalized_email = normalize_email(email)
    return db.scalar(select(User).where(User.email == normalized_email))


def create_user(db: Session, user_create: UserCreate) -> User:
    user = User(
        name=user_create.name.strip(),
        email=normalize_email(user_create.email),
        password_hash=hash_password(user_create.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = get_user_by_email(db, email)
    if user is None:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


def create_access_token(subject: str) -> str:
    return create_jwt_token(subject)


def get_current_user(token: str, db: Session) -> User | None:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            return None
        token_data = TokenData(user_id=user_id)
    except JWTError:
        return None

    return db.get(User, token_data.user_id)
