from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.models import Listing, Booking


def get_host_stats(db: Session, host_id: int):
    listing_ids = (
        db.query(Listing.id)
        .filter(Listing.host_id == host_id, Listing.is_active == True)
        .all()
    )
    ids = [r[0] for r in listing_ids]

    total_listings = len(ids)

    if not ids:
        return {
            "total_listings": 0,
            "total_bookings": 0,
            "upcoming_stays": 0,
            "total_revenue": 0,
        }

    total_bookings = (
        db.query(func.count(Booking.id))
        .filter(Booking.listing_id.in_(ids))
        .scalar()
    )

    upcoming_stays = (
        db.query(func.count(Booking.id))
        .filter(
            Booking.listing_id.in_(ids),
            Booking.status == "confirmed",
            Booking.check_in >= func.current_date(),
        )
        .scalar()
    )

    total_revenue = (
        db.query(func.coalesce(func.sum(Booking.total_price), 0))
        .filter(
            Booking.listing_id.in_(ids),
            Booking.status.in_(["confirmed", "completed"]),
        )
        .scalar()
    )

    return {
        "total_listings": total_listings,
        "total_bookings": total_bookings,
        "upcoming_stays": upcoming_stays,
        "total_revenue": round(float(total_revenue), 2),
    }


def get_host_listings(db: Session, host_id: int):
    return (
        db.query(Listing)
        .filter(Listing.host_id == host_id, Listing.is_active == True)
        .options(joinedload(Listing.images))
        .order_by(Listing.created_at.desc())
        .all()
    )


def get_host_bookings(db: Session, host_id: int):
    listing_ids = (
        db.query(Listing.id)
        .filter(Listing.host_id == host_id)
        .all()
    )
    ids = [r[0] for r in listing_ids]

    if not ids:
        return []

    return (
        db.query(Booking)
        .filter(Booking.listing_id.in_(ids))
        .order_by(Booking.created_at.desc())
        .all()
    )
