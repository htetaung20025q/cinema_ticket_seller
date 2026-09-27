from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError, OperationalError
from typing import List
from backend.database import get_db
from backend.models import User, Booking, Ticket, Showtime, Seat, Movie, Hall, BookingStatus
from backend.schemas import BookingCreateRequest, OrderHistoryItemResponse, TicketDetailResponse
from backend.dependencies import get_current_user

router = APIRouter(prefix="/api/bookings", tags=["Bookings"])

@router.post("", status_code=status.HTTP_201_CREATED)
def create_booking(
    request: BookingCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Verify showtime exists
    showtime = db.query(Showtime).filter(Showtime.id == request.showtime_id).first()
    if not showtime:
        raise HTTPException(status_code=404, detail="Selected showtime does not exist.")

    if not request.seat_ids:
        raise HTTPException(status_code=400, detail="You must select at least one seat to complete booking.")

    try:
        # CONCURRENCY CONTROL: Prevent Double Booking
        # Check if any of the requested seats have already been booked for this showtime.
        # We attempt to acquire a row-level lock (with_for_update) on existing tickets if any match.
        try:
            existing_tickets = db.query(Ticket).filter(
                Ticket.showtime_id == request.showtime_id,
                Ticket.seat_id.in_(request.seat_ids)
            ).with_for_update().all()
        except OperationalError:
            # Operational error can arise from sqlite not supporting with_for_update gracefully in certain setups, fallback cleanly
            existing_tickets = db.query(Ticket).filter(
                Ticket.showtime_id == request.showtime_id,
                Ticket.seat_id.in_(request.seat_ids)
            ).all()

        if existing_tickets:
            db.rollback()
            taken_ids = [str(t.seat_id) for t in existing_tickets]
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Double Booking Prevented! One or more selected seats were just booked by another cinema patron. Please choose distinct available seats."
            )

        # Fetch valid seats and calculate total
        seats = db.query(Seat).filter(Seat.id.in_(request.seat_ids), Seat.hall_id == showtime.hall_id).all()
        if len(seats) != len(set(request.seat_ids)):
            db.rollback()
            raise HTTPException(status_code=400, detail="Invalid seat selection for this theater room.")

        total_price = 0.0
        seat_price_map = {}
        for seat in seats:
            price = round(showtime.base_price * seat.price_multiplier, 2)
            total_price += price
            seat_price_map[seat.id] = price

        total_price = round(total_price, 2)

        # 2. Create the Booking entry
        new_booking = Booking(
            user_id=current_user.id,
            showtime_id=showtime.id,
            total_amount=total_price,
            status=BookingStatus.CONFIRMED
        )
        db.add(new_booking)
        db.flush() # flush to generate new_booking.id

        # 3. Create individual Tickets linked to this booking
        for seat_id in request.seat_ids:
            ticket = Ticket(
                booking_id=new_booking.id,
                showtime_id=showtime.id,
                seat_id=seat_id,
                price_paid=seat_price_map[seat_id]
            )
            db.add(ticket)

        db.commit()
        db.refresh(new_booking)
        return {"message": "Booking successful! Your cinematic tickets are confirmed.", "booking_id": new_booking.id, "total_amount": total_price}

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Double Booking Prevented by Database Unique Constraint! Another user completed their checkout milliseconds before you."
        )


@router.get("/me", response_model=List[OrderHistoryItemResponse])
def get_user_order_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves the authenticated user's complete booking history.
    Joins movie details, showtime dates, theater hall, booked seat labels, and total paid amount.
    """
    bookings = db.query(Booking).options(
        joinedload(Booking.showtime).joinedload(Showtime.movie),
        joinedload(Booking.showtime).joinedload(Showtime.hall),
        joinedload(Booking.tickets).joinedload(Ticket.seat)
    ).filter(Booking.user_id == current_user.id).order_by(Booking.created_at.desc()).all()

    history = []
    for b in bookings:
        showtime = b.showtime
        movie = showtime.movie
        hall = showtime.hall
        
        ticket_list = []
        seat_labels = []
        for t in b.tickets:
            seat = t.seat
            label = f"{seat.row_letter}{seat.seat_number}"
            seat_labels.append(label)
            ticket_list.append(TicketDetailResponse(
                id=t.id,
                seat_id=seat.id,
                price_paid=t.price_paid,
                row_letter=seat.row_letter,
                seat_number=seat.seat_number,
                is_vip=seat.is_vip
            ))
            
        seat_labels.sort() # alphabetical sort e.g. ["A1", "A2"]

        history.append(OrderHistoryItemResponse(
            id=b.id,
            total_amount=b.total_amount,
            status=b.status,
            created_at=b.created_at,
            movie_id=movie.id,
            movie_title=movie.title,
            movie_poster_url=movie.poster_url,
            showtime_start=showtime.start_time,
            hall_name=hall.name,
            tickets=ticket_list,
            seat_labels=seat_labels
        ))

    return history
