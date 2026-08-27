"""
Comment model - Tortoise ORM
"""
import uuid
from tortoise import fields
from tortoise.models import Model


class Comment(Model):
    """Comment model for blog posts"""

    id = fields.CharField(max_length=36, pk=True, default=lambda: str(uuid.uuid4()))
    content = fields.TextField()
    like_count = fields.IntField(default=0)

    # Timestamps
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    # Relationships
    post: fields.ForeignKeyRelation["Post"] = fields.ForeignKeyField("models.Post", related_name="comments")
    author: fields.ForeignKeyRelation["User"] = fields.ForeignKeyField("models.User", related_name="comments")
    parent: fields.ForeignKeyRelation["Comment"] = fields.ForeignKeyField("models.Comment", related_name="replies", null=True)

    class Meta:
        table = "comments"

    def __str__(self):
        return f"Comment({self.id})"
