from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models import Review, Listing


def get_reviews(db: Session, listing_id: int):
    listing = db.get(Listing, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    return (
        db.query(Review)
        .filter(Review.listing_id == listing_id)
        .order_by(Review.created_at.desc())
        .all()
    )


def create_review(db: Session, listing_id: int, user_id: int, rating: int, comment: str, booking_id=None):
    listing = db.get(Listing, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    review = Review(
        listing_id=listing_id,
        user_id=user_id,
        booking_id=booking_id,
        rating=rating,
        comment=comment,
    )
    db.add(review)

    # Update listing rating
    listing.review_count += 1
    all_reviews = db.query(Review).filter(Review.listing_id == listing_id).all()
    total_rating = sum(r.rating for r in all_reviews) + rating
    listing.rating = round(total_rating / (len(all_reviews) + 1), 2)

    db.commit()
    db.refresh(review)
    return review
