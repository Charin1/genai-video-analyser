from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.models import Meeting
import json
from datetime import datetime, timedelta

async def seed_database(db: AsyncSession):
    # Check Meetings
    result = await db.execute(select(Meeting))
    meetings = result.scalars().all()
    
    if len(meetings) == 0:
        print("Seeding meetings...")
        # Q4 Review Meeting Data
        summary_data = {
            "Summary": "The Q4 Review meeting focused on evaluating key performance metrics, discussing the roadmap for the upcoming quarter, and addressing challenges in the engineering and sales departments. The team highlighted a strong finish to the year with revenue exceeding targets by 15%. Discussions also covered the new AI integration features, which are set to launch in Q1. There were concerns regarding server costs and team burnout, which need to be addressed immediately.",
            "Key Insights": [
                "Revenue exceeded Q4 targets by 15%, driven by enterprise adoption.",
                "AI Integration features are on track for a Q1 launch but require final QA.",
                "Backend server costs have increased by 20% due to higher traffic.",
                "Engineering team is reporting signs of burnout; hiring plan needs acceleration."
            ],
            "Action Items": [
                "Finalize QA for AI Integration features by Jan 30.",
                "Audit cloud infrastructure to optimize server costs.",
                "Approve headcount for 2 new backend engineers.",
                "Schedule a team retrospective to address burnout concerns."
            ],
            "People": ["David Kim", "Sarah Chen", "Michael Ross", "Elena Rodriguez"],
            "Companies": ["TechVentures", "Atlas Capital", "Stripe", "GreenTech Solutions"],
            "Topics": ["Revenue", "AI Integration", "Hiring", "Burnout", "Infrastructure"]
        }

        transcript_text = """David Kim: Alright everyone, let's get started with the Q4 review. Overall, I think we had a fantastic quarter.
Sarah Chen: I agree, David. The revenue numbers look great. We exceeded our targets by 15%, largely thanks to the new enterprise clients we onboarded in November.
Michael Ross: That's excellent news. However, I want to bring up the server costs. With the traffic spike, our infrastructure bill went up by about 20%. We need to look into optimizing that.
David Kim: Good point, Michael. I'll add that to the action items. We need an audit of our cloud usage.
Elena Rodriguez: What about the AI integration? Are we still on track for the Q1 launch?
David Kim: Yes, the engineering team has made great progress. We're in the final testing phase. We should be ready to ship by the end of January.
Sarah Chen: Speaking of engineering, I'm seeing some signs of burnout in the team. We pushed hard for this release. We really need to accelerate the hiring plan for those backend roles.
David Kim: I hear you, Sarah. Let's get those requisitions approved immediately. We can't afford to lose key people.
Michael Ross: Agreed. I'll sign off on the budget for two new engineers.
Elena Rodriguez: Perfect. Let's also schedule a retrospective with the team to discuss how we can improve work-life balance moving forward.
David Kim: Done. Great work everyone. Let's keep this momentum going into the new year."""

        q4_review = Meeting(
            title="Q4 Strategic Review & Roadmap",
            date=datetime.now() - timedelta(days=2),
            transcript_text=transcript_text,
            summary_text=json.dumps(summary_data),
            file_path="mock_file_path.mp4"
        )
        db.add(q4_review)
        
        # Second Meeting
        summary_data_2 = {
            "Summary": "This was a quick sync to discuss the partnership proposal from Acme Corp. The team analyzed the potential benefits and risks. The general consensus is positive, but legal needs to review the IP clauses carefully. The goal is to sign the MOU by next week.",
            "Key Insights": [
                "Acme Corp partnership offers significant distribution channel access.",
                "IP indemnification clauses in the current draft are too broad.",
                "Revenue share split is favorable at 70/30."
            ],
            "Action Items": [
                "Send contract to Legal for IP clause review.",
                "Schedule follow-up call with Acme Corp for Tuesday.",
                "Draft press release for potential announcement."
            ],
            "People": ["Sarah Chen", "Elena Rodriguez", "John Smith (Acme)"],
            "Companies": ["Acme Corp"],
            "Topics": ["Partnership", "Legal", "Distribution"]
        }
        
        transcript_text_2 = """Sarah Chen: Thanks for joining. Quick update on the Acme Corp deal. They sent over the revised contract.
Elena Rodriguez: How does the revenue share look?
Sarah Chen: It's still 70/30 in our favor, which is great. But I'm worried about the IP indemnification section. It feels a bit too broad.
Elena Rodriguez: I see. We definitely need Legal to take a close look at that. we don't want any exposure there.
Sarah Chen: Agreed. I'll forward it to them today. If they clear it, do we want to sign the MOU next week?
Elena Rodriguez: Yes, let's aim for that. The distribution access they offer is too good to pass up.
Sarah Chen: Okay, I'll set up a follow-up call with their team for Tuesday."""

        partnership_sync = Meeting(
            title="Acme Corp Partnership Sync",
            date=datetime.now() - timedelta(days=5),
            transcript_text=transcript_text_2,
            summary_text=json.dumps(summary_data_2),
            file_path="mock_file_path_2.mp4"
        )
        db.add(partnership_sync)

    # Check Contacts
    from app.db.models import Contact
    result_c = await db.execute(select(Contact))
    contacts_db = result_c.scalars().all()

    if len(contacts_db) == 0:
        print("Seeding contacts...")
        contacts = [
          {
            "name": "Sarah Chen",
            "role": "CTO",
            "company": "TechVentures",
            "avatar": "SC",
            "style": "Direct, Data-driven",
            "last_contact": "6 months ago",
            "total_meetings": 12,
            "topics": ["AI Ethics", "M&A", "Engineering"],
            "timeline": [
                { "id": 1, "date": "Jan 2024", "event": "Coffee at Starbucks", "topics": ["Merger", "Golf"], "sentiment": "positive" },
                { "id": 2, "date": "Mar 2024", "event": "Board Meeting", "topics": ["Q1 Review", "Hiring"], "sentiment": "neutral" }
            ]
          },
          {
            "name": "Michael Ross",
            "role": "Partner",
            "company": "Atlas Capital",
            "avatar": "MR",
            "style": "Analytical, Reserved",
            "last_contact": "8 months ago",
            "total_meetings": 8,
            "topics": ["Series C", "Valuation", "Board"],
            "timeline": []
          },
          {
            "name": "David Kim",
            "role": "VP Engineering",
            "company": "Stripe",
            "avatar": "DK",
            "style": "Collaborative, Technical",
            "last_contact": "3 weeks ago",
            "total_meetings": 15,
            "topics": ["Payments", "API", "Integration"],
            "timeline": []
          },
          {
            "name": "Elena Rodriguez",
            "role": "CEO",
            "company": "GreenTech Solutions",
            "avatar": "ER",
            "style": "Visionary, Persuasive",
            "last_contact": "7 months ago",
            "total_meetings": 5,
            "topics": ["Sustainability", "Partnership", "Growth"],
            "timeline": []
          }
        ]
        
        for c in contacts:
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
    print("Database seeding check complete.")

    print("Seeding database with initial data...")

    # Q4 Review Meeting Data
    summary_data = {
        "Summary": "The Q4 Review meeting focused on evaluating key performance metrics, discussing the roadmap for the upcoming quarter, and addressing challenges in the engineering and sales departments. The team highlighted a strong finish to the year with revenue exceeding targets by 15%. Discussions also covered the new AI integration features, which are set to launch in Q1. There were concerns regarding server costs and team burnout, which need to be addressed immediately.",
        "Key Insights": [
            "Revenue exceeded Q4 targets by 15%, driven by enterprise adoption.",
            "AI Integration features are on track for a Q1 launch but require final QA.",
            "Backend server costs have increased by 20% due to higher traffic.",
            "Engineering team is reporting signs of burnout; hiring plan needs acceleration."
        ],
        "Action Items": [
            "Finalize QA for AI Integration features by Jan 30.",
            "Audit cloud infrastructure to optimize server costs.",
            "Approve headcount for 2 new backend engineers.",
            "Schedule a team retrospective to address burnout concerns."
        ],
        "People": ["David Kim", "Sarah Chen", "Michael Ross", "Elena Rodriguez"],
        "Companies": ["TechVentures", "Atlas Capital", "Stripe", "GreenTech Solutions"],
        "Topics": ["Revenue", "AI Integration", "Hiring", "Burnout", "Infrastructure"]
    }

    transcript_text = """David Kim: Alright everyone, let's get started with the Q4 review. Overall, I think we had a fantastic quarter.
Sarah Chen: I agree, David. The revenue numbers look great. We exceeded our targets by 15%, largely thanks to the new enterprise clients we onboarded in November.
Michael Ross: That's excellent news. However, I want to bring up the server costs. With the traffic spike, our infrastructure bill went up by about 20%. We need to look into optimizing that.
David Kim: Good point, Michael. I'll add that to the action items. We need an audit of our cloud usage.
Elena Rodriguez: What about the AI integration? Are we still on track for the Q1 launch?
David Kim: Yes, the engineering team has made great progress. We're in the final testing phase. We should be ready to ship by the end of January.
Sarah Chen: Speaking of engineering, I'm seeing some signs of burnout in the team. We pushed hard for this release. We really need to accelerate the hiring plan for those backend roles.
David Kim: I hear you, Sarah. Let's get those requisitions approved immediately. We can't afford to lose key people.
Michael Ross: Agreed. I'll sign off on the budget for two new engineers.
Elena Rodriguez: Perfect. Let's also schedule a retrospective with the team to discuss how we can improve work-life balance moving forward.
David Kim: Done. Great work everyone. Let's keep this momentum going into the new year."""

    q4_review = Meeting(
        title="Q4 Strategic Review & Roadmap",
        date=datetime.now() - timedelta(days=2), # 2 days ago
        transcript_text=transcript_text,
        summary_text=json.dumps(summary_data),
        file_path="mock_file_path.mp4" # Placeholder
    )

    db.add(q4_review)
    
    # Add a second meeting for variety
    summary_data_2 = {
        "Summary": "This was a quick sync to discuss the partnership proposal from Acme Corp. The team analyzed the potential benefits and risks. The general consensus is positive, but legal needs to review the IP clauses carefully. The goal is to sign the MOU by next week.",
        "Key Insights": [
            "Acme Corp partnership offers significant distribution channel access.",
            "IP indemnification clauses in the current draft are too broad.",
            "Revenue share split is favorable at 70/30."
        ],
        "Action Items": [
            "Send contract to Legal for IP clause review.",
            "Schedule follow-up call with Acme Corp for Tuesday.",
            "Draft press release for potential announcement."
        ],
        "People": ["Sarah Chen", "Elena Rodriguez", "John Smith (Acme)"],
        "Companies": ["Acme Corp"],
        "Topics": ["Partnership", "Legal", "Distribution"]
    }
    
    transcript_text_2 = """Sarah Chen: Thanks for joining. Quick update on the Acme Corp deal. They sent over the revised contract.
Elena Rodriguez: How does the revenue share look?
Sarah Chen: It's still 70/30 in our favor, which is great. But I'm worried about the IP indemnification section. It feels a bit too broad.
Elena Rodriguez: I see. We definitely need Legal to take a close look at that. we don't want any exposure there.
Sarah Chen: Agreed. I'll forward it to them today. If they clear it, do we want to sign the MOU next week?
Elena Rodriguez: Yes, let's aim for that. The distribution access they offer is too good to pass up.
Sarah Chen: Okay, I'll set up a follow-up call with their team for Tuesday."""

    partnership_sync = Meeting(
        title="Acme Corp Partnership Sync",
        date=datetime.now() - timedelta(days=5),
        transcript_text=transcript_text_2,
        summary_text=json.dumps(summary_data_2),
        file_path="mock_file_path_2.mp4"
    )
    
    db.add(partnership_sync)

    
    db.add(partnership_sync)

    # Seed Contacts
    from app.db.models import Contact
    
    contacts = [
      {
        "name": "Sarah Chen",
        "role": "CTO",
        "company": "TechVentures",
        "avatar": "SC",
        "style": "Direct, Data-driven",
        "last_contact": "6 months ago",
        "total_meetings": 12,
        "topics": ["AI Ethics", "M&A", "Engineering"],
        "timeline": [
            { "id": 1, "date": "Jan 2024", "event": "Coffee at Starbucks", "topics": ["Merger", "Golf"], "sentiment": "positive" },
            { "id": 2, "date": "Mar 2024", "event": "Board Meeting", "topics": ["Q1 Review", "Hiring"], "sentiment": "neutral" }
        ]
      },
      {
        "name": "Michael Ross",
        "role": "Partner",
        "company": "Atlas Capital",
        "avatar": "MR",
        "style": "Analytical, Reserved",
        "last_contact": "8 months ago",
        "total_meetings": 8,
        "topics": ["Series C", "Valuation", "Board"],
        "timeline": []
      },
      {
        "name": "David Kim",
        "role": "VP Engineering",
        "company": "Stripe",
        "avatar": "DK",
        "style": "Collaborative, Technical",
        "last_contact": "3 weeks ago",
        "total_meetings": 15,
        "topics": ["Payments", "API", "Integration"],
        "timeline": []
      },
      {
        "name": "Elena Rodriguez",
        "role": "CEO",
        "company": "GreenTech Solutions",
        "avatar": "ER",
        "style": "Visionary, Persuasive",
        "last_contact": "7 months ago",
        "total_meetings": 5,
        "topics": ["Sustainability", "Partnership", "Growth"],
        "timeline": []
      }
    ]
    
    for c in contacts:
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
    print("Database seeded successfully.")
