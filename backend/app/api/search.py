"""
Search API routes
"""
from typing import List, Optional
from fastapi import APIRouter, Query

from ..models.post import Post
from ..models.destination import Destination
from ..models.user import User
from ..models.question import Question
from ..schemas.post import PostResponse
from ..schemas.destination import DestinationResponse
from ..schemas.user import UserResponse
from ..schemas.question import QuestionResponse

router = APIRouter(prefix="/search", tags=["Search"])


@router.get("/", response_model=dict)
async def search_all(
    q: str = Query(..., min_length=1, description="Search query"),
    type: Optional[str] = Query(None, description="Filter by type: posts, destinations, users, questions, all"),
    limit: int = Query(10, ge=1, le=50),
):
    """
    Global search across posts, destinations, users, and questions
    """
    results = {
        "posts": [],
        "destinations": [],
        "users": [],
        "questions": [],
    }

    search_type = type or "all"
    q_lower = q.lower()

    # Search posts
    if search_type in ["all", "posts"]:
        posts = await Post.filter(status="published").order_by("-view_count").limit(limit)
        # Filter by search query in title or content
        filtered_posts = [
            p for p in posts
            if q_lower in p.title.lower() or q_lower in (p.content or "").lower()
        ]
        results["posts"] = filtered_posts[:limit]

    # Search destinations
    if search_type in ["all", "destinations"]:
        destinations = await Destination.all().limit(limit * 2)
        filtered_destinations = [
            d for d in destinations
            if q_lower in d.name_en.lower() or
               (d.name_zh and q_lower in d.name_zh.lower()) or
               (d.description and q_lower in d.description.lower())
        ]
        results["destinations"] = filtered_destinations[:limit]

    # Search users
    if search_type in ["all", "users"]:
        users = await User.filter(is_active=True).limit(limit * 2)
        filtered_users = [
            u for u in users
            if q_lower in u.username.lower() or
               (u.display_name and q_lower in u.display_name.lower())
        ]
        results["users"] = filtered_users[:limit]

    # Search questions
    if search_type in ["all", "questions"]:
        questions = await Question.all().limit(limit * 2)
        filtered_questions = [
            q_obj for q_obj in questions
            if q_lower in q_obj.title.lower() or q_lower in q_obj.content.lower()
        ]
        results["questions"] = filtered_questions[:limit]

    return results


@router.get("/posts", response_model=List[PostResponse])
async def search_posts(
    q: str = Query(..., min_length=1),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    """Search posts by title or content"""
    posts = await Post.filter(status="published").order_by("-published_at").offset(skip).limit(limit * 3)
    q_lower = q.lower()
    filtered_posts = [
        p for p in posts
        if q_lower in p.title.lower() or q_lower in (p.content or "").lower()
    ]
    return filtered_posts[:limit]


@router.get("/destinations", response_model=List[DestinationResponse])
async def search_destinations(
    q: str = Query(..., min_length=1),
    limit: int = Query(10, ge=1, le=50),
):
    """Search destinations by name or description"""
    destinations = await Destination.all().limit(limit * 3)
    q_lower = q.lower()
    filtered = [
        d for d in destinations
        if q_lower in d.name_en.lower() or
           (d.name_zh and q_lower in d.name_zh.lower()) or
           (d.description and q_lower in d.description.lower())
    ]
    return filtered[:limit]


@router.get("/users", response_model=List[UserResponse])
async def search_users(
    q: str = Query(..., min_length=1),
    limit: int = Query(10, ge=1, le=50),
):
    """Search users by username or display name"""
    users = await User.filter(is_active=True).limit(limit * 3)
    q_lower = q.lower()
    filtered = [
        u for u in users
        if q_lower in u.username.lower() or
           (u.display_name and q_lower in u.display_name.lower())
    ]
    return filtered[:limit]


@router.get("/questions", response_model=List[QuestionResponse])
async def search_questions(
    q: str = Query(..., min_length=1),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    """Search questions by title or content"""
    questions = await Question.all().order_by("-created_at").offset(skip).limit(limit * 3)
    q_lower = q.lower()
    filtered = [
        q_obj for q_obj in questions
        if q_lower in q_obj.title.lower() or q_lower in q_obj.content.lower()
    ]
    return filtered[:limit]
