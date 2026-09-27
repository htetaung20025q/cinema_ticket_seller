import pytest
import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import sessionmaker
from backend.main import app
from backend.database import Base, get_db, async_get_db
from backend.models import User, Movie
from backend.auth import create_access_token

TEST_DB_FILE = "./test_admin_suite.db"
SYNC_DB_URL = f"sqlite:///{TEST_DB_FILE}"
ASYNC_DB_URL = f"sqlite+aiosqlite:///{TEST_DB_FILE}"

sync_engine = create_engine(SYNC_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sync_engine)

async_engine = create_async_engine(ASYNC_DB_URL, echo=False)
TestingAsyncSessionLocal = async_sessionmaker(bind=async_engine, expire_on_commit=False, class_=AsyncSession)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

async def override_async_get_db():
    async with TestingAsyncSessionLocal() as session:
        yield session

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_teardown():
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[async_get_db] = override_async_get_db
    Base.metadata.create_all(bind=sync_engine)
    yield
    Base.metadata.drop_all(bind=sync_engine)
    app.dependency_overrides.clear()

def test_rbac_admin_enforcement():
    # 1. Register a standard patron user (role default is 'user')
    reg_res = client.post("/api/auth/register", json={
        "email": "patron@cinema.com",
        "password": "userpass123",
        "full_name": "Standard Patron"
    })
    assert reg_res.status_code == 201
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Try accessing restricted Admin endpoint as regular user -> expect 403 Forbidden
    movie_payload = {
        "title": "Unauthorized Film",
        "description": "A high-octane thriller about an intruder trying to breach RBAC.",
        "poster_url": "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85",
        "backdrop_url": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba",
        "duration_mins": 135,
        "genre": "Action / Cyber",
        "rating": "PG-13",
        "release_date": "2026-10-01",
        "is_showing": True
    }
    create_res = client.post("/api/admin/movies", json=movie_payload, headers=headers)
    assert create_res.status_code == 403
    assert "Insufficient privileges" in create_res.json()["detail"]

def test_admin_movie_lifecycle_and_soft_delete():
    # 1. Create an admin user directly in DB
    db = TestingSessionLocal()
    admin_user = User(
        email="superadmin@cinevibe.com",
        hashed_password="hashed_admin_pass_stub",
        full_name="Super Admin",
        role="admin"
    )
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    admin_id = admin_user.id
    db.close()

    admin_token = create_access_token(subject=admin_id)
    headers = {"Authorization": f"Bearer {admin_token}"}

    # 2. Admin creates a movie via Async Endpoint (POST /api/admin/movies)
    movie_payload = {
        "title": "Apex: The Awakening",
        "description": "In a world dominated by legacy systems, a new intelligent architecture arises.",
        "poster_url": "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&auto=format&fit=crop",
        "backdrop_url": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop",
        "duration_mins": 150,
        "genre": "Sci-Fi / Thriller",
        "rating": "PG-13",
        "release_date": "2026-08-15",
        "is_showing": True
    }
    create_res = client.post("/api/admin/movies", json=movie_payload, headers=headers)
    assert create_res.status_code == 201, f"Expected 201, got {create_res.status_code}: {create_res.text}"
    data = create_res.json()
    movie_id = data["id"]
    assert data["title"] == "Apex: The Awakening"
    assert data["is_active"] is True

    # 3. Verify movie appears in standard public now-showing catalog
    pub_res = client.get("/api/movies/now-showing")
    assert pub_res.status_code == 200
    titles = [m["title"] for m in pub_res.json()]
    assert "Apex: The Awakening" in titles

    # 4. Admin retrieves paginated catalog list (GET /api/admin/movies)
    list_res = client.get("/api/admin/movies?limit=10&offset=0", headers=headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) == 1

    # 5. Admin performs Soft Delete (DELETE /api/admin/movies/{movie_id})
    del_res = client.delete(f"/api/admin/movies/{movie_id}", headers=headers)
    assert del_res.status_code == 200
    assert "successfully soft deleted" in del_res.json()["message"]

    # 6. Verify movie NO LONGER appears in standard public catalog!
    pub_res_after = client.get("/api/movies/now-showing")
    assert pub_res_after.status_code == 200
    titles_after = [m["title"] for m in pub_res_after.json()]
    assert "Apex: The Awakening" not in titles_after
