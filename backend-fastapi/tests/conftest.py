import pytest
import pytest_asyncio
from httpx import AsyncClient
from typing import AsyncGenerator
from redis import asyncio as aioredis
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

from app.main import app
from app.db.session import Base
from app.core.config import settings

# Test database URL - using the actual dev db for now based on user constraints,
# but we could use a separate test db if needed.
TEST_DATABASE_URL = settings.DATABASE_URL
engine = create_async_engine(TEST_DATABASE_URL, echo=True, poolclass=NullPool)
TestingSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

# Setup Test DB
@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_test_db():
    async with engine.begin() as conn:
        # Avoid dropping everything to prevent destroying the user's dev data,
        # but in a real app we'd use a separate test database.
        # await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Cleanup here if needed

# Dependency override
from app.db.session import get_db

async def override_get_db():
    async with TestingSessionLocal() as session:
        yield session
        await session.close()

app.dependency_overrides[get_db] = override_get_db

from httpx import ASGITransport

@pytest_asyncio.fixture(scope="module")
async def client() -> AsyncGenerator[AsyncClient, None]:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac

# Ensure Redis is initialized for testing
@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_redis_cache():
    redis = aioredis.from_url(settings.REDIS_URL, encoding="utf8", decode_responses=True)
    FastAPICache.init(RedisBackend(redis), prefix="fastapi-cache-test")
    yield
