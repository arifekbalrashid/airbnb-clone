from datetime import date

from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import Booking, Listing
from app.utils.pricing import calculate_price


def create_booking(db: Session, listing_id: int, check_in: date, check_out: date, guests: int, guest_id: int):
    # 1. Validate listing exists and is active
    listing = db.get(Listing, listing_id)
    if not listing or not listing.is_active:
        raise HTTPException(status_code=404, detail="Listing not found")

    # 2. Validate dates
    if check_in >= check_out:
        raise HTTPException(status_code=400, detail="Check-in must be before check-out")

    if check_in < date.today():
        raise HTTPException(status_code=400, detail="Check-in date cannot be in the past")

    # 3. Validate guest count
    if guests > listing.max_guests:
        raise HTTPException(
            status_code=400,
            detail=f"Maximum {listing.max_guests} guests allowed for this listing",
        )

    # 4. Check for overlapping confirmed bookings (within transaction)
    conflicting = (
        db.query(Booking)
        .filter(
            Booking.listing_id == listing_id,
            Booking.status == "confirmed",
            Booking.check_in < check_out,
            Booking.check_out > check_in,
        )
        .first()
    )
    if conflicting:
        raise HTTPException(status_code=409, detail="Selected dates are no longer available")

    # 5. Calculate price on backend
    nights = (check_out - check_in).days
    price = calculate_price(listing.price_per_night, nights)

    # 6. Create booking
    booking = Booking(
        listing_id=listing_id,
        guest_id=guest_id,
        check_in=check_in,
        check_out=check_out,
        guests=guests,
        nightly_price=price["nightly_price"],
        nights=price["nights"],
        cleaning_fee=price["cleaning_fee"],
        service_fee=price["service_fee"],
        tax=price["tax"],
        total_price=price["total"],
        status="confirmed",
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    return booking


def get_booking(db: Session, booking_id: int, user_id: int):
    booking = db.get(Booking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.guest_id != user_id:
        # Also allow the host to view
        listing = db.get(Listing, booking.listing_id)
        if not listing or listing.host_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to view this booking")
    return booking


def get_my_bookings(db: Session, guest_id: int):
    return (
        db.query(Booking)
        .filter(Booking.guest_id == guest_id)
        .order_by(Booking.created_at.desc())
        .all()
    )


def cancel_booking(db: Session, booking_id: int, user_id: int):
    booking = db.get(Booking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.guest_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this booking")
    if booking.status != "confirmed":
        raise HTTPException(status_code=400, detail=f"Cannot cancel a {booking.status} booking")

    booking.status = "cancelled"
    db.commit()
    db.refresh(booking)
    return booking
