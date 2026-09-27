from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from backend.database import engine, Base
from backend.routers import auth_router, movies_router, showtimes_router, bookings_router, admin_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Instantiate relational database tables automatically on startup
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database schema verification complete.")
except Exception as e:
    logger.error(f"Error creating database tables: {e}")

app = FastAPI(
    title="Apex Cinema Ticket Booking API",
    description="Modern cinema reservation server with JWT auth and double-booking concurrency protection.",
    version="1.0.0"
)

# Allow React Vite development server and production builds
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For seamless local testing across ports 5173, 3000, etc.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(movies_router.router)
app.include_router(showtimes_router.router)
app.include_router(bookings_router.router)
app.include_router(admin_router.router)

@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "Apex Cinema Backend Active"}
