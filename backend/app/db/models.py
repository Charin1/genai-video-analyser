from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, FetchedValue
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
import datetime

class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    date = Column(DateTime(timezone=True), server_default=func.now())
    transcript_text = Column(Text)
    summary_text = Column(Text)
    file_path = Column(String)
    
    # Insights relationship
    insights = relationship("Insight", back_populates="meeting")

class Insight(Base):
    __tablename__ = "insights"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"))
    insight_type = Column(String)  # e.g., "ACTION_ITEM", "KEY_DECISION", "PERSON_MENTIONED"
    content = Column(Text)
    
    meeting = relationship("Meeting", back_populates="insights")

class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    role = Column(String)
    company = Column(String)
    avatar = Column(String) # Initials
    
    # Enrichments
    style = Column(String)
    last_contact = Column(String)
    total_meetings = Column(Integer, default=0)
    
    # JSON fields for flexible lists
    topics = Column(Text) # JSON string of list[str]
    timeline = Column(Text) # JSON string of list[TimelineEvent]
