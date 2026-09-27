from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from datetime import datetime
from backend.database import get_db
from backend.models import Movie, Showtime, Hall
from backend.schemas import MovieResponse, MovieDetailResponse, ShowtimeResponse

router = APIRouter(prefix="/api/movies", tags=["Movies"])

@router.get("/now-showing", response_model=List[MovieResponse])
def get_now_showing_movies(db: Session = Depends(get_db)):
    movies = db.query(Movie).filter(Movie.is_showing == True, Movie.is_active == True).all()
    return movies

@router.get("/upcoming", response_model=List[MovieResponse])
def get_upcoming_movies(db: Session = Depends(get_db)):
    movies = db.query(Movie).filter(Movie.is_showing == False, Movie.is_active == True).all()
    return movies

@router.get("/{movie_id}", response_model=MovieDetailResponse)
def get_movie_details(movie_id: int, db: Session = Depends(get_db)):
    movie = db.query(Movie).options(
        joinedload(Movie.showtimes).joinedload(Showtime.hall)
    ).filter(Movie.id == movie_id, Movie.is_active == True).first()
    
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
        
    # Sort showtimes chronologically
    movie.showtimes.sort(key=lambda x: x.start_time)
    return movie
