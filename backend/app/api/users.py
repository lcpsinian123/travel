"""
User API routes - Tortoise ORM
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query

from ..models.user import User
from ..models.post import Post
from ..models.collection import Collection
from ..schemas.user import UserResponse, UserUpdate, UserProfileResponse
from ..schemas.post import PostResponse
from ..api.deps import get_current_user, get_current_user_optional

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_me(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
):
    """Update current user profile"""
    update_data = user_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(current_user, key, value)
    await current_user.save()
    return current_user


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str):
    """Get user by ID"""
    user = await User.filter(id=user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/username/{username}", response_model=UserResponse)
async def get_user_by_username(username: str):
    """Get user by username"""
    user = await User.filter(username=username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/{user_id}/profile", response_model=UserProfileResponse)
async def get_user_profile(
    user_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=50),
):
    """Get user profile with their posts"""
    user = await User.filter(id=user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get user's published posts
    posts = await Post.filter(
        author_id=user_id,
        status="published"
    ).order_by("-created_at").offset(skip).limit(limit).prefetch_related("destination")

    # Count totals
    post_count = await Post.filter(author_id=user_id, status="published").count()
    question_count = await user.questions.all().count() if hasattr(user, 'questions') else 0

    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "display_name": user.display_name,
        "avatar_url": user.avatar_url,
        "bio": user.bio,
        "country": user.country,
        "is_local_guide": user.is_local_guide,
        "is_active": user.is_active,
        "created_at": user.created_at,
        "updated_at": user.updated_at,
        "post_count": post_count,
        "question_count": question_count,
        "posts": posts,
    }


@router.get("/{user_id}/posts", response_model=List[PostResponse])
async def get_user_posts(
    user_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    """Get all posts by a user"""
    user = await User.filter(id=user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    posts = await Post.filter(
        author_id=user_id,
        status="published"
    ).order_by("-created_at").offset(skip).limit(limit).prefetch_related("author", "destination")
    return posts


@router.get("/me/collections", response_model=List[PostResponse])
async def get_my_collections(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
):
    """Get current user's collection (liked posts)"""
    # Get user's liked posts
    from ..models.like import Like
    likes = await Like.filter(user_id=current_user.id).offset(skip).limit(limit)

    posts = []
    for like in likes:
        post = await Post.filter(id=like.post_id).first()
        if post:
            posts.append(post)

    return posts


@router.get("/{user_id}/collections", response_model=List[PostResponse])
async def get_user_collections(
    user_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    """Get a user's liked posts"""
    from ..models.like import Like

    user = await User.filter(id=user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    likes = await Like.filter(user_id=user_id).offset(skip).limit(limit)

    posts = []
    for like in likes:
        post = await Post.filter(id=like.post_id).first()
        if post:
            posts.append(post)

    return posts
