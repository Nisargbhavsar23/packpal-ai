from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "PackPal AI"
    PROJECT_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:5173"]
    FRONTEND_URL: str = "http://localhost:5173"

    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/packpal_ai"

    AI_PROVIDER: str = "gemini"
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash-lite"
    AI_TEMPERATURE: float = 0.3
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2"

    JWT_SECRET_KEY: str = "change-this-secret-key"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # ── Resend Email ──────────────────────────────────────────────
    RESEND_API_KEY: str = ""          # Required: starts with "re_"
    RESEND_FROM_EMAIL: str = ""       # Required: must be from a verified Resend domain
    RESEND_FROM_NAME: str = "PackPal AI"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @property
    def resend_configured(self) -> bool:
        """True when RESEND_API_KEY and RESEND_FROM_EMAIL are both set."""
        return bool(self.RESEND_API_KEY and self.RESEND_FROM_EMAIL)


settings = Settings()
