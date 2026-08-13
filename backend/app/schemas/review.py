from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: str = Field(..., min_length=1)
    booking_id: Optional[int] = None


class ReviewOut(BaseModel):
    id: int
    listing_id: int
    user_id: int
    booking_id: Optional[int] = None
    rating: int
    comment: str
    created_at: datetime
    user_name: Optional[str] = None
    user_avatar: Optional[str] = None

    model_config = {"from_attributes": True}
