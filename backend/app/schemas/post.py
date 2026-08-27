"""
Post schemas - Compatible with Tortoise ORM
"""
from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime


class AuthorResponse(BaseModel):
    id: str
    username: str
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True


class DestinationResponse(BaseModel):
    id: str
    slug: str
    name_en: str
    name_zh: Optional[str] = None
    region: Optional[str] = None
    cover_image: Optional[str] = None
    view_count: int = 0

    class Config:
        from_attributes = True


class PostBase(BaseModel):
    title: str
    slug: str
    content: str
    excerpt: Optional[str] = None
    cover_image: Optional[str] = None
    tags: Optional[List[str]] = []


class PostCreate(PostBase):
    destination_id: Optional[str] = None
    status: str = "published"

    @field_validator("tags", mode="before")
    @classmethod
    def tags_to_list(cls, v):
        if isinstance(v, str):
            return [t.strip() for t in v.split(",") if t.strip()]
        return v or []


class PostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    excerpt: Optional[str] = None
    cover_image: Optional[str] = None
    destination_id: Optional[str] = None
    tags: Optional[List[str]] = None
    status: Optional[str] = None

    @field_validator("tags", mode="before")
    @classmethod
    def tags_to_list(cls, v):
        if isinstance(v, str):
            return [t.strip() for t in v.split(",") if t.strip()]
        return v or []


class PostResponse(PostBase):
    id: str
    author_id: str
    author: AuthorResponse
    destination_id: Optional[str] = None
    destination: Optional[DestinationResponse] = None
    status: str
    view_count: int
    like_count: int
    comment_count: int
    created_at: datetime
    updated_at: datetime
    published_at: Optional[str] = None

    class Config:
        from_attributes = True

    @field_validator("tags", mode="before")
    @classmethod
    def tags_to_list(cls, v):
        if isinstance(v, str):
            return [t.strip() for t in v.split(",") if t.strip()] if v else []
        return v or []
