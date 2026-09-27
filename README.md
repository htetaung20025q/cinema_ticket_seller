# Apex Cinema - Complete Full-Stack Ticket Booking Web Application

Welcome to **Apex Cinema**, a state-of-the-art cinematic ticket reservation web application designed with an ultra-modern dark mode theme, vibrant Netflix-style crimson red accents (`#E50914`), relational PostgreSQL database design, and robust concurrency control against double-booking race conditions.

---

## 🏗️ Project Architecture & Folder Structure

```
/home/htetagg/Desktop/Cinema_ticket_seller/
├── docker-compose.yml                # Pre-configured PostgreSQL 16 & pgAdmin containers
├── README.md                         # Architecture overview & setup instructions
├── backend/                          # FastAPI Backend API Server
│   ├── requirements.txt              # Python dependencies (FastAPI, SQLAlchemy, JWT, Bcrypt)
│   ├── main.py                       # App entry point, CORS configuration & ORM bootstrapper
│   ├── config.py                     # Environment & Postgres / SQLite fallback connection config
│   ├── database.py                   # SQLAlchemy database engine & SessionLocal generator
│   ├── models.py                     # Relational DB models (Users, Movies, Halls, Seats, Showtimes, Bookings, Tickets)
│   ├── schemas.py                    # Strict Pydantic request/response validation schemas
│   ├── auth.py                       # Bcrypt password hashing & JWT token issuance
│   ├── dependencies.py               # Dependency guards for JWT authentication & DB access
│   ├── seed_db.py                    # Database generator with blockbuster cinema data & demo accounts
│   ├── test_api.py                   # Unit test suite & simulated concurrent Double-Booking attack verification
│   └── routers/                      # Modular RESTful API routes
│       ├── auth_router.py            # POST /api/auth/register, /login, GET /me
│       ├── movies_router.py          # GET /api/movies/now-showing, /upcoming, /{id}
│       ├── showtimes_router.py       # GET /api/showtimes/{id}/seats (dynamic real-time pricing & availability)
│       └── bookings_router.py        # POST /api/bookings (FOR UPDATE concurrency lock), GET /api/bookings/me
└── frontend/                         # Vite + React + Tailwind CSS Web Application
    ├── package.json
    ├── tailwind.config.js            # Custom dark colors, crimson red tokens, and neon shadow effects
    ├── vite.config.js
    └── src/
        ├── App.jsx                   # Main routing, persistent header & authentication state provider
        ├── index.css                 # Custom scrollbars, glassmorphic panels, and perforated ticket CSS rules
        ├── api/                      
        │   └── client.js             # Axios HTTP client with automatic JWT authorization header injection
        ├── components/               
        │   ├── Navbar.jsx            # Glassmorphic navigation header & patron login badge
        │   ├── MovieCard.jsx         # High-resolution film poster cards with interactive elevation
        │   ├── SeatSelector.jsx      # 3D curved cinematic screen map with Available, Selected, & Booked states
        │   └── CheckoutModal.jsx     # Simulated Apple Pay/Wallet modal with 409 Conflict toast notifications
        └── pages/                    
            ├── Home.jsx              # Hero Showcase & Tabbed Now Showing / Upcoming directory
            ├── MovieDetails.jsx      # Synopsis, theatrical trailer preview & showtime selector
            ├── OrderHistory.jsx      # "My Bookings" dashboard featuring perforated digital tickets & QR codes
            └── LoginRegister.jsx     # Authentication modal with instant Demo Patron login button
```

---

## 🔒 Feature Highlight: Double-Booking Concurrency Protection

To prevent "Double Booking" (when two competing users attempt to reserve the exact same seat simultaneously during a popular movie premiere), Apex Cinema uses a **Dual-Layer Protection Protocol**:

1. **Transaction Layer (`SELECT ... FOR UPDATE`)**:
   In `backend/routers/bookings_router.py`, when a booking is initiated, the database acquires an exclusive row-level lock on any existing ticket records for the requested `(showtime_id, seat_id)`. If another user committed a ticket milliseconds prior, the active transaction is rolled back immediately and returns a clean `409 Conflict` HTTP error (`"Double Booking Prevented! One or more selected seats were just booked by another patron."`).
2. **Schema Engine Layer (`UniqueConstraint`)**:
   In `backend/models.py`, the `Ticket` model defines a rigid database table constraint:
   ```python
   __table_args__ = (
       UniqueConstraint('showtime_id', 'seat_id', name='uq_showtime_seat_ticket_booking'),
   )
   ```
   This guarantees that even under thousands of concurrent requests, PostgreSQL enforces exclusivity directly at the disk storage level.

---

## 🚀 Quick Start Instructions

### Option A: Complete Database Setup (Docker + PostgreSQL)
1. Launch PostgreSQL and pgAdmin automatically from the root directory:
   ```bash
   docker-compose up -d
   ```
   *(Note: If Docker is unavailable, the backend gracefully falls back to a high-performance local SQLite database (`./cinema.db`) so development is never blocked!)*

### 1️⃣ Start the Python FastAPI Backend Server
In terminal 1, install dependencies, populate demonstration cinematic data, and boot up the server:
```bash
# Optional: Create virtual environment
python3 -m venv venv && source venv/bin/activate

# Install requirements
pip install -r backend/requirements.txt

# Seed the database with high-def movies, theater halls, VIP seats, & demo patron account
python3 -m backend.seed_db

# Launch FastAPI local development server
uvicorn backend.main:app --reload --port 8000
```
- Interactive Swagger API documentation: `http://localhost:8000/docs`
- Demo Patron Account: `demo@cinevibe.com` | Password: `password123`

### 2️⃣ Start the Vite + React Frontend Developer UI
In terminal 2, install node dependencies and open the theatrical interface:
```bash
cd frontend
npm install
npm run dev
```
Open your browser to `http://localhost:5173` to experience the modern dark aesthetic, interactive seating map, and your digital perforated ticket vault!
