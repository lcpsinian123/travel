"""
Comment schemas - Compatible with Tortoise ORM
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from .user import UserResponse


class CommentCreate(BaseModel):
    content: str
    post_id: str
    parent_id: Optional[str] = None


class AuthorSimple(BaseModel):
    id: str
    username: str
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True


class CommentResponse(BaseModel):
    id: str
    post_id: str
    author_id: str
    author: AuthorSimple
    parent_id: Optional[str] = None
    content: str
    like_count: int
    created_at: datetime
    updated_at: datetime
    replies: List["CommentResponse"] = []

    class Config:
        from_attributes = True


# Update forward reference
CommentResponse.model_rebuild()
