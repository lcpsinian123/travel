"""
Topic schemas
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class TopicBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    icon: Optional[str] = None


class TopicCreate(TopicBase):
    pass


class TopicUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None


class TopicResponse(TopicBase):
    id: str
    post_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TopicWithPosts(TopicResponse):
    posts: List["PostResponse"] = []


# Import PostResponse to avoid circular import
from .post import PostResponse
TopicWithPosts.model_rebuild()
