from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models import Listing
from app.schemas.listing import ListingCard
from app.services import host_service

router = APIRouter()


@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return {"data": host_service.get_host_stats(db, current_user.id)}


@router.get("/listings")
def get_host_listings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    listings = host_service.get_host_listings(db, current_user.id)
    return {"data": [ListingCard.model_validate(l) for l in listings]}


@router.get("/bookings")
def get_host_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    bookings = host_service.get_host_bookings(db, current_user.id)
    result = []
    for b in bookings:
        listing = db.get(Listing, b.listing_id)
        result.append({
            "id": b.id,
            "listing_id": b.listing_id,
            "guest_id": b.guest_id,
            "guest_name": b.guest.name if b.guest else None,
            "listing_title": listing.title if listing else None,
            "check_in": str(b.check_in),
            "check_out": str(b.check_out),
            "guests": b.guests,
            "total_price": b.total_price,
            "status": b.status,
            "created_at": str(b.created_at),
        })
    return {"data": result}
