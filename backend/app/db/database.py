from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# Determine connection args based on DB type
connect_args = {}
if "sqlite" in settings.POSTGRES_URL:
    connect_args = {"check_same_thread": False}

engine = create_async_engine(
    settings.POSTGRES_URL, 
    echo=True, 
    connect_args=connect_args
)

AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# Alias for clarity in non-dependency contexts
get_db_session = get_db
