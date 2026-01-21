from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.config import settings
from typing import Optional
import os

router = APIRouter()

class ConfigUpdate(BaseModel):
    groq_api_key: Optional[str] = None
    default_model: Optional[str] = None

@router.get("/")
async def get_config():
    return {
        "default_model": settings.DEFAULT_MODEL,
        "has_groq_key": bool(settings.GROQ_API_KEY),
        "has_google_key": bool(settings.GOOGLE_API_KEY),
        "transcription_models": [
            {"id": "gemini", "name": "Gemini Pro Vision (Multimodal)"},
            {"id": "groq", "name": "Groq Whisper (Fast Audio)"}
        ],
        "analysis_models": [
            {"id": "openai/gpt-oss-120b", "name": "Default (GPT-OSS 120B)"},
            {"id": "gemini-1.5-pro", "name": "Gemini 1.5 Pro"},
            {"id": "gemini-1.5-flash", "name": "Gemini 1.5 Flash"},
            {"id": "llama-3.1-70b-versatile", "name": "Llama 3.1 70B (Groq)"},
            {"id": "llama-3.1-8b-instant", "name": "Llama 3.1 8B (Groq)"},
            {"id": "mixtral-8x7b-32768", "name": "Mixtral 8x7b (Groq)"}
        ]
    }

@router.post("/")
async def update_config(config: ConfigUpdate):
    # In a real app, update .env file or DB.
    # Here we'll just update the memory settings for runtime, 
    # but strictly we should persist it.
    
    # Simple persistence: Append/Replace in .env
    # NOTE: modifying .env at runtime is tricky with autoreload
    
    if config.groq_api_key:
        settings.GROQ_API_KEY = config.groq_api_key
        # TODO: Persist
        
    if config.default_model:
        settings.DEFAULT_MODEL = config.default_model
        
    return {"status": "updated", "config": await get_config()}
