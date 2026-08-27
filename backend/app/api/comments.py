"""
Comment API routes - Tortoise ORM
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status

from ..models.comment import Comment
from ..models.user import User
from ..models.post import Post
from ..schemas.comment import CommentCreate, CommentResponse
from ..api.deps import get_current_user

router = APIRouter(prefix="/comments", tags=["Comments"])


def build_comment_tree(comments: List) -> List[dict]:
    """Build nested comment tree from flat list"""
    comment_dict = {}
    for comment in comments:
        comment_dict[comment.id] = {
            "id": comment.id,
            "post_id": comment.post_id,
            "author_id": comment.author_id,
            "author": comment.author,
            "parent_id": comment.parent_id,
            "content": comment.content,
            "like_count": comment.like_count,
            "created_at": comment.created_at,
            "updated_at": comment.updated_at,
            "replies": [],
        }

    root_comments = []
    for comment in comments:
        if comment.parent_id is None:
            root_comments.append(comment_dict[comment.id])
        else:
            parent = comment_dict.get(comment.parent_id)
            if parent:
                parent["replies"].append(comment_dict[comment.id])

    return root_comments


@router.get("/post/{post_id}", response_model=List[CommentResponse])
async def get_post_comments(post_id: str):
    """Get all comments for a post"""
    comments = await Comment.filter(post_id=post_id).order_by("created_at").prefetch_related("author")
    return build_comment_tree(list(comments))


@router.post("/", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def create_comment(
    comment_data: CommentCreate,
    current_user: User = Depends(get_current_user),
):
    """Create a new comment"""
    new_comment = await Comment.create(
        author_id=current_user.id,
        post_id=comment_data.post_id,
        content=comment_data.content,
        parent_id=comment_data.parent_id,
    )

    # Update post comment count
    post = await Post.filter(id=comment_data.post_id).first()
    if post:
        post.comment_count += 1
        await post.save()

    return {
        "id": new_comment.id,
        "post_id": new_comment.post_id,
        "author_id": new_comment.author_id,
        "author": current_user,
        "parent_id": new_comment.parent_id,
        "content": new_comment.content,
        "like_count": new_comment.like_count,
        "created_at": new_comment.created_at,
        "updated_at": new_comment.updated_at,
        "replies": [],
    }


@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    comment_id: str,
    current_user: User = Depends(get_current_user),
):
    """Delete a comment"""
    comment = await Comment.filter(id=comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if comment.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Update post comment count
    post = await Post.filter(id=comment.post_id).first()
    if post:
        post.comment_count = max(0, post.comment_count - 1)
        await post.save()

    await comment.delete()
