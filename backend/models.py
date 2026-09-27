from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Enum as SQLEnum, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from backend.database import Base

class BookingStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    CANCELLED = "CANCELLED"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default="user", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    bookings = relationship("Booking", back_populates="user", cascade="all, delete-orphan")


class Movie(Base):
    __tablename__ = "movies"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    description = Column(String, nullable=False)
    poster_url = Column(String, nullable=False)
    backdrop_url = Column(String, nullable=False)
    duration_mins = Column(Integer, nullable=False)
    genre = Column(String, nullable=False)
    rating = Column(String, default="PG-13")  # e.g., PG-13, R, PG, G
    release_date = Column(String, nullable=False)
    is_showing = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True, index=True)

    showtimes = relationship("Showtime", back_populates="movie", cascade="all, delete-orphan")


class Hall(Base):
    __tablename__ = "halls"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    total_rows = Column(Integer, nullable=False)
    seats_per_row = Column(Integer, nullable=False)

    seats = relationship("Seat", back_populates="hall", cascade="all, delete-orphan")
    showtimes = relationship("Showtime", back_populates="hall", cascade="all, delete-orphan")


class Seat(Base):
    __tablename__ = "seats"

    id = Column(Integer, primary_key=True, index=True)
    hall_id = Column(Integer, ForeignKey("halls.id", ondelete="CASCADE"), nullable=False, index=True)
    row_letter = Column(String(2), nullable=False)  # e.g., 'A', 'B', 'H'
    seat_number = Column(Integer, nullable=False)   # e.g., 1, 2, 12
    is_vip = Column(Boolean, default=False)
    price_multiplier = Column(Float, default=1.0)   # 1.5x for VIP back row sets

    hall = relationship("Hall", back_populates="seats")
    tickets = relationship("Ticket", back_populates="seat")

    __table_args__ = (
        UniqueConstraint("hall_id", "row_letter", "seat_number", name="uq_hall_row_seat"),
    )


class Showtime(Base):
    __tablename__ = "showtimes"

    id = Column(Integer, primary_key=True, index=True)
    movie_id = Column(Integer, ForeignKey("movies.id", ondelete="CASCADE"), nullable=False, index=True)
    hall_id = Column(Integer, ForeignKey("halls.id", ondelete="CASCADE"), nullable=False, index=True)
    start_time = Column(DateTime, nullable=False, index=True)
    end_time = Column(DateTime, nullable=False)
    base_price = Column(Float, nullable=False, default=12.0)

    movie = relationship("Movie", back_populates="showtimes")
    hall = relationship("Hall", back_populates="showtimes")
    bookings = relationship("Booking", back_populates="showtime", cascade="all, delete-orphan")
    tickets = relationship("Ticket", back_populates="showtime", cascade="all, delete-orphan")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    showtime_id = Column(Integer, ForeignKey("showtimes.id", ondelete="CASCADE"), nullable=False, index=True)
    total_amount = Column(Float, nullable=False)
    status = Column(SQLEnum(BookingStatus), default=BookingStatus.CONFIRMED, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="bookings")
    showtime = relationship("Showtime", back_populates="bookings")
    tickets = relationship("Ticket", back_populates="booking", cascade="all, delete-orphan")


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False, index=True)
    showtime_id = Column(Integer, ForeignKey("showtimes.id", ondelete="CASCADE"), nullable=False, index=True)
    seat_id = Column(Integer, ForeignKey("seats.id", ondelete="CASCADE"), nullable=False, index=True)
    price_paid = Column(Float, nullable=False)

    booking = relationship("Booking", back_populates="tickets")
    showtime = relationship("Showtime", back_populates="tickets")
    seat = relationship("Seat", back_populates="tickets")

    # CONCURRENCY GUARD: A strict database-level unique constraint prevents two transactions
    # from ever committing tickets for the exact same seat in the exact same showtime!
    __table_args__ = (
        UniqueConstraint("showtime_id", "seat_id", name="uq_showtime_seat_ticket_booking"),
    )
