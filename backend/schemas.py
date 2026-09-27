from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime
from backend.models import BookingStatus

# --- User & Auth Schemas ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str = "user"
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# --- Movie & Showtime Schemas ---
class MovieCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=150)
    description: str = Field(..., min_length=10)
    poster_url: str = Field(..., min_length=5)
    backdrop_url: str = Field(..., min_length=5)
    duration_mins: int = Field(..., gt=0, le=600)
    genre: str = Field(..., min_length=2)
    rating: str = "PG-13"
    release_date: str
    is_showing: bool = True

class MovieResponse(BaseModel):
    id: int
    title: str
    description: str
    poster_url: str
    backdrop_url: str
    duration_mins: int
    genre: str
    rating: str
    release_date: str
    is_showing: bool
    is_active: bool = True

    class Config:
        from_attributes = True


class HallResponse(BaseModel):
    id: int
    name: str
    total_rows: int
    seats_per_row: int

    class Config:
        from_attributes = True


class ShowtimeResponse(BaseModel):
    id: int
    movie_id: int
    hall_id: int
    start_time: datetime
    end_time: datetime
    base_price: float
    hall: Optional[HallResponse] = None

    class Config:
        from_attributes = True

class MovieDetailResponse(MovieResponse):
    showtimes: List[ShowtimeResponse] = []


# --- Seat & Availability Schemas ---
class SeatResponse(BaseModel):
    id: int
    row_letter: str
    seat_number: int
    is_vip: bool
    price_multiplier: float
    is_booked: bool = False
    price: float = 0.0

    class Config:
        from_attributes = True

class HallSeatsResponse(BaseModel):
    showtime_id: int
    movie_title: str
    hall_name: str
    base_price: float
    seats: List[SeatResponse]


# --- Booking & Ticket Schemas ---
class BookingCreateRequest(BaseModel):
    showtime_id: int
    seat_ids: List[int] = Field(..., min_length=1, description="List of Seat IDs to book simultaneously")

class TicketDetailResponse(BaseModel):
    id: int
    seat_id: int
    price_paid: float
    row_letter: str
    seat_number: int
    is_vip: bool

    class Config:
        from_attributes = True

class OrderHistoryItemResponse(BaseModel):
    id: int
    total_amount: float
    status: BookingStatus
    created_at: datetime
    movie_id: int
    movie_title: str
    movie_poster_url: str
    showtime_start: datetime
    hall_name: str
    tickets: List[TicketDetailResponse]
    seat_labels: List[str]  # Convenient summary e.g. ["B4", "B5"]

    class Config:
        from_attributes = True
