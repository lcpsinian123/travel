"""
Question and Answer models - Tortoise ORM
"""
import uuid
from tortoise import fields
from tortoise.models import Model


class Question(Model):
    """Question model for travel Q&A"""

    id = fields.CharField(max_length=36, pk=True, default=lambda: str(uuid.uuid4()))
    title = fields.CharField(max_length=255)
    content = fields.TextField()
    status = fields.CharField(max_length=20, default="open")  # open, answered, closed
    view_count = fields.IntField(default=0)
    answer_count = fields.IntField(default=0)

    # Timestamps
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    # Relationships
    author: fields.ForeignKeyRelation["User"] = fields.ForeignKeyField("models.User", related_name="questions")
    destination: fields.ForeignKeyRelation["Destination"] = fields.ForeignKeyField("models.Destination", related_name="questions", null=True)
    answers: fields.ReverseRelation["Answer"]

    class Meta:
        table = "questions"

    def __str__(self):
        return f"Question({self.title})"


class Answer(Model):
    """Answer model for questions"""

    id = fields.CharField(max_length=36, pk=True, default=lambda: str(uuid.uuid4()))
    content = fields.TextField()
    is_accepted = fields.BooleanField(default=False)
    like_count = fields.IntField(default=0)

    # Timestamps
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    # Relationships
    question: fields.ForeignKeyRelation["Question"] = fields.ForeignKeyField("models.Question", related_name="answers")
    author: fields.ForeignKeyRelation["User"] = fields.ForeignKeyField("models.User", related_name="answers")

    class Meta:
        table = "answers"

    def __str__(self):
        return f"Answer({self.id})"
