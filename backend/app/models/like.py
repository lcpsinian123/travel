"""
Like model - Tortoise ORM
"""
import uuid
from tortoise import fields
from tortoise.models import Model


class Like(Model):
    """Like model for posts"""

    id = fields.CharField(max_length=36, pk=True, default=lambda: str(uuid.uuid4()))

    # Timestamps
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    # Relationships
    user: fields.ForeignKeyRelation["User"] = fields.ForeignKeyField("models.User", related_name="likes")
    post: fields.ForeignKeyRelation["Post"] = fields.ForeignKeyField("models.Post", related_name="likes")

    class Meta:
        table = "likes"
        indexes = [("user_id", "post_id")]  # Unique constraint equivalent

    def __str__(self):
        return f"Like(user={self.user_id}, post={self.post_id})"
