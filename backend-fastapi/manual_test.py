import asyncio
import httpx

async def test_admin_endpoints():
    base_url = "http://localhost:5000/api"
    
    print("Testing /admin/stats...")
    # Note: This will fail with 403 if we don't bypass the admin check
    # But we want to see if the endpoint logic itself works
    try:
        async with httpx.AsyncClient() as client:
            # We'll skip the auth for this test by mocking the dependency in the app if we were running a test suite
            # But here we just want to see if the routes are registered
            response = await client.get(f"{base_url}/admin/stats")
            print(f"Stats Status: {response.status_code}")
            if response.status_code == 200:
                print(f"Stats Data: {response.json()}")
            elif response.status_code == 403:
                print("Stats check: 403 (Authentication required as expected)")
    except Exception as e:
        print(f"Stats Error: {e}")

    print("\nTesting /products GET...")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{base_url}/products")
            print(f"Products Status: {response.status_code}")
            if response.status_code == 200:
                products = response.json()
                print(f"Found {len(products)} products.")
    except Exception as e:
        print(f"Products Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_admin_endpoints())
