from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.listing import ListingOut, ListingCard, ListingCreate, ListingUpdate, PaginatedListings
from app.services import listing_service

router = APIRouter()


@router.get("")
def list_listings(
    location: Optional[str] = None,
    check_in: Optional[date] = None,
    check_out: Optional[date] = None,
    guests: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    property_type: Optional[str] = None,
    amenities: Optional[str] = None,
    sort_by: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db),
):
    result = listing_service.get_listings(
        db, location=location, check_in=check_in, check_out=check_out,
        guests=guests, min_price=min_price, max_price=max_price,
        property_type=property_type, amenities=amenities, sort_by=sort_by,
        page=page, limit=limit,
    )
    return PaginatedListings(
        data=[ListingCard.model_validate(l) for l in result["data"]],
        total=result["total"],
        page=result["page"],
        limit=result["limit"],
        total_pages=result["total_pages"],
    )


@router.get("/{listing_id}")
def get_listing(listing_id: int, db: Session = Depends(get_db)):
    listing = listing_service.get_listing_detail(db, listing_id)
    return {"data": ListingOut.model_validate(listing)}


@router.post("", status_code=201)
def create_listing(
    data: ListingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    listing = listing_service.create_listing(db, data, current_user.id)
    return {"data": ListingOut.model_validate(listing), "message": "Listing created"}


@router.put("/{listing_id}")
def update_listing(
    listing_id: int,
    data: ListingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    listing = listing_service.update_listing(db, listing_id, data, current_user.id)
    return {"data": ListingOut.model_validate(listing), "message": "Listing updated"}


@router.delete("/{listing_id}", status_code=204)
def delete_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    listing_service.delete_listing(db, listing_id, current_user.id)


@router.get("/{listing_id}/availability")
def get_availability(listing_id: int, db: Session = Depends(get_db)):
    return listing_service.get_availability(db, listing_id)


@router.get("/{listing_id}/reviews")
def get_listing_reviews(listing_id: int, db: Session = Depends(get_db)):
    from app.services import review_service
    reviews = review_service.get_reviews(db, listing_id)
    return {
        "data": [
            {
                "id": r.id,
                "listing_id": r.listing_id,
                "user_id": r.user_id,
                "rating": r.rating,
                "comment": r.comment,
                "created_at": r.created_at,
                "user_name": r.user.name if r.user else None,
                "user_avatar": r.user.avatar_url if r.user else None,
            }
            for r in reviews
        ]
    }


@router.post("/{listing_id}/reviews", status_code=201)
def create_review(
    listing_id: int,
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.schemas.review import ReviewCreate
    review_data = ReviewCreate(**data)
    from app.services import review_service
    review = review_service.create_review(
        db, listing_id, current_user.id,
        review_data.rating, review_data.comment, review_data.booking_id,
    )
    return {
        "data": {
            "id": review.id,
            "listing_id": review.listing_id,
            "rating": review.rating,
            "comment": review.comment,
            "created_at": review.created_at,
        },
        "message": "Review created",
    }
