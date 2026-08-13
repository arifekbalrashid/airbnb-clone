# Airbnb Clone

A full-stack Airbnb clone application built with Next.js (React), Tailwind CSS, Python (FastAPI), and SQLite. This project implements core features of Airbnb including browsing listings, property details, user authentication flows, wishlists, and host management.

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: React Hooks & Context API

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLite with SQLAlchemy ORM
- **Authentication**: JWT Tokens
- **API Documentation**: Swagger UI (built-in with FastAPI)

## Features Included

- **Dynamic Homepage**: Browse stays, experiences, and services with real-time data fetching.
- **Advanced Layout**: Responsive UI closely mirroring the real Airbnb design, featuring grid layouts and modern aesthetics.
- **Detailed Listings**: View property details, prices, amenities, and host information.
- **Wishlist System**: Save and remove favorite properties.
- **Checkout & Bookings**: Calculate nightly rates, cleaning fees, taxes, and complete mock bookings.
- **Host Dashboard**: Manage listings, view incoming bookings, and track reservations.
- **Dynamic Seeding**: Realistic seed data for diverse property types, experiences, and professional services.

## Setup Instructions

### 1. Backend Setup (FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Seed the database with sample data:
   ```bash
   python seed.py
   python seed_extras.py
   ```
5. Run the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload
   ```
   The backend API will run on `http://localhost:8000`. API docs are available at `http://localhost:8000/docs`.

### 2. Frontend Setup (Next.js)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and visit `http://localhost:3000`.

## Architecture & Data Flow

- The backend provides RESTful API endpoints via FastAPI routers.
- The frontend uses `fetch` within Next.js Server Components and Client Components to consume data.
- The UI strictly adheres to Airbnb's design system using Tailwind CSS utilities (e.g., specific aspect ratios for listing cards, sticky booking components, and modal forms).
- Authentication uses a mock `AuthContext` to simulate user login states on the frontend, coordinating with backend user endpoints.
