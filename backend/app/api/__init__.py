"""
API routes
"""
from .auth import router as auth_router
from .users import router as users_router
from .destinations import router as destinations_router
from .posts import router as posts_router
from .comments import router as comments_router
from .questions import router as questions_router
from .topics import router as topics_router
from .search import router as search_router
from .home import router as home_router

__all__ = [
    "auth_router",
    "users_router",
    "destinations_router",
    "posts_router",
    "comments_router",
    "questions_router",
    "topics_router",
    "search_router",
    "home_router",
]
