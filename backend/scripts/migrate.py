"""
Database migration script using Tortoise ORM + Aerich

Usage:
    python scripts/migrate.py init      - Initialize aerich
    python scripts/migrate.py migrate   - Generate and apply migrations
    python scripts/migrate.py upgrade   - Apply pending migrations
    python scripts/migrate.py downgrade - Rollback last migration
"""
import asyncio
import sys
import os
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from tortoise import Tortoise
from app.config import settings


async def init_db():
    """Initialize database and create initial schema"""
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
        use_spinlock=True,
        timezone="UTC",
    )
    await Tortoise.generate_schemas()
    print("Database schema created successfully!")


async def close_db():
    """Close database connections"""
    await Tortoise.close_connections()


def run_migration():
    """Run database migrations using aerich CLI"""
    import subprocess

    commands = {
        "init": ["aerich", "init-i", "chinatravel", "-t", "app.aerich_config.TORTOISE_ORM"],
        "migrate": ["aerich", "migrate"],
        "upgrade": ["aerich", "upgrade"],
        "downgrade": ["aerich", "downgrade"],
        "show": ["aerich", "show"],
    }

    if len(sys.argv) < 2 or sys.argv[1] not in commands:
        print("Usage: python migrate.py [init|migrate|upgrade|downgrade|show]")
        print("  init     - Initialize aerich (run once)")
        print("  migrate  - Generate and apply new migrations")
        print("  upgrade  - Apply pending migrations")
        print("  downgrade - Rollback last migration")
        print("  show     - Show current migration status")
        return

    cmd = commands[sys.argv[1]]
    result = subprocess.run(cmd, cwd=Path(__file__).parent.parent)
    sys.exit(result.returncode)


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "init-db":
        # Initialize database schema directly
        asyncio.run(init_db())
        asyncio.run(close_db())
    else:
        # Run aerich migration
        run_migration()
