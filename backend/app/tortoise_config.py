"""
Tortoise ORM Database Configuration
"""
from tortoise import Tortoise
from .config import settings


async def init_db():
    """Initialize Tortoise ORM database connection"""
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
    await Tortoise.generate_schemas()


async def close_db():
    """Close database connection"""
    await Tortoise.close_connections()


def get_tortoise_config():
    """Get Tortoise ORM configuration for use in FastAPI lifespan"""
    return {
        "db_url": settings.DATABASE_URL,
        "modules": {
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
    "timezone": "UTC",
}
