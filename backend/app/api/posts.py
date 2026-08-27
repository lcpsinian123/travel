"""
Post API routes - Tortoise ORM
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query

from ..models.post import Post
from ..models.user import User
from ..schemas.post import PostCreate, PostUpdate, PostResponse
from ..api.deps import get_current_user, get_current_user_optional

router = APIRouter(prefix="/posts", tags=["Posts"])


@router.get("/", response_model=List[PostResponse])
async def list_posts(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    destination_id: Optional[str] = None,
    author_id: Optional[str] = None,
    tag: Optional[str] = None,
):
    """List published posts with optional filters"""
    query = Post.filter(status="published")

    if destination_id:
        query = query.filter(destination_id=destination_id)
    if author_id:
        query = query.filter(author_id=author_id)
    if tag:
        query = query.filter(tags__contains=tag)

    posts = await query.order_by("-published_at").offset(skip).limit(limit).prefetch_related("author", "destination")
    return posts


@router.get("/{post_id}", response_model=PostResponse)
async def get_post(post_id: str):
    """Get a post by ID"""
    post = await Post.filter(id=post_id).first().prefetch_related("author", "destination")
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Increment view count
    post.view_count += 1
    await post.save()

    return post


@router.get("/slug/{slug}", response_model=PostResponse)
async def get_post_by_slug(slug: str):
    """Get a post by slug"""
    post = await Post.filter(slug=slug).first().prefetch_related("author", "destination")
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Increment view count
    post.view_count += 1
    await post.save()

    return post


@router.post("/", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(
    post_data: PostCreate,
    current_user: User = Depends(get_current_user),
):
    """Create a new post"""
    # Check if slug exists
    existing = await Post.filter(slug=post_data.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Slug already exists")

    post_dict = post_data.model_dump()
    # Convert tags list to comma-separated string
    if post_dict.get("tags"):
        post_dict["tags"] = ",".join(post_dict["tags"])

    new_post = await Post.create(
        author_id=current_user.id,
        **post_dict
    )
    return await Post.filter(id=new_post.id).first().prefetch_related("author", "destination")


@router.put("/{post_id}", response_model=PostResponse)
async def update_post(
    post_id: str,
    post_data: PostUpdate,
    current_user: User = Depends(get_current_user),
):
    """Update a post"""
    post = await Post.filter(id=post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if post.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this post")

    update_data = post_data.model_dump(exclude_unset=True)
    # Convert tags list to comma-separated string
    if "tags" in update_data and update_data["tags"]:
        update_data["tags"] = ",".join(update_data["tags"])

    for key, value in update_data.items():
        setattr(post, key, value)

    await post.save()
    return await Post.filter(id=post.id).first().prefetch_related("author", "destination")


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    post_id: str,
    current_user: User = Depends(get_current_user),
):
    """Delete a post"""
    post = await Post.filter(id=post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if post.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")

    await post.delete()


@router.post("/{post_id}/like", status_code=status.HTTP_201_CREATED)
async def toggle_like(
    post_id: str,
    current_user: User = Depends(get_current_user),
):
    """Toggle like on a post"""
    from ..models.like import Like

    existing_like = await Like.filter(post_id=post_id, user_id=current_user.id).first()

    if existing_like:
        # Unlike
        await existing_like.delete()
        post = await Post.filter(id=post_id).first()
        post.like_count = max(0, post.like_count - 1)
        await post.save()
        return {"liked": False, "like_count": post.like_count}
    else:
        # Like
        await Like.create(user_id=current_user.id, post_id=post_id)
        post = await Post.filter(id=post_id).first()
        post.like_count += 1
        await post.save()
        return {"liked": True, "like_count": post.like_count}


@router.post("/{post_id}/collect", status_code=status.HTTP_201_CREATED)
async def toggle_collect(
    post_id: str,
    current_user: User = Depends(get_current_user),
):
    """Toggle collection of a post"""
    from ..models.collection import Collection

    existing = await Collection.filter(post_id=post_id, user_id=current_user.id).first()

    if existing:
        await existing.delete()
        return {"collected": False}
    else:
        await Collection.create(user_id=current_user.id, post_id=post_id)
        return {"collected": True}
