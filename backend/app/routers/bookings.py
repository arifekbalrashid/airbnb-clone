from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models import Listing
from app.schemas.booking import BookingCreate
from app.services import booking_service

router = APIRouter()


@router.post("", status_code=201)
def create_booking(
    data: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = booking_service.create_booking(
        db, data.listing_id, data.check_in, data.check_out,
        data.guests, current_user.id,
    )
    listing = db.get(Listing, booking.listing_id)
    return {
        "data": _booking_response(booking, listing),
        "message": "Booking confirmed",
    }


@router.get("/my")
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    bookings = booking_service.get_my_bookings(db, current_user.id)
    result = []
    for b in bookings:
        listing = db.get(Listing, b.listing_id)
        result.append(_booking_response(b, listing))
    return {"data": result}


@router.get("/{booking_id}")
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = booking_service.get_booking(db, booking_id, current_user.id)
    listing = db.get(Listing, booking.listing_id)
    return {"data": _booking_response(booking, listing)}


@router.post("/{booking_id}/cancel")
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = booking_service.cancel_booking(db, booking_id, current_user.id)
    listing = db.get(Listing, booking.listing_id)
    return {"data": _booking_response(booking, listing), "message": "Booking cancelled"}


def _booking_response(booking, listing):
    first_image = None
    if listing and listing.images:
        first_image = listing.images[0].image_url
    return {
        "id": booking.id,
        "listing_id": booking.listing_id,
        "guest_id": booking.guest_id,
        "check_in": str(booking.check_in),
        "check_out": str(booking.check_out),
        "guests": booking.guests,
        "nightly_price": booking.nightly_price,
        "nights": booking.nights,
        "cleaning_fee": booking.cleaning_fee,
        "service_fee": booking.service_fee,
        "tax": booking.tax,
        "total_price": booking.total_price,
        "status": booking.status,
        "created_at": str(booking.created_at),
        "listing_title": listing.title if listing else None,
        "listing_city": listing.city if listing else None,
        "listing_image": first_image,
    }
