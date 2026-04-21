from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "ELEVATE API"
    API_V1_STR: str = "/api"

    # Security
    JWT_SECRET: str = "supersecretkey"  # Default for development
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/elevate"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # CORS
    FRONTEND_URL: str = "http://localhost:3000"

    # SSLCommerz
    SSLCOMMERZ_STORE_ID: str = "testbox"
    SSLCOMMERZ_STORE_PASSWORD: str = "testpass"

    class Config:
        env_file = ".env"

settings = Settings()
