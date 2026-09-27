import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from backend.database import SessionLocal, engine, Base
from backend.models import User, Movie, Hall, Seat, Showtime, Booking, Ticket, BookingStatus
from backend.auth import get_password_hash

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed_db")

def seed():
    # Guarantee tables exist
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # Check if already seeded
        if db.query(Movie).first():
            logger.info("Database already populated with cinematic data! Skipping seed.")
            return

        logger.info("Seeding Apex Cinema database with high-resolution cinematic movies, halls, and showtimes...")

        # 1. Create Demo User & Admin Accounts
        demo_user = User(
            email="demo@cinevibe.com",
            hashed_password=get_password_hash("password123"),
            full_name="Alex Mercer",
            role="user"
        )
        demo_admin = User(
            email="admin@cinevibe.com",
            hashed_password=get_password_hash("admin123"),
            full_name="Apex Admin Administrator",
            role="admin"
        )
        db.add(demo_user)
        db.add(demo_admin)
        db.flush()

        # 2. Create Theater Halls & Seat Maps
        # Hall A: IMAX Atmos (6 rows x 8 seats per row = 48 seats)
        hall_a = Hall(name="IMAX Atmos Hall 1", total_rows=6, seats_per_row=8)
        hall_b = Hall(name="Dolby Cinema Hall 2", total_rows=5, seats_per_row=8)
        db.add(hall_a)
        db.add(hall_b)
        db.flush()

        # Populate seats for Hall A (Rows A to F; Rows E & F are VIP plush seating)
        rows_a = ["A", "B", "C", "D", "E", "F"]
        for row_idx, row_letter in enumerate(rows_a):
            is_vip = row_letter in ["E", "F"] # Back rows are premium VIP
            price_mult = 1.5 if is_vip else 1.0
            for num in range(1, 9):
                db.add(Seat(hall_id=hall_a.id, row_letter=row_letter, seat_number=num, is_vip=is_vip, price_multiplier=price_mult))

        # Populate seats for Hall B (Rows A to E)
        rows_b = ["A", "B", "C", "D", "E"]
        for row_idx, row_letter in enumerate(rows_b):
            is_vip = row_letter in ["D", "E"]
            price_mult = 1.4 if is_vip else 1.0
            for num in range(1, 9):
                db.add(Seat(hall_id=hall_b.id, row_letter=row_letter, seat_number=num, is_vip=is_vip, price_multiplier=price_mult))
        
        db.flush()

        # 3. Create Now Showing & Upcoming Movies
        movies_data = [
            # Now Showing Blockbusters
            {
                "title": "Dune: Part Two",
                "description": "Paul Atreides unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future.",
                "poster_url": "https://image.tmdb.org/t/p/w600_and_h900_bestv2/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
                "backdrop_url": "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
                "duration_mins": 166,
                "genre": "Sci-Fi / Adventure",
                "rating": "PG-13",
                "release_date": "2024-03-01",
                "is_showing": True
            },
            {
                "title": "Oppenheimer",
                "description": "During World War II, Lt. Gen. Leslie Groves Jr. appoints physicist J. Robert Oppenheimer to work on the top-secret Manhattan Project. Oppenheimer and a team of scientists spend years developing and designing the atomic bomb.",
                "poster_url": "https://image.tmdb.org/t/p/w600_and_h900_bestv2/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
                "backdrop_url": "https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
                "duration_mins": 180,
                "genre": "Biography / Drama / History",
                "rating": "R",
                "release_date": "2023-07-21",
                "is_showing": True
            },
            {
                "title": "Cyberpunk: Edgerunners Overdrive",
                "description": "A street kid trying to survive in a technology and body modification-obsessed city of the future. Having everything to lose, he chooses to stay alive by becoming an edgerunner—a mercenary outlaw also known as a cyberpunk.",
                "poster_url": "https://image.tmdb.org/t/p/w600_and_h900_bestv2/mYLOqiStMXDK3fYZFirgrMt8z5d.jpg",
                "backdrop_url": "https://image.tmdb.org/t/p/original/t/p/w1920_and_h800_multi_faces/3A0bI1sA3VqHffPj0e9jKjV6RzZ.jpg",
                "duration_mins": 145,
                "genre": "Action / Sci-Fi / Cyberpunk",
                "rating": "R",
                "release_date": "2024-04-15",
                "is_showing": True
            },
            {
                "title": "Spider-Man: Across the Spider-Verse",
                "description": "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash on how to handle a new threat, Miles must redefine what it means to be a hero.",
                "poster_url": "https://image.tmdb.org/t/p/w600_and_h900_bestv2/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
                "backdrop_url": "https://image.tmdb.org/t/p/original/22z44LPkMyf5nyyXwwbefpGIqLX.jpg",
                "duration_mins": 140,
                "genre": "Animation / Action / Adventure",
                "rating": "PG",
                "release_date": "2023-06-02",
                "is_showing": True
            },
            # Upcoming Features
            {
                "title": "Gladiator II",
                "description": "Years after witnessing the death of Maximius at the hands of his uncle, Lucius must enter the Colosseum after the powerful emperors of Rome conquer his home. With rage in his heart, he must look to his past to find strength.",
                "poster_url": "https://image.tmdb.org/t/p/w600_and_h900_bestv2/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg",
                "backdrop_url": "https://image.tmdb.org/t/p/original/8mjYwWT50GkRmwOXkOVp5PX5m27.jpg",
                "duration_mins": 155,
                "genre": "Action / History / Drama",
                "rating": "R",
                "release_date": "2026-11-22",
                "is_showing": False
            },
            {
                "title": "Blade Runner 2099: Vanguard",
                "description": "Fifty years after the events of Blade Runner 2049, new synth-technologies and replicants collide in neon-soaked New-Tokyo as detective Maya hunts down a rogue rogue corporate AI conspiracy.",
                "poster_url": "https://image.tmdb.org/t/p/w600_and_h900_bestv2/aMFl4wOQlLSEkDiap8A9S81bYZ9.jpg",
                "backdrop_url": "https://image.tmdb.org/t/p/original/eCgSYk5Jzr1yI0a8XlE6xMhXJ1Z.jpg",
                "duration_mins": 160,
                "genre": "Sci-Fi / Thriller",
                "rating": "R",
                "release_date": "2026-09-10",
                "is_showing": False
            }
        ]

        inserted_movies = []
        for md in movies_data:
            m = Movie(**md)
            db.add(m)
            inserted_movies.append(m)
        db.flush()

        # 4. Create Showtimes for Now Showing movies
        base_time = datetime.utcnow().replace(hour=18, minute=0, second=0, microsecond=0)
        showtimes_to_create = [
            {"movie_id": inserted_movies[0].id, "hall_id": hall_a.id, "start": base_time + timedelta(hours=1), "price": 14.50},
            {"movie_id": inserted_movies[0].id, "hall_id": hall_a.id, "start": base_time + timedelta(hours=5), "price": 15.00},
            {"movie_id": inserted_movies[1].id, "hall_id": hall_b.id, "start": base_time + timedelta(hours=2), "price": 13.00},
            {"movie_id": inserted_movies[2].id, "hall_id": hall_a.id, "start": base_time + timedelta(days=1, hours=1), "price": 14.00},
            {"movie_id": inserted_movies[3].id, "hall_id": hall_b.id, "start": base_time + timedelta(hours=3), "price": 12.00},
        ]

        created_showtimes = []
        for s in showtimes_to_create:
            st = Showtime(
                movie_id=s["movie_id"],
                hall_id=s["hall_id"],
                start_time=s["start"],
                end_time=s["start"] + timedelta(minutes=150),
                base_price=s["price"]
            )
            db.add(st)
            created_showtimes.append(st)
        db.flush()

        # 5. Pre-book some seats for the first showtime so the interactive map shows diverse states (Booked vs Available)
        first_st = created_showtimes[0]
        # Book seats C3, C4, C5 in Hall A for demo user to simulate existing booking order history!
        booked_seats_c = db.query(Seat).filter(Seat.hall_id == hall_a.id, Seat.row_letter == "C", Seat.seat_number.in_([3, 4, 5])).all()
        
        if booked_seats_c:
            total_amt = sum(first_st.base_price * s.price_multiplier for s in booked_seats_c)
            demo_booking = Booking(
                user_id=demo_user.id,
                showtime_id=first_st.id,
                total_amount=round(total_amt, 2),
                status=BookingStatus.CONFIRMED
            )
            db.add(demo_booking)
            db.flush()
            for s in booked_seats_c:
                db.add(Ticket(
                    booking_id=demo_booking.id,
                    showtime_id=first_st.id,
                    seat_id=s.id,
                    price_paid=round(first_st.base_price * s.price_multiplier, 2)
                ))

        db.commit()
        logger.info("Database seeding finished successfully! Demo credentials -> Email: demo@cinevibe.com | Password: password123")

    except Exception as e:
        db.rollback()
        logger.error(f"Error during seeding: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed()
