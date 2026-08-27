"""
Pydantic schemas for request/response validation
"""
from .user import UserCreate, UserUpdate, UserResponse
from .auth import Token, TokenData, UserLogin
from .destination import DestinationCreate, DestinationUpdate, DestinationResponse
from .post import PostCreate, PostUpdate, PostResponse
from .comment import CommentCreate, CommentResponse
from .question import QuestionCreate, QuestionResponse, AnswerCreate, AnswerResponse

__all__ = [
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "Token",
    "TokenData",
    "UserLogin",
    "DestinationCreate",
    "DestinationUpdate",
    "DestinationResponse",
    "PostCreate",
    "PostUpdate",
    "PostResponse",
    "CommentCreate",
    "CommentResponse",
    "QuestionCreate",
    "QuestionResponse",
    "AnswerCreate",
    "AnswerResponse",
]
