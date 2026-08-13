from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload

from app.models import WishlistItem, Listing


def get_wishlist(db: Session, user_id: int):
    return (
        db.query(WishlistItem)
        .filter(WishlistItem.user_id == user_id)
        .options(joinedload(WishlistItem.listing).joinedload(Listing.images))
        .order_by(WishlistItem.created_at.desc())
        .all()
    )


def add_to_wishlist(db: Session, user_id: int, listing_id: int):
    listing = db.get(Listing, listing_id)
    if not listing or not listing.is_active:
        raise HTTPException(status_code=404, detail="Listing not found")

    existing = (
        db.query(WishlistItem)
        .filter(WishlistItem.user_id == user_id, WishlistItem.listing_id == listing_id)
        .first()
    )
    if existing:
        return existing

    item = WishlistItem(user_id=user_id, listing_id=listing_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def remove_from_wishlist(db: Session, user_id: int, listing_id: int):
    item = (
        db.query(WishlistItem)
        .filter(WishlistItem.user_id == user_id, WishlistItem.listing_id == listing_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Item not in wishlist")

    db.delete(item)
    db.commit()


def get_wishlist_listing_ids(db: Session, user_id: int) -> list[int]:
    rows = (
        db.query(WishlistItem.listing_id)
        .filter(WishlistItem.user_id == user_id)
        .all()
    )
    return [r[0] for r in rows]
