from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import logging
from backend.database import async_get_db
from backend.dependencies import get_current_admin_user
from backend.models import Movie, User
from backend.schemas import MovieCreate, MovieResponse

logger = logging.getLogger("apex.admin")

router = APIRouter(prefix="/api/admin/movies", tags=["Admin Movies"])

@router.post("", response_model=MovieResponse, status_code=status.HTTP_201_CREATED)
async def admin_create_movie(
    movie_data: MovieCreate,
    db: AsyncSession = Depends(async_get_db),
    admin: User = Depends(get_current_admin_user)
):
    try:
        new_movie = Movie(
            **movie_data.model_dump(),
            is_active=True
        )
        db.add(new_movie)
        await db.commit()
        await db.refresh(new_movie)
        logger.info(f"[ADMIN] Movie '{new_movie.title}' created successfully by admin user {admin.email} (ID: {admin.id}).")
        return new_movie
    except Exception as e:
        await db.rollback()
        logger.error(f"[ADMIN ERROR] Failed to create movie '{movie_data.title}': {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error during movie creation: {str(e)}"
        )

@router.get("", response_model=List[MovieResponse])
async def admin_list_all_movies(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(async_get_db),
    admin: User = Depends(get_current_admin_user)
):
    try:
        result = await db.execute(
            select(Movie).order_by(Movie.id.desc()).offset(offset).limit(limit)
        )
        movies = result.scalars().all()
        logger.info(f"[ADMIN] Admin {admin.email} retrieved catalog list (limit={limit}, offset={offset}).")
        return movies
    except Exception as e:
        logger.error(f"[ADMIN ERROR] Failed to list catalog: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error while retrieving movie catalog: {str(e)}"
        )

@router.delete("/{movie_id}", status_code=status.HTTP_200_OK)
async def admin_soft_delete_movie(
    movie_id: int,
    db: AsyncSession = Depends(async_get_db),
    admin: User = Depends(get_current_admin_user)
):
    try:
        result = await db.execute(select(Movie).where(Movie.id == movie_id))
        movie = result.scalar_one_or_none()
        if not movie:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Movie catalog item not found."
            )
        
        movie.is_active = False
        await db.commit()
        logger.info(f"[ADMIN] Soft deleted movie ID {movie_id} ('{movie.title}') by admin {admin.email}.")
        return {
            "status": "success",
            "message": f"Movie '{movie.title}' has been successfully soft deleted and removed from public schedules."
        }
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        await db.rollback()
        logger.error(f"[ADMIN ERROR] Failed to delete movie ID {movie_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error during soft deletion: {str(e)}"
        )
