from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.exc import OperationalError
import logging
from backend.config import settings

logger = logging.getLogger(__name__)

# Try connecting to PostgreSQL first; if unreachable (e.g. docker-compose not started), gracefully fall back to SQLite if enabled
engine = None
try:
    if "postgresql" in settings.DATABASE_URL:
        # Check connection
        test_engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
        with test_engine.connect() as conn:
            pass
        engine = test_engine
        logger.info("Successfully connected to PostgreSQL database.")
except Exception as e:
    logger.warning(f"Could not connect to PostgreSQL ({e}).")
    if settings.USE_SQLITE_FALLBACK:
        logger.warning(f"Falling back to high-performance SQLite: {settings.SQLITE_DATABASE_URL}")
        engine = create_engine(settings.SQLITE_DATABASE_URL, connect_args={"check_same_thread": False})
    else:
        raise e

if engine is None:
    engine = create_engine(settings.SQLITE_DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Configure Asynchronous Engine & Session for SQLAlchemy 2.0 Admin endpoints
async_db_url = settings.SQLITE_DATABASE_URL.replace("sqlite://", "sqlite+aiosqlite://")
if engine and "postgresql" in str(engine.url):
    async_db_url = str(engine.url).replace("postgresql://", "postgresql+asyncpg://").replace("postgresql+psycopg2://", "postgresql+asyncpg://")

async_engine = create_async_engine(async_db_url, echo=False)
AsyncSessionLocal = async_sessionmaker(bind=async_engine, expire_on_commit=False, class_=AsyncSession)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def async_get_db():
    async with AsyncSessionLocal() as session:
        yield session
