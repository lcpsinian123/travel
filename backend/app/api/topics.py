"""
Topic API routes
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query

from ..models.topic import Topic
from ..models.post import Post
from ..schemas.topic import TopicCreate, TopicUpdate, TopicResponse, TopicWithPosts

router = APIRouter(prefix="/topics", tags=["Topics"])


@router.get("/", response_model=List[TopicResponse])
async def list_topics(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    """List all topics"""
    topics = await Topic.all().order_by("-post_count", "name").offset(skip).limit(limit)
    return topics


@router.get("/{topic_id}", response_model=TopicWithPosts)
async def get_topic(topic_id: str):
    """Get topic by ID with recent posts"""
    topic = await Topic.filter(id=topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    # Get recent posts for this topic
    posts = await Post.filter(
        status="published",
        tags__contains=topic.slug
    ).order_by("-published_at").limit(10).prefetch_related("author", "destination")

    return {
        "id": topic.id,
        "name": topic.name,
        "slug": topic.slug,
        "description": topic.description,
        "icon": topic.icon,
        "post_count": topic.post_count,
        "created_at": topic.created_at,
        "updated_at": topic.updated_at,
        "posts": posts,
    }


@router.get("/slug/{slug}", response_model=TopicWithPosts)
async def get_topic_by_slug(slug: str):
    """Get topic by slug with recent posts"""
    topic = await Topic.filter(slug=slug).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    posts = await Post.filter(
        status="published",
        tags__contains=topic.slug
    ).order_by("-published_at").limit(10).prefetch_related("author", "destination")

    return {
        "id": topic.id,
        "name": topic.name,
        "slug": topic.slug,
        "description": topic.description,
        "icon": topic.icon,
        "post_count": topic.post_count,
        "created_at": topic.created_at,
        "updated_at": topic.updated_at,
        "posts": posts,
    }


@router.post("/", response_model=TopicResponse, status_code=status.HTTP_201_CREATED)
async def create_topic(
    topic_data: TopicCreate,
):
    """Create a new topic"""
    existing = await Topic.filter(slug=topic_data.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Slug already exists")

    new_topic = await Topic.create(**topic_data.model_dump())
    return new_topic


@router.put("/{topic_id}", response_model=TopicResponse)
async def update_topic(
    topic_id: str,
    topic_data: TopicUpdate,
):
    """Update a topic"""
    topic = await Topic.filter(id=topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    update_data = topic_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(topic, key, value)

    await topic.save()
    return topic


@router.delete("/{topic_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_topic(topic_id: str):
    """Delete a topic"""
    topic = await Topic.filter(id=topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    await topic.delete()
