"""
Question and Answer API routes - Tortoise ORM
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query

from ..models.question import Question, Answer
from ..models.user import User
from ..schemas.question import (
    QuestionCreate, QuestionUpdate, QuestionResponse,
    AnswerCreate, AnswerResponse
)
from ..api.deps import get_current_user

router = APIRouter(prefix="/questions", tags=["Questions"])


@router.get("/", response_model=List[QuestionResponse])
async def list_questions(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    destination_id: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
):
    """List all questions"""
    query = Question.all()

    if destination_id:
        query = query.filter(destination_id=destination_id)
    if status_filter:
        query = query.filter(status=status_filter)

    questions = await query.order_by("-created_at").offset(skip).limit(limit).prefetch_related("author", "destination")
    return questions


@router.get("/{question_id}", response_model=QuestionResponse)
async def get_question(question_id: str):
    """Get a question by ID"""
    question = await Question.filter(id=question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    # Increment view count
    question.view_count += 1
    await question.save()

    return question


@router.post("/", response_model=QuestionResponse, status_code=status.HTTP_201_CREATED)
async def create_question(
    question_data: QuestionCreate,
    current_user: User = Depends(get_current_user),
):
    """Create a new question"""
    new_question = await Question.create(
        author_id=current_user.id,
        title=question_data.title,
        content=question_data.content,
        destination_id=question_data.destination_id,
    )
    return await Question.filter(id=new_question.id).first().prefetch_related("author", "destination")


@router.put("/{question_id}", response_model=QuestionResponse)
async def update_question(
    question_id: str,
    question_data: QuestionUpdate,
    current_user: User = Depends(get_current_user),
):
    """Update a question"""
    question = await Question.filter(id=question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    if question.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    update_data = question_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(question, key, value)

    await question.save()
    return question


@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question(
    question_id: str,
    current_user: User = Depends(get_current_user),
):
    """Delete a question"""
    question = await Question.filter(id=question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    if question.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    await question.delete()


# Answer endpoints
@router.get("/{question_id}/answers", response_model=List[AnswerResponse])
async def get_question_answers(question_id: str):
    """Get all answers for a question"""
    answers = await Answer.filter(question_id=question_id).order_by("-is_accepted", "-like_count", "created_at").prefetch_related("author")
    return answers


@router.post("/{question_id}/answers", response_model=AnswerResponse, status_code=status.HTTP_201_CREATED)
async def create_answer(
    question_id: str,
    answer_data: AnswerCreate,
    current_user: User = Depends(get_current_user),
):
    """Create an answer for a question"""
    # Check question exists
    question = await Question.filter(id=question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    new_answer = await Answer.create(
        author_id=current_user.id,
        question_id=question_id,
        content=answer_data.content,
    )

    # Update question answer count
    question.answer_count += 1
    if question.answer_count == 1:
        question.status = "answered"
    await question.save()

    return new_answer


@router.put("/{question_id}/answers/{answer_id}/accept", response_model=AnswerResponse)
async def accept_answer(
    question_id: str,
    answer_id: str,
    current_user: User = Depends(get_current_user),
):
    """Accept an answer (only question author can do this)"""
    # Get question
    question = await Question.filter(id=question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    if question.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only question author can accept answers")

    # Get answer
    answer = await Answer.filter(id=answer_id).first()
    if not answer or answer.question_id != question_id:
        raise HTTPException(status_code=404, detail="Answer not found")

    # Unaccept all other answers
    await Answer.filter(question_id=question_id).update(is_accepted=False)

    # Accept this answer
    answer.is_accepted = True
    await answer.save()
    question.status = "answered"
    await question.save()

    return answer
