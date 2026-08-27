"""
Destination model - Tortoise ORM
"""
import uuid
from tortoise import fields
from tortoise.models import Model


class Destination(Model):
    """Destination model for travel locations in China"""

    id = fields.CharField(max_length=36, pk=True, default=lambda: str(uuid.uuid4()))
    slug = fields.CharField(max_length=100, unique=True, index=True)
    name_en = fields.CharField(max_length=100)
    name_zh = fields.CharField(max_length=100, null=True)
    country = fields.CharField(max_length=100, default="China")
    region = fields.CharField(max_length=100, null=True)
    description = fields.TextField(null=True)
    cover_image = fields.CharField(max_length=500, null=True)
    is_featured = fields.BooleanField(default=False)
    view_count = fields.IntField(default=0)

    # Timestamps
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    # Relationships
    posts: fields.ReverseRelation["Post"]
    questions: fields.ReverseRelation["Question"]

    class Meta:
        table = "destinations"

    def __str__(self):
        return f"Destination({self.name_en})"
