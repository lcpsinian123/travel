"""
User model - Tortoise ORM
"""
import uuid
from tortoise import fields
from tortoise.models import Model


class User(Model):
    """User model for ChinaTravel"""

    id = fields.CharField(max_length=36, pk=True, default=lambda: str(uuid.uuid4()))
    email = fields.CharField(max_length=255, unique=True, index=True)
    username = fields.CharField(max_length=50, unique=True, index=True)
    password_hash = fields.CharField(max_length=255)
    display_name = fields.CharField(max_length=100, null=True)
    avatar_url = fields.CharField(max_length=500, null=True)
    bio = fields.TextField(null=True)
    country = fields.CharField(max_length=100, null=True)
    is_local_guide = fields.BooleanField(default=False)
    is_active = fields.BooleanField(default=True)

    # Timestamps
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    # Relationships
    posts: fields.ReverseRelation["Post"]
    comments: fields.ReverseRelation["Comment"]
    questions: fields.ReverseRelation["Question"]
    answers: fields.ReverseRelation["Answer"]
    collections: fields.ReverseRelation["Collection"]
    likes: fields.ReverseRelation["Like"]

    class Meta:
        table = "users"

    def __str__(self):
        return f"User({self.username})"
