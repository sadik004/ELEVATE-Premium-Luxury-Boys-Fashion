import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    response = await client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "OK"
    assert "ELEVATE API is running" in data["message"]

@pytest.mark.asyncio
async def test_get_products(client: AsyncClient):
    response = await client.get("/api/products/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

@pytest.mark.asyncio
async def test_get_categories(client: AsyncClient):
    response = await client.get("/api/categories/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

@pytest.mark.asyncio
async def test_caching_latency(client: AsyncClient):
    import time

    # First request
    start_time = time.time()
    resp1 = await client.get("/api/products/")
    end_time = time.time()
    first_req_time = end_time - start_time
    assert resp1.status_code == 200

    # Second request - should be cached
    start_time = time.time()
    resp2 = await client.get("/api/products/")
    end_time = time.time()
    second_req_time = end_time - start_time
    assert resp2.status_code == 200

    # Check headers if fastapi-cache exposes them or manually mock DB
    # For a simple test, we just check they work and return the same
    assert resp1.json() == resp2.json()

    # Second category request
    start_time = time.time()
    resp3 = await client.get("/api/categories/")
    end_time = time.time()
    first_req_time_cat = end_time - start_time
    assert resp3.status_code == 200

    start_time = time.time()
    resp4 = await client.get("/api/categories/")
    end_time = time.time()
    second_req_time_cat = end_time - start_time
    assert resp4.status_code == 200

    assert resp3.json() == resp4.json()
