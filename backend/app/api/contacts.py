from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.database import get_db
from app.db.models import Contact
from pydantic import BaseModel
from typing import List, Optional, Any
import json

router = APIRouter()

# Pydantic Models
class ContactBase(BaseModel):
    name: str
    role: str
    company: str
    avatar: str
    style: Optional[str] = None
    last_contact: Optional[str] = None
    total_meetings: Optional[int] = 0
    topics: Optional[List[str]] = []
    
class TimelineEvent(BaseModel):
    id: int
    date: str
    event: str
    topics: List[str]
    sentiment: str

class ContactDetail(ContactBase):
    id: int
    timeline: List[TimelineEvent] = []

    class Config:
        orm_mode = True

class ContactUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    company: Optional[str] = None
    style: Optional[str] = None
    last_contact: Optional[str] = None
    topics: Optional[List[str]] = None
    timeline: Optional[List[TimelineEvent]] = None # Full replacement for simplicity

@router.get("/contacts", response_model=List[ContactDetail])
async def get_contacts(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Contact))
    contacts = result.scalars().all()
    
    # Map DB models to Pydantic including JSON parsing
    response = []
    for c in contacts:
        # Safe JSON parse
        topics_list = []
        if c.topics:
            try: topics_list = json.loads(c.topics)
            except: pass
            
        timeline_list = []
        if c.timeline:
            try: timeline_list = json.loads(c.timeline)
            except: pass
            
        response.append(ContactDetail(
            id=c.id,
            name=c.name,
            role=c.role,
            company=c.company,
            avatar=c.avatar,
            style=c.style,
            last_contact=c.last_contact,
            total_meetings=c.total_meetings,
            topics=topics_list,
            timeline=timeline_list
        ))
    return response

@router.put("/contacts/{contact_id}", response_model=ContactDetail)
async def update_contact(contact_id: int, update: ContactUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Contact).where(Contact.id == contact_id))
    contact = result.scalars().first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    if update.name is not None: contact.name = update.name
    if update.role is not None: contact.role = update.role
    if update.company is not None: contact.company = update.company
    if update.style is not None: contact.style = update.style
    if update.last_contact is not None: contact.last_contact = update.last_contact
    
    if update.topics is not None:
        contact.topics = json.dumps(update.topics)
        
    if update.timeline is not None:
        # Convert Pydantic models to dicts for JSON serialization
        timeline_dicts = [t.dict() for t in update.timeline]
        contact.timeline = json.dumps(timeline_dicts)
        
    await db.commit()
    await db.refresh(contact)
    
    # Re-construct response
    topics_list = []
    if contact.topics:
        try: topics_list = json.loads(contact.topics)
        except: pass
    
    timeline_list = []
    if contact.timeline:
        try: timeline_list = json.loads(contact.timeline)
        except: pass

    return ContactDetail(
        id=contact.id,
        name=contact.name,
        role=contact.role,
        company=contact.company,
        avatar=contact.avatar,
        style=contact.style,
        last_contact=contact.last_contact,
        total_meetings=contact.total_meetings,
        topics=topics_list,
        timeline=timeline_list
    )
