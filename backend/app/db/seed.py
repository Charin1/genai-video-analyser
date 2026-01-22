from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.models import Meeting, Contact
import json
import os
from datetime import datetime, timedelta

async def seed_database(db: AsyncSession):
    # Locate data file
    # Assuming this file is at backend/app/db/seed.py
    # data file is at backend/data/seed_data.json
    current_dir = os.path.dirname(os.path.abspath(__file__))
    backend_root = os.path.dirname(os.path.dirname(os.path.dirname(current_dir)))
    # Wait, current_dir is backend/app/db
    # parent is backend/app
    # grandparent is backend
    # So 3 levels up? 
    # __file__ = backend/app/db/seed.py
    # dirname = backend/app/db
    # parent = backend/app
    # parent = backend
    # data_file = backend/data/seed_data.json
    # Actually, let's be safer.
    
    # Try to find 'data' directory relative to where main.py runs usually (backend/)
    # But for robustness, let's walk up.
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    data_file_path = os.path.join(base_dir, "data", "seed_data.json")

    if not os.path.exists(data_file_path):
        print(f"Seed data file not found at {data_file_path}. Skipping seed.")
        return

    with open(data_file_path, "r") as f:
        data = json.load(f)

    # Check Meetings
    result = await db.execute(select(Meeting))
    existing_meetings_count = len(result.scalars().all())
    
    if existing_meetings_count == 0:
        print("Seeding meetings...")
        meetings_data = data.get("meetings", [])
        
        for m_data in meetings_data:
            summary_json_str = json.dumps(m_data["summary_data"])
            days_ago = m_data.get("days_ago", 0)
            meeting_date = datetime.now() - timedelta(days=days_ago)

            meeting = Meeting(
                title=m_data["title"],
                date=meeting_date,
                transcript_text=m_data["transcript_text"],
                summary_text=summary_json_str,
                file_path=m_data["file_path"]
            )
            db.add(meeting)

    # Check Contacts
    result_c = await db.execute(select(Contact))
    existing_contacts_count = len(result_c.scalars().all())

    if existing_contacts_count == 0:
        print("Seeding contacts...")
        contacts_data = data.get("contacts", [])
        
        for c in contacts_data:
            contact = Contact(
                name=c["name"],
                role=c["role"],
                company=c["company"],
                avatar=c["avatar"],
                style=c["style"],
                last_contact=c["last_contact"],
                total_meetings=c["total_meetings"],
                topics=json.dumps(c["topics"]),
                timeline=json.dumps(c["timeline"])
            )
            db.add(contact)

    await db.commit()
    if existing_meetings_count == 0 or existing_contacts_count == 0:
        print("Database seeding complete.")
    else:
        print("Database already contains data. skipping seed.")
