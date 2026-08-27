"""
Home API routes - Aggregated data for homepage
"""
from fastapi import APIRouter, Query

from ..models.post import Post
from ..models.destination import Destination
from ..models.question import Question
from ..models.user import User
from ..schemas.post import PostResponse
from ..schemas.destination import DestinationResponse
from ..schemas.question import QuestionResponse
from ..schemas.post import PostResponse, AuthorResponse

router = APIRouter(prefix="/home", tags=["Home"])


@router.get("/", response_model=dict)
async def get_home_data(
    limit: int = Query(10, ge=1, le=50),
):
    """
    Get aggregated data for homepage:
    - Featured destinations
    - Latest posts
    - Popular posts
    - Recent questions
    - Active users
    """
    # Featured destinations
    featured_destinations = await Destination.filter(is_featured=True).order_by("-view_count").limit(limit)
    destinations_data = [
        {
            "id": d.id,
            "slug": d.slug,
            "name_en": d.name_en,
            "name_zh": d.name_zh,
            "region": d.region,
            "cover_image": d.cover_image,
            "view_count": d.view_count,
        }
        for d in featured_destinations
    ]

    # If no featured destinations, get top by views
    if not destinations_data:
        all_destinations = await Destination.all().order_by("-view_count").limit(limit)
        destinations_data = [
            {
                "id": d.id,
                "slug": d.slug,
                "name_en": d.name_en,
                "name_zh": d.name_zh,
                "region": d.region,
                "cover_image": d.cover_image,
                "view_count": d.view_count,
            }
            for d in all_destinations
        ]

    # Latest posts (published, ordered by creation date)
    latest_posts = await Post.filter(status="published").order_by("-created_at").limit(limit).prefetch_related("author", "destination")

    # Popular posts (by view count)
    popular_posts = await Post.filter(status="published").order_by("-view_count").limit(limit).prefetch_related("author", "destination")

    # Latest questions
    latest_questions = await Question.all().order_by("-created_at").limit(limit).prefetch_related("author", "destination")

    # Active users (by post count - we approximate by recent activity)
    recent_posts = await Post.filter(status="published").order_by("-created_at").limit(100)
    author_ids = list(set(p.author_id for p in recent_posts))
    active_users = []
    for uid in author_ids[:5]:  # Get up to 5 users
        user = await User.filter(id=uid, is_active=True).first()
        if user:
            active_users.append({
                "id": user.id,
                "username": user.username,
                "display_name": user.display_name,
                "avatar_url": user.avatar_url,
            })

    return {
        "destinations": destinations_data,
        "latest_posts": latest_posts,
        "popular_posts": popular_posts,
        "latest_questions": latest_questions,
        "active_users": active_users,
    }


@router.get("/destinations", response_model=list)
async def get_featured_destinations(
    limit: int = Query(6, ge=1, le=20),
):
    """Get featured destinations for homepage carousel"""
    destinations = await Destination.all().order_by("-is_featured", "-view_count").limit(limit)
    return destinations


@router.get("/posts/latest", response_model=list)
async def get_latest_posts(
    limit: int = Query(10, ge=1, le=50),
):
    """Get latest published posts"""
    posts = await Post.filter(status="published").order_by("-created_at").limit(limit).prefetch_related("author", "destination")
    return posts


@router.get("/posts/popular", response_model=list)
async def get_popular_posts(
    limit: int = Query(10, ge=1, le=50),
):
    """Get most viewed posts"""
    posts = await Post.filter(status="published").order_by("-view_count").limit(limit).prefetch_related("author", "destination")
    return posts


@router.get("/questions/latest", response_model=list)
async def get_latest_questions(
    limit: int = Query(10, ge=1, le=50),
):
    """Get latest questions"""
    questions = await Question.all().order_by("-created_at").limit(limit).prefetch_related("author", "destination")
    return questions
