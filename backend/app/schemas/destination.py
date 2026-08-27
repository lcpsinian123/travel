"""
Destination schemas - Compatible with Tortoise ORM
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class DestinationBase(BaseModel):
    slug: str
    name_en: str
    name_zh: Optional[str] = None
    country: Optional[str] = "China"
    region: Optional[str] = None
    description: Optional[str] = None
    cover_image: Optional[str] = None
    tags: Optional[List[str]] = []
    is_featured: Optional[bool] = False


class DestinationCreate(DestinationBase):
    pass


class DestinationUpdate(BaseModel):
    name_en: Optional[str] = None
    name_zh: Optional[str] = None
    description: Optional[str] = None
    cover_image: Optional[str] = None
    tags: Optional[List[str]] = None
    is_featured: Optional[bool] = None


class DestinationResponse(DestinationBase):
    id: str
    view_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
