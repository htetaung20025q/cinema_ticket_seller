import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from backend.main import app
from backend.database import Base, get_db
from backend.models import User, Movie, Hall, Seat, Showtime

# Use an ephemeral SQLite memory database with StaticPool for deterministic unit & concurrency tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_database():
    app.dependency_overrides[get_db] = override_get_db
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    # Create test hall, movie, seats, showtime
    movie = Movie(
        title="Test Movie", description="Test Description", poster_url="http://poster",
        backdrop_url="http://backdrop", duration_mins=120, genre="Action", release_date="2026-01-01", is_showing=True, is_active=True
    )
    hall = Hall(name="Test Hall", total_rows=2, seats_per_row=2)
    db.add(movie)
    db.add(hall)
    db.flush()

    seat_1 = Seat(hall_id=hall.id, row_letter="A", seat_number=1, is_vip=False, price_multiplier=1.0)
    seat_2 = Seat(hall_id=hall.id, row_letter="A", seat_number=2, is_vip=True, price_multiplier=1.5)
    db.add(seat_1)
    db.add(seat_2)
    db.flush()

    from datetime import datetime, timedelta
    showtime = Showtime(
        movie_id=movie.id, hall_id=hall.id, start_time=datetime.utcnow() + timedelta(hours=2),
        end_time=datetime.utcnow() + timedelta(hours=4), base_price=10.0
    )
    db.add(showtime)
    db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()

def test_auth_and_movies_listing():
    # 1. Register User
    reg_response = client.post("/api/auth/register", json={
        "email": "test@cinemadev.com",
        "password": "secretpassword",
        "full_name": "John Cinema"
    })
    assert reg_response.status_code == 201, reg_response.text
    token = reg_response.json()["access_token"]
    
    # 2. Get now showing movies
    movies_res = client.get("/api/movies/now-showing")
    assert movies_res.status_code == 200
    assert len(movies_res.json()) == 1
    assert movies_res.json()[0]["title"] == "Test Movie"

def test_seat_booking_and_double_booking_prevention():
    # 1. Create two separate accounts trying to compete for the same seats
    user1_res = client.post("/api/auth/register", json={"email": "user1@cinemadev.com", "password": "passuser123", "full_name": "User One"})
    token1 = user1_res.json()["access_token"]

    user2_res = client.post("/api/auth/register", json={"email": "user2@cinemadev.com", "password": "passuser456", "full_name": "User Two"})
    token2 = user2_res.json()["access_token"]

    # 2. Inspect showtimes and seats
    movie_detail = client.get("/api/movies/1").json()
    showtime_id = movie_detail["showtimes"][0]["id"]
    
    seats_res = client.get(f"/api/showtimes/{showtime_id}/seats").json()
    target_seat_id = seats_res["seats"][0]["id"]
    assert seats_res["seats"][0]["is_booked"] is False

    # 3. User 1 successfully books Target Seat
    booking1 = client.post(
        "/api/bookings",
        json={"showtime_id": showtime_id, "seat_ids": [target_seat_id]},
        headers={"Authorization": f"Bearer {token1}"}
    )
    assert booking1.status_code == 201, booking1.text
    assert "Booking successful" in booking1.json()["message"]

    # 4. Verify Seat is now marked as booked
    updated_seats = client.get(f"/api/showtimes/{showtime_id}/seats").json()
    assert updated_seats["seats"][0]["is_booked"] is True

    # 5. CONCURRENCY TEST: User 2 attempts to double-book the exact same Target Seat
    booking2 = client.post(
        "/api/bookings",
        json={"showtime_id": showtime_id, "seat_ids": [target_seat_id]},
        headers={"Authorization": f"Bearer {token2}"}
    )
    # MUST reject with 409 Conflict!
    assert booking2.status_code == 409
    assert "Double Booking Prevented" in booking2.json()["detail"]

    # 6. Verify order history for User 1
    history1 = client.get("/api/bookings/me", headers={"Authorization": f"Bearer {token1}"}).json()
    assert len(history1) == 1
    assert history1[0]["movie_title"] == "Test Movie"
    assert history1[0]["seat_labels"] == ["A1"]
    assert history1[0]["total_amount"] == 10.0  # Base price * 1.0 multiplier
