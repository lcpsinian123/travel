"""
Authentication schemas
"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[UUID] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str
