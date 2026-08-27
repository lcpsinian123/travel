"""
User schemas - Compatible with Tortoise ORM
"""
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    country: Optional[str] = None


class UserCreate(UserBase):
    email: EmailStr
    username: str
    password: str


class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    country: Optional[str] = None


class UserResponse(UserBase):
    id: str
    username: str
    is_local_guide: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserProfileResponse(UserResponse):
    post_count: int = 0
    question_count: int = 0
    posts: List["PostResponse"] = []


# Import PostResponse at the end to avoid circular import
from .post import PostResponse
UserProfileResponse.model_rebuild()
