from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

router = APIRouter()

class Tool(BaseModel):
    name: str
    description: str
    input_schema: Dict[str, Any]

class MCPResponse(BaseModel):
    tools: List[Tool]

@router.get("/tools", response_model=MCPResponse)
async def list_tools():
    """
    List available tools for MCP.
    """
    return {
        "tools": [
            {
                "name": "transcribe_video",
                "description": "Transcribes a video file from a given path or URL.",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "video_path": {"type": "string"}
                    },
                    "required": ["video_path"]
                }
            },
            {
                "name": "analyze_video_transcript",
                "description": "Analyzes a video transcript and generates a structured report.",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "transcript": {"type": "string"},
                        "filename": {"type": "string"}
                    },
                    "required": ["transcript"]
                }
            }
        ]
    }

class ToolCall(BaseModel):
    name: str
    arguments: Dict[str, Any]

@router.post("/tools/call")
async def call_tool(call: ToolCall):
    """
    Execute a tool call.
    """
    if call.name == "transcribe_video":
        # In a real scenario, we might need to handle file paths carefully or support URLs
        # For now, this is a placeholder for the protocol
        return {"status": "error", "message": "Direct file path access via MCP not fully implemented for security. Use upload endpoint."}
    
    elif call.name == "analyze_video_transcript":
        from app.services.analysis_service import analysis_service
        result = await analysis_service.analyze_video_transcript(
            call.arguments.get("transcript"),
            call.arguments.get("filename", "unknown")
        )
        return result
    
    else:
        raise HTTPException(status_code=404, detail="Tool not found")
