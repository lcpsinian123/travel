"""Test API with running server"""
import httpx
import asyncio

async def test():
    base_url = "http://127.0.0.1:8001"
    try:
        async with httpx.AsyncClient() as client:
            r = await client.get(f"{base_url}/health", timeout=10.0)
            print("Health:", r.status_code, "Body:", repr(r.text[:100]))

            r = await client.get(f"{base_url}/api/v1/destinations/", timeout=10.0)
            print("Destinations:", r.status_code, "Body:", repr(r.text[:200]))
            if r.status_code == 200:
                data = r.json()
                print("Count:", len(data))
                if data:
                    print("First:", data[0].get("name_en"))
    except httpx.ConnectError as e:
        print("Connection error:", e)
    except Exception as e:
        print("Error:", e)

asyncio.run(test())
