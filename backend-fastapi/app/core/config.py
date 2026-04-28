from typing import Optional
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "ELEVATE API"
    API_V1_STR: str = "/api"
    ENVIRONMENT: str = "development"

    # Security
    # In production, this SHOULD be set in the environment.
    # We provide a default only for local development convenience.
    JWT_SECRET: str = "supersecretkey"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days

    @field_validator("JWT_SECRET")
    @classmethod
    def validate_jwt_secret(cls, v: str, info) -> str:
        # Check if we are in production
        is_prod = info.data.get("ENVIRONMENT") == "production"
        
        if is_prod:
            if v == "supersecretkey":
                raise ValueError("JWT_SECRET must be changed from the default value in production.")
            if len(v) < 32:
                raise ValueError("JWT_SECRET is too weak. Use a string with at least 32 characters.")
        
        return v

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/elevate"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # CORS
    FRONTEND_URL: str = "http://localhost:3000"
    BACKEND_PUBLIC_URL: str = "http://localhost:5000"

    @field_validator("FRONTEND_URL", "BACKEND_PUBLIC_URL", mode="before")
    @classmethod
    def validate_url(cls, v: str) -> str:
        if not v:
            return v
        v = str(v).rstrip("/")
        if not v.startswith(("http://", "https://")):
            return f"http://{v}"
        return v

    # SSLCommerz
    SSLCOMMERZ_STORE_ID: str = ""
    SSLCOMMERZ_STORE_PASSWORD: str = ""
    SSLCOMMERZ_SANDBOX: bool = True
    SSLCOMMERZ_CURRENCY: str = "BDT"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)

settings = Settings()
