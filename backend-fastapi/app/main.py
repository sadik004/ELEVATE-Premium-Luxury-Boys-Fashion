import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from redis import asyncio as aioredis

from app.core.config import settings
from app.api.v1.api import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize redis cache on startup
    redis = aioredis.from_url(settings.REDIS_URL, encoding="utf8", decode_responses=True)
    FastAPICache.init(RedisBackend(redis), prefix="fastapi-cache")
    yield
    # Cleanup on shutdown could go here
    await redis.close()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# Set up CORS logic to match Express
env = os.getenv("NODE_ENV", "development")
cors_origin = settings.FRONTEND_URL if env == "production" else "http://localhost:3000"

app.add_middleware(
    CORSMiddleware,
    allow_origins=[cors_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static Images route to match Express
public_images_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "backend", "public", "images")
if os.path.exists(public_images_path):
    app.mount("/images", StaticFiles(directory=public_images_path), name="images")

@app.get("/api/health")
def health_check():
    return {"status": "OK", "message": "ELEVATE API is running"}

app.include_router(api_router, prefix=settings.API_V1_STR)
