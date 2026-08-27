"""
Authentication API routes - Tortoise ORM
"""
from fastapi import APIRouter, HTTPException, status

from ..models.user import User
from ..schemas.auth import Token, UserLogin
from ..schemas.user import UserCreate
from ..services.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """Register a new user"""
    # Check if email exists
    existing_user = await User.filter(email=user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Check if username exists
    existing_user = await User.filter(username=user_data.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )

    # Create user
    hashed_password = get_password_hash(user_data.password)
    new_user = await User.create(
        email=user_data.email,
        username=user_data.username,
        password_hash=hashed_password,
        display_name=user_data.username,
    )

    # Generate token
    access_token = create_access_token(data={"sub": str(new_user.id)})
    return Token(access_token=access_token)


@router.post("/login", response_model=Token)
async def login(user_data: UserLogin):
    """Login and get access token"""
    user = await User.filter(email=user_data.email).first()

    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is disabled"
        )

    access_token = create_access_token(data={"sub": str(user.id)})
    return Token(access_token=access_token)
