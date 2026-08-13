import math
from typing import Optional, List

from fastapi import HTTPException
from sqlalchemy import func, or_
from sqlalchemy.orm import Session, joinedload

from app.models import Listing, ListingImage, Amenity, Booking, listing_amenities


def get_listings(
    db: Session,
    location: Optional[str] = None,
    check_in=None,
    check_out=None,
    guests: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    property_type: Optional[str] = None,
    amenities: Optional[str] = None,
    sort_by: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
):
    query = db.query(Listing).filter(Listing.is_active == True)

    if location:
        pattern = f"%{location}%"
        query = query.filter(
            or_(
                Listing.city.ilike(pattern),
                Listing.location.ilike(pattern),
                Listing.country.ilike(pattern),
            )
        )

    if guests:
        query = query.filter(Listing.max_guests >= guests)

    if min_price is not None:
        query = query.filter(Listing.price_per_night >= min_price)

    if max_price is not None:
        query = query.filter(Listing.price_per_night <= max_price)

    if property_type:
        types = [t.strip() for t in property_type.split(",")]
        query = query.filter(Listing.property_type.in_(types))
    else:
        # By default, exclude experiences and services from general listing queries
        query = query.filter(~Listing.property_type.in_(["experience", "service"]))

    if amenities:
        amenity_ids = [int(a) for a in amenities.split(",")]
        for aid in amenity_ids:
            query = query.filter(
                Listing.amenities.any(Amenity.id == aid)
            )

    # Filter out listings unavailable for requested dates
    if check_in and check_out:
        unavailable_listing_ids = (
            db.query(Booking.listing_id)
            .filter(
                Booking.status == "confirmed",
                Booking.check_in < check_out,
                Booking.check_out > check_in,
            )
            .distinct()
            .subquery()
        )
        query = query.filter(~Listing.id.in_(unavailable_listing_ids))

    # Sorting
    if sort_by == "price_asc":
        query = query.order_by(Listing.price_per_night.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Listing.price_per_night.desc())
    elif sort_by == "rating_desc":
        query = query.order_by(Listing.rating.desc())
    elif sort_by == "newest":
        query = query.order_by(Listing.created_at.desc())
    else:
        query = query.order_by(Listing.rating.desc())

    total = query.count()
    total_pages = math.ceil(total / limit) if total > 0 else 1
    items = (
        query.options(joinedload(Listing.images))
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return {
        "data": items,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
    }


def get_listing_detail(db: Session, listing_id: int):
    listing = (
        db.query(Listing)
        .options(
            joinedload(Listing.images),
            joinedload(Listing.amenities),
            joinedload(Listing.host),
        )
        .filter(Listing.id == listing_id, Listing.is_active == True)
        .first()
    )
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing


def create_listing(db: Session, data, host_id: int):
    listing = Listing(
        host_id=host_id,
        title=data.title,
        description=data.description,
        property_type=data.property_type,
        location=data.location,
        city=data.city,
        country=data.country,
        latitude=data.latitude,
        longitude=data.longitude,
        price_per_night=data.price_per_night,
        max_guests=data.max_guests,
        bedrooms=data.bedrooms,
        beds=data.beds,
        bathrooms=data.bathrooms,
    )
    db.add(listing)
    db.flush()

    for order, url in enumerate(data.image_urls):
        db.add(ListingImage(listing_id=listing.id, image_url=url, display_order=order))

    if data.amenity_ids:
        amenities = db.query(Amenity).filter(Amenity.id.in_(data.amenity_ids)).all()
        listing.amenities = amenities

    db.commit()
    db.refresh(listing)
    return get_listing_detail(db, listing.id)


def update_listing(db: Session, listing_id: int, data, user_id: int):
    listing = db.get(Listing, listing_id)
    if not listing or not listing.is_active:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.host_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this listing")

    update_data = data.model_dump(exclude_unset=True)

    # Handle amenities separately
    amenity_ids = update_data.pop("amenity_ids", None)
    image_urls = update_data.pop("image_urls", None)

    for key, value in update_data.items():
        setattr(listing, key, value)

    if amenity_ids is not None:
        amenities = db.query(Amenity).filter(Amenity.id.in_(amenity_ids)).all()
        listing.amenities = amenities

    if image_urls is not None:
        # Replace all images
        db.query(ListingImage).filter(ListingImage.listing_id == listing_id).delete()
        for order, url in enumerate(image_urls):
            db.add(ListingImage(listing_id=listing_id, image_url=url, display_order=order))

    db.commit()
    return get_listing_detail(db, listing_id)


def delete_listing(db: Session, listing_id: int, user_id: int):
    listing = db.get(Listing, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.host_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this listing")

    # Check for future confirmed bookings
    future_bookings = (
        db.query(Booking)
        .filter(
            Booking.listing_id == listing_id,
            Booking.status == "confirmed",
            Booking.check_out > func.current_date(),
        )
        .count()
    )
    if future_bookings > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete listing with {future_bookings} active future booking(s). Cancel them first.",
        )

    # Soft delete
    listing.is_active = False
    db.commit()


def get_availability(db: Session, listing_id: int):
    listing = db.get(Listing, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    bookings = (
        db.query(Booking.check_in, Booking.check_out)
        .filter(
            Booking.listing_id == listing_id,
            Booking.status == "confirmed",
        )
        .all()
    )
    return {"booked_ranges": [{"check_in": b.check_in, "check_out": b.check_out} for b in bookings]}
