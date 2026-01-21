from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

app = FastAPI(
    title="GenAI Video Analysis Tool",
    description="Backend for GenAI Video Analysis Tool using Google GenAI",
    version="0.1.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # TODO: Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def on_startup():
    from app.db.database import init_db, get_db_session
    from app.db.seed import seed_database
    
    await init_db()
    
    # Run seed
    async for db in get_db_session():
        await seed_database(db)
        break # Only need one session

@app.get("/")
async def root():
    return {"message": "GenAI Video Analysis Tool API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

from app.api import video, mcp, a2a, strategic, config, contacts
app.include_router(video.router, prefix="/api/v1", tags=["video"])
app.include_router(mcp.router, prefix="/mcp/v1", tags=["mcp"])
app.include_router(a2a.router, prefix="/a2a/v1", tags=["a2a"])
app.include_router(strategic.router, prefix="/api/v1/strategic", tags=["strategic"])
app.include_router(config.router, prefix="/api/v1/config", tags=["config"])
app.include_router(contacts.router, prefix="/api/v1", tags=["contacts"])


