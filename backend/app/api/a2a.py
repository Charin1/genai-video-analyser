from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any

router = APIRouter()

class AgentCapability(BaseModel):
    name: str
    description: str
    input_format: str
    output_format: str

@router.get("/capabilities", response_model=List[AgentCapability])
async def get_capabilities():
    """
    Expose agent capabilities for A2A discovery.
    """
    return [
        {
            "name": "Video Analysis Agent",
            "description": "Specialized agent for analyzing sales and marketing videos.",
            "input_format": "Video File / Transcript",
            "output_format": "JSON Report with Domain Analysis"
        }
    ]

class AgentMessage(BaseModel):
    sender: str
    content: str
    type: str # 'request', 'response', 'info'

@router.post("/messages")
async def receive_message(msg: AgentMessage):
    """
    Receive messages from other agents.
    """
    # Logic to handle inter-agent messages
    # For now, just acknowledge
    return {"status": "received", "reply": f"Hello {msg.sender}, I am the Video Analysis Agent. I received your message: {msg.content}"}
