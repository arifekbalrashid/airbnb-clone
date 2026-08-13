from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import listings, bookings, reviews, wishlist, host, users, messages


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Airbnb Clone API",
    version="1.0.0",
    lifespan=lifespan,
)

origins = [url.strip().rstrip('/') for url in settings.frontend_url.split(",")]
if not origins:
    origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(listings.router, prefix="/api/listings", tags=["listings"])
app.include_router(bookings.router, prefix="/api/bookings", tags=["bookings"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["reviews"])
app.include_router(wishlist.router, prefix="/api/wishlist", tags=["wishlist"])
app.include_router(host.router, prefix="/api/host", tags=["host"])
app.include_router(messages.router, prefix="/api/messages", tags=["messages"])


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
