"""
Aerich configuration for Tortoise ORM migrations

This configuration is used by the aerich CLI tool for database migrations.
"""
from app.config import settings

TORTOISE_ORM = {
    "connections": {
        "default": settings.DATABASE_URL
    },
    "apps": {
        "models": {
            "models": [
                "app.models.user",
                "app.models.destination",
                "app.models.post",
                "app.models.comment",
                "app.models.like",
                "app.models.collection",
                "app.models.question",
                "app.models.topic",
            ],
            "default_connection": "default",
        },
    },
    "timezone": "UTC",
}
