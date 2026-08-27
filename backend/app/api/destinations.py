"""
Destination API routes - Tortoise ORM
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query

from ..models.destination import Destination
from ..schemas.destination import DestinationCreate, DestinationUpdate, DestinationResponse

router = APIRouter(prefix="/destinations", tags=["Destinations"])


@router.get("/", response_model=List[DestinationResponse])
async def list_destinations(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    region: Optional[str] = None,
    featured: Optional[bool] = None,
):
    """List all destinations with optional filters"""
    query = Destination.all()

    if region:
        query = query.filter(region=region)
    if featured is not None:
        query = query.filter(is_featured=featured)

    destinations = await query.order_by("-is_featured", "-view_count").offset(skip).limit(limit)
    return destinations


@router.get("/regions", response_model=List[str])
async def list_regions():
    """Get list of all unique regions"""
    destinations = await Destination.all().values_list("region", flat=True)
    return list(set(r for r in destinations if r))


@router.get("/{destination_id}", response_model=DestinationResponse)
async def get_destination(destination_id: str):
    """Get destination by ID"""
    destination = await Destination.filter(id=destination_id).first()
    if not destination:
        raise HTTPException(status_code=404, detail="Destination not found")

    # Increment view count
    destination.view_count += 1
    await destination.save()

    return destination


@router.get("/slug/{slug}", response_model=DestinationResponse)
async def get_destination_by_slug(slug: str):
    """Get destination by slug"""
    destination = await Destination.filter(slug=slug).first()
    if not destination:
        raise HTTPException(status_code=404, detail="Destination not found")
    return destination


@router.post("/", response_model=DestinationResponse, status_code=status.HTTP_201_CREATED)
async def create_destination(destination_data: DestinationCreate):
    """Create a new destination (admin only in production)"""
    # Check if slug exists
    existing = await Destination.filter(slug=destination_data.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Slug already exists")

    new_destination = await Destination.create(**destination_data.model_dump())
    return new_destination


@router.put("/{destination_id}", response_model=DestinationResponse)
async def update_destination(
    destination_id: str,
    destination_data: DestinationUpdate,
):
    """Update a destination"""
    destination = await Destination.filter(id=destination_id).first()
    if not destination:
        raise HTTPException(status_code=404, detail="Destination not found")

    update_data = destination_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(destination, key, value)

    await destination.save()
    return destination


@router.delete("/{destination_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_destination(destination_id: str):
    """Delete a destination"""
    destination = await Destination.filter(id=destination_id).first()
    if not destination:
        raise HTTPException(status_code=404, detail="Destination not found")

    await destination.delete()
