from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.database import get_db
from backend.models import Showtime, Seat, Ticket, Hall, Movie
from backend.schemas import HallSeatsResponse, SeatResponse

router = APIRouter(prefix="/api/showtimes", tags=["Showtimes"])

@router.get("/{showtime_id}/seats", response_model=HallSeatsResponse)
def get_showtime_seats(showtime_id: int, db: Session = Depends(get_db)):
    showtime = db.query(Showtime).filter(Showtime.id == showtime_id).first()
    if not showtime:
        raise HTTPException(status_code=404, detail="Showtime not found")

    movie = db.query(Movie).filter(Movie.id == showtime.movie_id).first()
    hall = db.query(Hall).filter(Hall.id == showtime.hall_id).first()
    if not movie or not hall:
        raise HTTPException(status_code=404, detail="Theater hall or movie data missing")

    # Fetch all seats in this specific theater hall
    all_seats = db.query(Seat).filter(Seat.hall_id == hall.id).order_by(Seat.row_letter, Seat.seat_number).all()

    # Fetch IDs of seats that are currently booked/reserved for this showtime
    booked_ticket_rows = db.query(Ticket.seat_id).filter(Ticket.showtime_id == showtime_id).all()
    booked_seat_ids = {row[0] for row in booked_ticket_rows}

    seat_responses = []
    for seat in all_seats:
        is_booked = seat.id in booked_seat_ids
        # Calculate dynamic seat price based on base price and VIP multiplier
        calculated_price = round(showtime.base_price * seat.price_multiplier, 2)
        
        seat_responses.append(SeatResponse(
            id=seat.id,
            row_letter=seat.row_letter,
            seat_number=seat.seat_number,
            is_vip=seat.is_vip,
            price_multiplier=seat.price_multiplier,
            is_booked=is_booked,
            price=calculated_price
        ))

    return HallSeatsResponse(
        showtime_id=showtime.id,
        movie_title=movie.title,
        hall_name=hall.name,
        base_price=showtime.base_price,
        seats=seat_responses
    )
