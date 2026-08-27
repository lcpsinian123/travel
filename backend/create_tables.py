"""
Create database tables using Tortoise ORM
"""
import asyncio
import sys
sys.path.insert(0, '/Users/liuchengping/Desktop/qt/doc/china-travel/backend')

from tortoise import Tortoise
from app.config import settings


async def create_tables():
    print("=" * 50)
    print("Creating Database Tables")
    print("=" * 50)

    print(f"\n[INFO] Database: {settings.DB_NAME}")
    print("[INFO] This will create all tables based on Tortoise ORM models.")

    try:
        print("\n[STEP 1] Initializing Tortoise ORM...")
        await Tortoise.init(
            db_url=settings.DATABASE_URL,
            modules={
                "models": [
                    "app.models.user",
                    "app.models.destination",
                    "app.models.post",
                    "app.models.comment",
                    "app.models.like",
                    "app.models.collection",
                    "app.models.question",
                    "app.models.topic",
                ]
            },
            timezone="UTC",
        )
        print("[OK] Tortoise ORM initialized!")

        print("\n[STEP 2] Generating schemas (creating tables)...")
        await Tortoise.generate_schemas()
        print("[OK] Tables created successfully!")

        print("\n[STEP 3] Verifying tables...")
        async with Tortoise.get_connection("default") as conn:
            result = await conn.execute_query("SHOW TABLES")
            tables = [list(row)[0] for row in result.rows]
            print(f"[INFO] Created {len(tables)} tables:")
            for table in tables:
                print(f"  ✓ {table}")

        print("\n" + "=" * 50)
        print("RESULT: All tables created successfully!")
        print("=" * 50)
        return True

    except Exception as e:
        print(f"\n[ERROR] Failed to create tables: {e}")
        import traceback
        traceback.print_exc()
        print("\n" + "=" * 50)
        print("RESULT: Failed to create tables!")
        print("=" * 50)
        return False
    finally:
        await Tortoise.close_connections()


if __name__ == "__main__":
    success = asyncio.run(create_tables())
    sys.exit(0 if success else 1)
