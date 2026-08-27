"""
ChinaTravel API - Main Application Entry Point
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from tortoise import Tortoise

from .config import settings
from .api import (
    auth_router,
    users_router,
    destinations_router,
    posts_router,
    comments_router,
    questions_router,
    topics_router,
    search_router,
    home_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for database initialization"""
    await Tortoise.init(
        db_url=settings.DATABASE_URL,
        modules={
            "models": [
                "app.models.user",
                "app.models.destination",
                "app.models.post",
                "app.models.comment",
                "app.models.like",
                "app.models.collection",
                "app.models.question",
                "app.models.topic",
            ]
        },
        timezone="UTC",
    )
    await Tortoise.generate_schemas()
    yield
    await Tortoise.close_connections()


app = FastAPI(
    title=settings.APP_NAME,
    description="API for ChinaTravel - China Travel Community for International Visitors",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://chinatravel.example.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(users_router, prefix=settings.API_V1_PREFIX)
app.include_router(destinations_router, prefix=settings.API_V1_PREFIX)
app.include_router(posts_router, prefix=settings.API_V1_PREFIX)
app.include_router(comments_router, prefix=settings.API_V1_PREFIX)
app.include_router(questions_router, prefix=settings.API_V1_PREFIX)
app.include_router(topics_router, prefix=settings.API_V1_PREFIX)
app.include_router(search_router, prefix=settings.API_V1_PREFIX)
app.include_router(home_router, prefix=settings.API_V1_PREFIX)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": settings.APP_NAME,
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}
