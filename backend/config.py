import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "Apex Cinema API"
    # Support connection to PostgreSQL via Docker or fallback to clean SQLite database for instant development
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://cinema_user:cinema_secret_password@localhost:5432/cinemadb"
    )
    # Fallback to local SQLite if Postgres is unreachable or during unit test demos when needed
    SQLITE_DATABASE_URL: str = "sqlite:///./cinema.db"
    USE_SQLITE_FALLBACK: bool = os.getenv("USE_SQLITE_FALLBACK", "true").lower() == "true"
    
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY", 
        "4a7c8e9b0d1f2a3e4c5b6a7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days for seamless UX

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
