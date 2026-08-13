from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ListingImageOut(BaseModel):
    id: int
    image_url: str
    caption: Optional[str] = None
    display_order: int
    model_config = {"from_attributes": True}


class AmenityOut(BaseModel):
    id: int
    name: str
    icon: Optional[str] = None
    model_config = {"from_attributes": True}


class ListingBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)
    property_type: str = Field(..., pattern="^(apartment|house|villa|hotel|cabin|guesthouse|experience|service)$")
    location: str = Field(..., min_length=1)
    city: str = Field(..., min_length=1)
    country: str = Field(default="India")
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    price_per_night: float = Field(..., gt=0)
    max_guests: int = Field(..., ge=1)
    bedrooms: int = Field(..., ge=0)
    beds: int = Field(..., ge=0)
    bathrooms: int = Field(..., ge=0)


class ListingCreate(ListingBase):
    amenity_ids: List[int] = []
    image_urls: List[str] = []


class ListingUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, min_length=1)
    property_type: Optional[str] = Field(None, pattern="^(apartment|house|villa|hotel|cabin|guesthouse|experience|service)$")
    location: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    price_per_night: Optional[float] = Field(None, gt=0)
    max_guests: Optional[int] = Field(None, ge=1)
    bedrooms: Optional[int] = Field(None, ge=0)
    beds: Optional[int] = Field(None, ge=0)
    bathrooms: Optional[int] = Field(None, ge=0)
    amenity_ids: Optional[List[int]] = None
    image_urls: Optional[List[str]] = None


class HostOut(BaseModel):
    id: int
    name: str
    avatar_url: Optional[str] = None
    model_config = {"from_attributes": True}


class ListingOut(BaseModel):
    id: int
    host_id: int
    title: str
    description: str
    property_type: str
    location: str
    city: str
    country: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    price_per_night: float
    max_guests: int
    bedrooms: int
    beds: int
    bathrooms: int
    rating: float
    review_count: int
    is_active: bool
    is_original: bool = False
    is_popular: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None
    images: List[ListingImageOut] = []
    amenities: List[AmenityOut] = []
    host: Optional[HostOut] = None

    model_config = {"from_attributes": True}


class ListingCard(BaseModel):
    """Lighter listing for grid/cards — no description, no host details."""
    id: int
    title: str
    property_type: str
    location: str
    city: str
    country: str
    price_per_night: float
    max_guests: int
    bedrooms: int
    beds: int
    bathrooms: int
    rating: float
    review_count: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_original: bool = False
    is_popular: bool = False
    images: List[ListingImageOut] = []

    model_config = {"from_attributes": True}


class PaginatedListings(BaseModel):
    data: List[ListingCard]
    total: int
    page: int
    limit: int
    total_pages: int
