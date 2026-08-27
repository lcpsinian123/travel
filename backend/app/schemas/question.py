"""
Question and Answer schemas - Compatible with Tortoise ORM
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from .user import UserResponse


class QuestionCreate(BaseModel):
    title: str
    content: str
    destination_id: Optional[str] = None


class QuestionUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    status: Optional[str] = None


class QuestionResponse(BaseModel):
    id: str
    author_id: str
    author: UserResponse
    destination_id: Optional[str] = None
    destination: Optional[dict] = None
    title: str
    content: str
    status: str
    view_count: int
    answer_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AnswerCreate(BaseModel):
    content: str


class AnswerResponse(BaseModel):
    id: str
    question_id: str
    author_id: str
    author: UserResponse
    content: str
    is_accepted: bool
    like_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
