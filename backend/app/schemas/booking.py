from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime


class BookingCreate(BaseModel):
    listing_id: int
    check_in: date
    check_out: date
    guests: int = Field(..., ge=1)


class PriceBreakdown(BaseModel):
    nightly_price: float
    nights: int
    nightly_total: float
    cleaning_fee: float
    service_fee: float
    tax: float
    total: float


class BookingOut(BaseModel):
    id: int
    listing_id: int
    guest_id: int
    check_in: date
    check_out: date
    guests: int
    nightly_price: float
    nights: int
    cleaning_fee: float
    service_fee: float
    tax: float
    total_price: float
    status: str
    created_at: datetime
    listing_title: Optional[str] = None
    listing_city: Optional[str] = None
    listing_image: Optional[str] = None

    model_config = {"from_attributes": True}


class BookedRange(BaseModel):
    check_in: date
    check_out: date


class AvailabilityOut(BaseModel):
    booked_ranges: list[BookedRange]
