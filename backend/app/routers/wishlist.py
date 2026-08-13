from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.services import wishlist_service

router = APIRouter()


@router.get("")
def get_wishlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items = wishlist_service.get_wishlist(db, current_user.id)
    result = []
    for item in items:
        listing = item.listing
        result.append({
            "id": item.id,
            "listing_id": item.listing_id,
            "created_at": str(item.created_at),
            "listing": {
                "id": listing.id,
                "title": listing.title,
                "property_type": listing.property_type,
                "location": listing.location,
                "city": listing.city,
                "country": listing.country,
                "price_per_night": listing.price_per_night,
                "max_guests": listing.max_guests,
                "bedrooms": listing.bedrooms,
                "beds": listing.beds,
                "bathrooms": listing.bathrooms,
                "rating": listing.rating,
                "review_count": listing.review_count,
                "images": [{"id": img.id, "image_url": img.image_url, "display_order": img.display_order} for img in listing.images],
            },
        })
    return {"data": result}


@router.get("/ids")
def get_wishlist_ids(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ids = wishlist_service.get_wishlist_listing_ids(db, current_user.id)
    return {"data": ids}


@router.post("/{listing_id}", status_code=201)
def add_to_wishlist(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    wishlist_service.add_to_wishlist(db, current_user.id, listing_id)
    return {"message": "Added to wishlist"}


@router.delete("/{listing_id}", status_code=204)
def remove_from_wishlist(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    wishlist_service.remove_from_wishlist(db, current_user.id, listing_id)
