from pydantic import BaseModel
from datetime import datetime
from app.schemas.listing import ListingCard


class WishlistItemOut(BaseModel):
    id: int
    listing_id: int
    created_at: datetime
    listing: ListingCard

    model_config = {"from_attributes": True}
