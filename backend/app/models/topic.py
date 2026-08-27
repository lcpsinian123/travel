"""
Topic model - Tortoise ORM
"""
import uuid
from tortoise import fields
from tortoise.models import Model


class Topic(Model):
    """Topic model for categorizing posts"""

    id = fields.CharField(max_length=36, pk=True, default=lambda: str(uuid.uuid4()))
    name = fields.CharField(max_length=100, unique=True)
    slug = fields.CharField(max_length=100, unique=True)
    description = fields.TextField(null=True)
    icon = fields.CharField(max_length=100, null=True)
    post_count = fields.IntField(default=0)

    # Timestamps
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "topics"

    def __str__(self):
        return f"Topic({self.name})"
