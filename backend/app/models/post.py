"""
Post model - Tortoise ORM
"""
import uuid
from tortoise import fields
from tortoise.models import Model


class Post(Model):
    """Blog post model"""

    id = fields.CharField(max_length=36, pk=True, default=lambda: str(uuid.uuid4()))
    title = fields.CharField(max_length=255)
    slug = fields.CharField(max_length=255, unique=True, index=True)
    content = fields.TextField()
    excerpt = fields.TextField(null=True)
    cover_image = fields.CharField(max_length=500, null=True)
    status = fields.CharField(max_length=20, default="published")  # draft, published
    view_count = fields.IntField(default=0)
    like_count = fields.IntField(default=0)
    comment_count = fields.IntField(default=0)
    tags = fields.CharField(max_length=500, null=True)  # Comma-separated tags
    published_at = fields.CharField(max_length=50, null=True)

    # Timestamps
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    # Relationships
    author: fields.ForeignKeyRelation["User"] = fields.ForeignKeyField("models.User", related_name="posts")
    destination: fields.ForeignKeyRelation["Destination"] = fields.ForeignKeyField("models.Destination", related_name="posts", null=True)
    comments: fields.ReverseRelation["Comment"]
    likes: fields.ReverseRelation["Like"]
    collections: fields.ReverseRelation["Collection"]

    class Meta:
        table = "posts"

    def __str__(self):
        return f"Post({self.title})"
