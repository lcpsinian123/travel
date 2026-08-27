"""
Test API endpoints - Run with server already started
"""
import sys
sys.path.insert(0, '/Users/liuchengping/Desktop/qt/doc/china-travel/backend')

import httpx
import asyncio


async def test():
    base_url = "http://127.0.0.1:8000"

    print("=" * 50)
    print("Testing ChinaTravel API")
    print("=" * 50)

    try:
        async with httpx.AsyncClient() as client:
            # Test health
            print("\n[1] Testing /health")
            response = await client.get(f"{base_url}/health", timeout=10.0)
            print(f"    Status: {response.status_code}")
            print(f"    Response: {response.json()}")

            # Test destinations
            print("\n[2] Testing /api/v1/destinations/")
            response = await client.get(f"{base_url}/api/v1/destinations/", timeout=10.0)
            print(f"    Status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"    Count: {len(data)} destinations")
                if data:
                    print(f"    First: {data[0].get('name_en')}")
            else:
                print(f"    Error: {response.text[:200]}")

            # Test posts
            print("\n[3] Testing /api/v1/posts/")
            response = await client.get(f"{base_url}/api/v1/posts/", timeout=10.0)
            print(f"    Status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"    Count: {len(data)} posts")
            else:
                print(f"    Error: {response.text[:200]}")

            # Test home
            print("\n[4] Testing /api/v1/home/")
            response = await client.get(f"{base_url}/api/v1/home/", timeout=10.0)
            print(f"    Status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"    Destinations: {len(data.get('destinations', []))}")
                print(f"    Latest posts: {len(data.get('latest_posts', []))}")
            else:
                print(f"    Error: {response.text[:200]}")

            # Test topics
            print("\n[5] Testing /api/v1/topics/")
            response = await client.get(f"{base_url}/api/v1/topics/", timeout=10.0)
            print(f"    Status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"    Count: {len(data)} topics")
            else:
                print(f"    Error: {response.text[:200]}")

            # Test search
            print("\n[6] Testing /api/v1/search/?q=beijing")
            response = await client.get(f"{base_url}/api/v1/search/?q=beijing", timeout=10.0)
            print(f"    Status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"    Destinations: {len(data.get('destinations', []))}")
            else:
                print(f"    Error: {response.text[:200]}")

    except httpx.ConnectError:
        print("\n[ERROR] Cannot connect to server at", base_url)
        print("Please start the server first with:")
        print("  cd backend && uv run uvicorn app.main:app --reload")

    print("\n" + "=" * 50)
    print("API Tests Completed!")
    print("=" * 50)


if __name__ == "__main__":
    asyncio.run(test())
