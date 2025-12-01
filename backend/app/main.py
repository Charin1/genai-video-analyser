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

@app.get("/")
async def root():
    return {"message": "GenAI Video Analysis Tool API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

from app.api import video, mcp, a2a
app.include_router(video.router, prefix="/api/v1", tags=["video"])
app.include_router(mcp.router, prefix="/mcp/v1", tags=["mcp"])
app.include_router(a2a.router, prefix="/a2a/v1", tags=["a2a"])


