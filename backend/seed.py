"""Seed the database with realistic sample data."""

import sys
import os
from datetime import date, datetime, timedelta

sys.path.insert(0, os.path.dirname(__file__))

from app.database import Base, engine, SessionLocal
from app.models.user import User
from app.models.listing import Listing, ListingImage
from app.models.amenity import Amenity, listing_amenities
from app.models.booking import Booking
from app.models.review import Review
from app.models.wishlist import WishlistItem

USERS = [
    {"id": 1, "name": "Priya Sharma", "email": "priya@example.com", "role": "guest", "avatar_url": "https://api.dicebear.com/9.x/avataaars/svg?seed=Priya"},
    {"id": 2, "name": "Rahul Patel", "email": "rahul@example.com", "role": "guest", "avatar_url": "https://api.dicebear.com/9.x/avataaars/svg?seed=Rahul"},
    {"id": 3, "name": "Ananya Desai", "email": "ananya@example.com", "role": "guest", "avatar_url": "https://api.dicebear.com/9.x/avataaars/svg?seed=Ananya"},
    {"id": 4, "name": "Vikram Mehta", "email": "vikram@example.com", "role": "host", "avatar_url": "https://api.dicebear.com/9.x/avataaars/svg?seed=Vikram"},
    {"id": 5, "name": "Sneha Reddy", "email": "sneha@example.com", "role": "host", "avatar_url": "https://api.dicebear.com/9.x/avataaars/svg?seed=Sneha"},
    {"id": 6, "name": "Arjun Nair", "email": "arjun@example.com", "role": "host", "avatar_url": "https://api.dicebear.com/9.x/avataaars/svg?seed=Arjun"},
]

AMENITIES = [
    {"id": 1, "name": "Wi-Fi", "icon": "wifi"},
    {"id": 2, "name": "Pool", "icon": "pool"},
    {"id": 3, "name": "Kitchen", "icon": "kitchen"},
    {"id": 4, "name": "Air Conditioning", "icon": "ac"},
    {"id": 5, "name": "Parking", "icon": "parking"},
    {"id": 6, "name": "Washer", "icon": "washer"},
    {"id": 7, "name": "TV", "icon": "tv"},
    {"id": 8, "name": "Workspace", "icon": "workspace"},
    {"id": 9, "name": "Hot Tub", "icon": "hot_tub"},
    {"id": 10, "name": "Gym", "icon": "gym"},
    {"id": 11, "name": "Beach Access", "icon": "beach"},
    {"id": 12, "name": "Mountain View", "icon": "mountain"},
]

# Unsplash source URLs for property images (reliable, no auth needed)
IMG = {
    "beach": [
        {"url": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&h=800&fit=crop", "caption": "Exterior"},
        {"url": "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&h=800&fit=crop", "caption": "Living room"},
        {"url": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&h=800&fit=crop", "caption": "Bedroom"},
        {"url": "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200&h=800&fit=crop", "caption": "Washroom"},
        {"url": "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=1200&h=800&fit=crop", "caption": "Kitchenette"},
        {"url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop", "caption": "Beach Access"},
    ],
    "mountain": [
        {"url": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1200&h=800&fit=crop", "caption": "Exterior"},
        {"url": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=800&fit=crop", "caption": "Living room"},
        {"url": "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&h=800&fit=crop", "caption": "Bedroom 1"},
        {"url": "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=1200&h=800&fit=crop", "caption": "Kitchenette"},
        {"url": "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1200&h=800&fit=crop", "caption": "Washroom"},
        {"url": "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=1200&h=800&fit=crop", "caption": "Mountain View"},
    ],
    "city": [
        {"url": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop", "caption": "Living room"},
        {"url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=800&fit=crop", "caption": "Bedroom"},
        {"url": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=800&fit=crop", "caption": "Kitchenette"},
        {"url": "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&h=800&fit=crop", "caption": "Washroom"},
        {"url": "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=800&fit=crop", "caption": "Workspace"},
        {"url": "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&h=800&fit=crop", "caption": "Balcony"},
    ],
    "villa": [
        {"url": "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&h=800&fit=crop", "caption": "Exterior"},
        {"url": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop", "caption": "Living room"},
        {"url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop", "caption": "Dining area"},
        {"url": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&h=800&fit=crop", "caption": "Kitchenette"},
        {"url": "https://images.unsplash.com/photo-1531835551805-16d8e4f5098e?w=1200&h=800&fit=crop", "caption": "Bedroom 1"},
        {"url": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200&h=800&fit=crop", "caption": "Washroom"},
    ],
    "cabin": [
        {"url": "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=1200&h=800&fit=crop", "caption": "Exterior"},
        {"url": "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200&h=800&fit=crop", "caption": "Living room"},
        {"url": "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=1200&h=800&fit=crop", "caption": "Bedroom"},
        {"url": "https://images.unsplash.com/photo-1518732714860-b62714ce0c59?w=1200&h=800&fit=crop", "caption": "Kitchenette"},
        {"url": "https://images.unsplash.com/photo-1600607686527-6fb886090705?w=1200&h=800&fit=crop", "caption": "Washroom"},
        {"url": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&h=800&fit=crop", "caption": "Fireplace"},
    ],
    "hotel": [
        {"url": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop", "caption": "Exterior"},
        {"url": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&h=800&fit=crop", "caption": "Lobby"},
        {"url": "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&h=800&fit=crop", "caption": "Bedroom"},
        {"url": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200&h=800&fit=crop", "caption": "Washroom"},
        {"url": "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&h=800&fit=crop", "caption": "Dining area"},
        {"url": "https://images.unsplash.com/photo-1535827841776-24afc1e255ac?w=1200&h=800&fit=crop", "caption": "Pool"},
    ],
}

LISTINGS = [
    {
        "id": 1, "host_id": 4, "title": "Beachfront Paradise in Goa",
        "description": "Wake up to the sound of waves in this stunning beachfront apartment. Features a private balcony with ocean views, modern amenities, and direct beach access. Perfect for couples or small families looking for a relaxing getaway.",
        "property_type": "apartment", "location": "Calangute Beach Road", "city": "Goa", "country": "India",
        "latitude": 15.5449, "longitude": 73.7557, "price_per_night": 8500, "max_guests": 4,
        "bedrooms": 2, "beds": 2, "bathrooms": 2, "rating": 4.92, "review_count": 47,
        "images": IMG["beach"], "amenity_ids": [1, 2, 3, 4, 7, 11],
    },
    {
        "id": 2, "host_id": 4, "title": "Luxury Villa with Infinity Pool",
        "description": "Experience luxury at its finest in this magnificent villa featuring an infinity pool overlooking the Arabian Sea. Spacious rooms, a fully equipped kitchen, and a private garden make this the perfect escape.",
        "property_type": "villa", "location": "Vagator Hill", "city": "Goa", "country": "India",
        "latitude": 15.5979, "longitude": 73.7445, "price_per_night": 22000, "max_guests": 8,
        "bedrooms": 4, "beds": 5, "bathrooms": 4, "rating": 4.97, "review_count": 31,
        "images": IMG["villa"], "amenity_ids": [1, 2, 3, 4, 5, 6, 7, 8],
    },
    {
        "id": 3, "host_id": 5, "title": "Cozy Mountain Cabin in Manali",
        "description": "Escape to the mountains in this charming wooden cabin surrounded by pine forests. Features a fireplace, mountain views from every window, and easy access to hiking trails. A perfect winter retreat.",
        "property_type": "cabin", "location": "Old Manali Road", "city": "Manali", "country": "India",
        "latitude": 32.2432, "longitude": 77.1892, "price_per_night": 4500, "max_guests": 4,
        "bedrooms": 2, "beds": 2, "bathrooms": 1, "rating": 4.85, "review_count": 63,
        "images": IMG["cabin"], "amenity_ids": [1, 3, 7, 12],
    },
    {
        "id": 4, "host_id": 5, "title": "Modern Apartment in Bandra",
        "description": "Stylish apartment in the heart of Bandra with stunning city views. Walking distance to restaurants, shopping, and nightlife. Perfect for business travelers or couples exploring Mumbai.",
        "property_type": "apartment", "location": "Bandra West", "city": "Mumbai", "country": "India",
        "latitude": 19.0596, "longitude": 72.8295, "price_per_night": 7000, "max_guests": 3,
        "bedrooms": 1, "beds": 1, "bathrooms": 1, "rating": 4.78, "review_count": 89,
        "images": IMG["city"], "amenity_ids": [1, 3, 4, 5, 7, 8],
    },
    {
        "id": 5, "host_id": 6, "title": "Heritage Haveli in Jaipur",
        "description": "Stay in a beautifully restored 200-year-old haveli in the Pink City. Traditional Rajasthani architecture meets modern comfort. Rooftop dining area with views of Nahargarh Fort.",
        "property_type": "guesthouse", "location": "Amer Road", "city": "Jaipur", "country": "India",
        "latitude": 26.9534, "longitude": 75.8508, "price_per_night": 5500, "max_guests": 6,
        "bedrooms": 3, "beds": 3, "bathrooms": 2, "rating": 4.90, "review_count": 52,
        "images": IMG["hotel"], "amenity_ids": [1, 3, 4, 5, 7],
    },
    {
        "id": 6, "host_id": 4, "title": "Boutique Hotel Room in Delhi",
        "description": "Elegant room in a boutique hotel in the heart of New Delhi. Steps away from Connaught Place, metro stations, and major attractions. Includes breakfast and concierge service.",
        "property_type": "hotel", "location": "Connaught Place", "city": "Delhi", "country": "India",
        "latitude": 28.6315, "longitude": 77.2167, "price_per_night": 6000, "max_guests": 2,
        "bedrooms": 1, "beds": 1, "bathrooms": 1, "rating": 4.65, "review_count": 124,
        "images": IMG["hotel"], "amenity_ids": [1, 4, 7, 8, 10],
    },
    {
        "id": 7, "host_id": 5, "title": "Lakeside Retreat in Udaipur",
        "description": "Romantic lakeside property with breathtaking views of Lake Pichola. Traditional architecture with modern amenities. Perfect for honeymoons or peaceful getaways in the City of Lakes.",
        "property_type": "house", "location": "Lake Pichola", "city": "Udaipur", "country": "India",
        "latitude": 24.5764, "longitude": 73.6830, "price_per_night": 9500, "max_guests": 4,
        "bedrooms": 2, "beds": 2, "bathrooms": 2, "rating": 4.95, "review_count": 38,
        "images": IMG["villa"], "amenity_ids": [1, 3, 4, 5, 6, 7],
    },
    {
        "id": 8, "host_id": 6, "title": "Riverside Cottage in Rishikesh",
        "description": "Peaceful cottage on the banks of the Ganges. Wake up to the sound of flowing water and birdsong. Yoga deck included. Near adventure sports and spiritual centers.",
        "property_type": "cabin", "location": "Tapovan", "city": "Rishikesh", "country": "India",
        "latitude": 30.1248, "longitude": 78.3158, "price_per_night": 3500, "max_guests": 3,
        "bedrooms": 1, "beds": 2, "bathrooms": 1, "rating": 4.82, "review_count": 71,
        "images": IMG["cabin"], "amenity_ids": [1, 3, 12],
    },
    {
        "id": 9, "host_id": 4, "title": "Skyline Penthouse in Bangalore",
        "description": "Luxurious penthouse with panoramic city views in Bangalore's tech corridor. Rooftop terrace, modern kitchen, and premium furnishings. Ideal for long-term stays and business travelers.",
        "property_type": "apartment", "location": "Koramangala", "city": "Bangalore", "country": "India",
        "latitude": 12.9352, "longitude": 77.6245, "price_per_night": 12000, "max_guests": 4,
        "bedrooms": 3, "beds": 3, "bathrooms": 2, "rating": 4.88, "review_count": 45,
        "images": IMG["city"], "amenity_ids": [1, 3, 4, 5, 7, 8, 10],
    },
    {
        "id": 10, "host_id": 5, "title": "Charming Studio near Koregaon Park",
        "description": "Bright and airy studio apartment in Pune's most vibrant neighborhood. Surrounded by cafes, galleries, and nightlife. Modern decor with a personal touch.",
        "property_type": "apartment", "location": "Koregaon Park", "city": "Pune", "country": "India",
        "latitude": 18.5362, "longitude": 73.8939, "price_per_night": 3200, "max_guests": 2,
        "bedrooms": 1, "beds": 1, "bathrooms": 1, "rating": 4.70, "review_count": 95,
        "images": IMG["city"], "amenity_ids": [1, 3, 4, 7, 8],
    },
    {
        "id": 11, "host_id": 6, "title": "Hilltop Villa in Lonavala",
        "description": "Spectacular hilltop villa with valley views and private pool. Spread across two acres of landscaped gardens. Perfect for large groups and celebrations.",
        "property_type": "villa", "location": "Tiger Point Road", "city": "Pune", "country": "India",
        "latitude": 18.7481, "longitude": 73.4072, "price_per_night": 25000, "max_guests": 12,
        "bedrooms": 5, "beds": 7, "bathrooms": 4, "rating": 4.93, "review_count": 22,
        "images": IMG["villa"], "amenity_ids": [1, 2, 3, 4, 5, 6, 7, 9, 12],
    },
    {
        "id": 12, "host_id": 4, "title": "Techie Pad in Hyderabad",
        "description": "Smart home apartment in HITEC City with all the latest gadgets. Fast fiber internet, ergonomic workspace, and a fully stocked kitchen. Built for remote workers.",
        "property_type": "apartment", "location": "HITEC City", "city": "Hyderabad", "country": "India",
        "latitude": 17.4435, "longitude": 78.3772, "price_per_night": 4000, "max_guests": 2,
        "bedrooms": 1, "beds": 1, "bathrooms": 1, "rating": 4.75, "review_count": 58,
        "images": IMG["city"], "amenity_ids": [1, 3, 4, 5, 7, 8],
    },
    {
        "id": 13, "host_id": 5, "title": "Royal Suite in Udaipur Palace",
        "description": "Live like royalty in this palatial suite within a converted heritage property. Marble floors, antique furnishings, and impeccable service. A once-in-a-lifetime experience.",
        "property_type": "hotel", "location": "City Palace Road", "city": "Udaipur", "country": "India",
        "latitude": 24.5760, "longitude": 73.6820, "price_per_night": 18000, "max_guests": 2,
        "bedrooms": 1, "beds": 1, "bathrooms": 1, "rating": 4.98, "review_count": 15,
        "images": IMG["hotel"], "amenity_ids": [1, 2, 3, 4, 6, 7, 10],
    },
    {
        "id": 14, "host_id": 6, "title": "Backpacker's Den in Manali",
        "description": "Budget-friendly guesthouse room with mountain views. Shared kitchen, common lounge with fireplace, and a community of fellow travelers. Great base for treks and adventures.",
        "property_type": "guesthouse", "location": "Vashisht Village", "city": "Manali", "country": "India",
        "latitude": 32.2607, "longitude": 77.1772, "price_per_night": 1500, "max_guests": 2,
        "bedrooms": 1, "beds": 2, "bathrooms": 1, "rating": 4.55, "review_count": 142,
        "images": IMG["mountain"], "amenity_ids": [1, 3, 12],
    },
    {
        "id": 15, "host_id": 4, "title": "Seaside Bungalow in Goa",
        "description": "Charming Portuguese-style bungalow steps from Palolem Beach. Hammock garden, outdoor shower, and rustic charm. The perfect Goan beach house experience.",
        "property_type": "house", "location": "Palolem Beach", "city": "Goa", "country": "India",
        "latitude": 15.0100, "longitude": 74.0232, "price_per_night": 6500, "max_guests": 5,
        "bedrooms": 2, "beds": 3, "bathrooms": 1, "rating": 4.86, "review_count": 67,
        "images": IMG["beach"], "amenity_ids": [1, 3, 4, 7, 11],
    },
    {
        "id": 16, "host_id": 5, "title": "Treehouse Stay in Jaipur",
        "description": "Unique treehouse accommodation surrounded by nature. Elevated wooden cabins with rustic charm and modern comfort. An unforgettable experience for nature lovers.",
        "property_type": "cabin", "location": "Nahargarh Road", "city": "Jaipur", "country": "India",
        "latitude": 26.9400, "longitude": 75.8150, "price_per_night": 7500, "max_guests": 2,
        "bedrooms": 1, "beds": 1, "bathrooms": 1, "rating": 4.91, "review_count": 34,
        "images": IMG["cabin"], "amenity_ids": [1, 12],
    },
    {
        "id": 17, "host_id": 6, "title": "Designer Loft in Delhi",
        "description": "Industrial-chic loft in a converted warehouse in Hauz Khas Village. Exposed brick, high ceilings, and curated art collection. Walking distance to Delhi's best restaurants and galleries.",
        "property_type": "apartment", "location": "Hauz Khas Village", "city": "Delhi", "country": "India",
        "latitude": 28.5494, "longitude": 77.2001, "price_per_night": 8000, "max_guests": 3,
        "bedrooms": 1, "beds": 1, "bathrooms": 1, "rating": 4.80, "review_count": 76,
        "images": IMG["city"], "amenity_ids": [1, 3, 4, 7, 8],
    },
    {
        "id": 18, "host_id": 4, "title": "Yoga Retreat in Rishikesh",
        "description": "Serene ashram-style accommodation with daily yoga sessions included. Vegetarian meals, meditation garden, and proximity to sacred ghats. Ideal for spiritual seekers.",
        "property_type": "guesthouse", "location": "Laxman Jhula", "city": "Rishikesh", "country": "India",
        "latitude": 30.1158, "longitude": 78.3228, "price_per_night": 2500, "max_guests": 2,
        "bedrooms": 1, "beds": 1, "bathrooms": 1, "rating": 4.72, "review_count": 103,
        "images": IMG["mountain"], "amenity_ids": [1, 3, 12],
    },
    {
        "id": 19, "host_id": 5, "title": "Garden Villa in Bangalore",
        "description": "Spacious villa with a lush tropical garden in Indiranagar. Perfect for families with children. Quiet neighborhood with easy access to restaurants and parks.",
        "property_type": "villa", "location": "Indiranagar", "city": "Bangalore", "country": "India",
        "latitude": 12.9784, "longitude": 77.6408, "price_per_night": 15000, "max_guests": 8,
        "bedrooms": 4, "beds": 4, "bathrooms": 3, "rating": 4.87, "review_count": 29,
        "images": IMG["villa"], "amenity_ids": [1, 2, 3, 4, 5, 6, 7, 8],
    },
    {
        "id": 20, "host_id": 6, "title": "Heritage Room in Hyderabad",
        "description": "Elegant room in a restored Nizam-era mansion near Charminar. Blend of Mughal and European architecture with modern amenities. Experience the rich history of Hyderabad.",
        "property_type": "hotel", "location": "Old City", "city": "Hyderabad", "country": "India",
        "latitude": 17.3616, "longitude": 78.4747, "price_per_night": 5000, "max_guests": 2,
        "bedrooms": 1, "beds": 1, "bathrooms": 1, "rating": 4.68, "review_count": 41,
        "images": IMG["hotel"], "amenity_ids": [1, 4, 7],
    },
]

today = date.today()

BOOKINGS = [
    # Future confirmed bookings (to demonstrate unavailable dates)
    {"id": 1, "listing_id": 1, "guest_id": 1, "check_in": today + timedelta(days=5), "check_out": today + timedelta(days=10), "guests": 2, "status": "confirmed"},
    {"id": 2, "listing_id": 1, "guest_id": 2, "check_in": today + timedelta(days=15), "check_out": today + timedelta(days=18), "guests": 3, "status": "confirmed"},
    {"id": 3, "listing_id": 2, "guest_id": 3, "check_in": today + timedelta(days=3), "check_out": today + timedelta(days=7), "guests": 4, "status": "confirmed"},
    {"id": 4, "listing_id": 3, "guest_id": 1, "check_in": today + timedelta(days=10), "check_out": today + timedelta(days=14), "guests": 2, "status": "confirmed"},
    {"id": 5, "listing_id": 5, "guest_id": 2, "check_in": today + timedelta(days=7), "check_out": today + timedelta(days=12), "guests": 4, "status": "confirmed"},
    # Past completed bookings (for reviews)
    {"id": 6, "listing_id": 1, "guest_id": 3, "check_in": today - timedelta(days=30), "check_out": today - timedelta(days=25), "guests": 2, "status": "completed"},
    {"id": 7, "listing_id": 4, "guest_id": 1, "check_in": today - timedelta(days=20), "check_out": today - timedelta(days=17), "guests": 2, "status": "completed"},
    {"id": 8, "listing_id": 7, "guest_id": 2, "check_in": today - timedelta(days=15), "check_out": today - timedelta(days=10), "guests": 2, "status": "completed"},
    # One cancelled booking
    {"id": 9, "listing_id": 9, "guest_id": 3, "check_in": today + timedelta(days=20), "check_out": today + timedelta(days=25), "guests": 2, "status": "cancelled"},
]

REVIEWS = [
    {"id": 1, "listing_id": 1, "user_id": 3, "booking_id": 6, "rating": 5, "comment": "Absolutely stunning beachfront property! The sound of waves was so relaxing. Host was very responsive and helpful."},
    {"id": 2, "listing_id": 1, "user_id": 1, "booking_id": None, "rating": 5, "comment": "Best Goa trip ever! The apartment was exactly as pictured. Beach access was amazing."},
    {"id": 3, "listing_id": 1, "user_id": 2, "booking_id": None, "rating": 4, "comment": "Great location and clean apartment. The kitchen could use a few more utensils but overall wonderful stay."},
    {"id": 4, "listing_id": 4, "user_id": 1, "booking_id": 7, "rating": 5, "comment": "Perfect location in Bandra! The apartment was modern and had everything we needed. Would definitely come back."},
    {"id": 5, "listing_id": 4, "user_id": 3, "booking_id": None, "rating": 4, "comment": "Nice apartment with great views. Bandra is a fantastic neighborhood. Only wish the parking was easier."},
    {"id": 6, "listing_id": 7, "user_id": 2, "booking_id": 8, "rating": 5, "comment": "Magical lakeside retreat! The views of Lake Pichola at sunset were unforgettable. Highly recommend."},
    {"id": 7, "listing_id": 3, "user_id": 2, "booking_id": None, "rating": 5, "comment": "Cozy cabin with incredible mountain views. The fireplace was perfect for cold evenings."},
    {"id": 8, "listing_id": 5, "user_id": 1, "booking_id": None, "rating": 5, "comment": "Staying in a real haveli was a dream come true. The architecture is breathtaking."},
    {"id": 9, "listing_id": 9, "user_id": 3, "booking_id": None, "rating": 4, "comment": "Great penthouse for work trips. Fast internet and comfortable workspace."},
    {"id": 10, "listing_id": 2, "user_id": 1, "booking_id": None, "rating": 5, "comment": "The infinity pool alone is worth the price. Absolutely luxurious villa."},
]


def seed():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Users
        for u in USERS:
            db.add(User(**u))
        db.flush()

        # Amenities
        for a in AMENITIES:
            db.add(Amenity(**a))
        db.flush()

        # Listings + images + amenity associations
        img_usage_count = {}
        for data in LISTINGS:
            images_data = data.pop("images")
            
            # Rotate images to avoid duplicate thumbnails
            list_id = id(images_data)
            count = img_usage_count.get(list_id, 0)
            img_usage_count[list_id] = count + 1
            if count > 0:
                images_data = images_data[count % len(images_data):] + images_data[:count % len(images_data)]

            amenity_ids = data.pop("amenity_ids")
            listing = Listing(**data)
            db.add(listing)
            db.flush()

            for order, img_data in enumerate(images_data):
                db.add(ListingImage(
                    listing_id=listing.id, 
                    image_url=img_data["url"], 
                    caption=img_data["caption"],
                    display_order=order
                ))

            for aid in amenity_ids:
                db.execute(listing_amenities.insert().values(listing_id=listing.id, amenity_id=aid))

        db.flush()

        # Bookings (calculate prices using the pricing util)
        from app.utils.pricing import calculate_price
        for b in BOOKINGS:
            listing = db.get(Listing, b["listing_id"])
            nights = (b["check_out"] - b["check_in"]).days
            price = calculate_price(listing.price_per_night, nights)
            db.add(Booking(
                id=b["id"],
                listing_id=b["listing_id"],
                guest_id=b["guest_id"],
                check_in=b["check_in"],
                check_out=b["check_out"],
                guests=b["guests"],
                nightly_price=price["nightly_price"],
                nights=price["nights"],
                cleaning_fee=price["cleaning_fee"],
                service_fee=price["service_fee"],
                tax=price["tax"],
                total_price=price["total"],
                status=b["status"],
            ))
        db.flush()

        # Reviews
        for r in REVIEWS:
            db.add(Review(**r))

        db.commit()
        print(f"Seeded: {len(USERS)} users, {len(AMENITIES)} amenities, {len(LISTINGS)} listings, {len(BOOKINGS)} bookings, {len(REVIEWS)} reviews")

    except Exception as e:
        db.rollback()
        print(f"Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
