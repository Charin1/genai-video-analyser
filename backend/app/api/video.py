from fastapi import APIRouter, UploadFile, File, HTTPException, Form, Depends
import os
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.services.video_service import video_service
from app.services.transcription_service import transcription_service
from app.services.analysis_service import analysis_service
from app.services.csv_export_service import csv_export_service
from app.db.database import get_db
from app.db.models import Meeting, Insight
import json
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

class VideoUpdate(BaseModel):
    title: Optional[str] = None
    transcript_text: Optional[str] = None
    summary_text: Optional[str] = None
    # flexible field for updating parts of the report JSON safely if needed, 
    # but summary_text override is simpler for now.

router = APIRouter()

@router.get("/videos")
async def get_videos(db: AsyncSession = Depends(get_db)):
    """Get list of analyzed videos/meetings"""
    result = await db.execute(select(Meeting).options(selectinload(Meeting.insights)).order_by(Meeting.date.desc()))
    meetings = result.scalars().all()
    return meetings

@router.get("/videos/{video_id}")
async def get_video(video_id: int, db: AsyncSession = Depends(get_db)):
    """Get specific video/meeting details"""
    result = await db.execute(select(Meeting).where(Meeting.id == video_id).options(selectinload(Meeting.insights)))
    meeting = result.scalars().first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting

@router.put("/videos/{video_id}")
async def update_video(video_id: int, update_data: VideoUpdate, db: AsyncSession = Depends(get_db)):
    """Update meeting details (title, transcript, summary/report)"""
    result = await db.execute(select(Meeting).where(Meeting.id == video_id))
    meeting = result.scalars().first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    if update_data.title is not None:
        meeting.title = update_data.title
    if update_data.transcript_text is not None:
        meeting.transcript_text = update_data.transcript_text
    if update_data.summary_text is not None:
        meeting.summary_text = update_data.summary_text
        
        # If summary_text is updated, we might want to refresh insights if we were storing them strictly 
        # as rows, but currently the frontend drives 'Action Items' etc from the JSON in summary_text.
        # So updating summary_text is sufficient for persistence of those items.
    
    await db.commit()
    await db.refresh(meeting)
    return meeting

@router.post("/upload")
async def upload_video(
    file: UploadFile = File(...),
    transcription_method: str = Form("gemini"), # "gemini" or "groq"
    llm_model: str = Form(None), # e.g. "openai/gpt-oss-120b"
    db: AsyncSession = Depends(get_db)
):
    try:
        print(f"Received upload request for file: {file.filename}")
        
        # 1. Save locally
        print("Step 1: Saving file...")
        file_path = await video_service.save_upload(file)
        print(f"File saved to: {file_path}")
        
        # 2. Transcribe
        print(f"Step 2: Transcribing video using {transcription_method}...")
        transcript = await transcription_service.transcribe_video(file_path, method=transcription_method)
        print(f"Transcription complete. Length: {len(transcript)} characters")
        
        # 3. Analyze
        print(f"Step 3: Analyzing transcript using model {llm_model or 'default'}...")
        analysis_result = await analysis_service.analyze_video_transcript(transcript, file.filename, llm_model=llm_model)
        print(f"Analysis complete. Domain: {analysis_result.get('domain', 'unknown')}")
        
        # 4. Export to CSV
        print("Step 4: Exporting to CSV...")
        csv_path = csv_export_service.export_report_to_csv(
            analysis_result["report"], 
            file.filename.replace('.', '_')
        )
        print(f"CSV exported to: {csv_path}")

        # 5. Persist to DB
        print("Step 5: Persisting to Database...")
        # Check if report is dict or string (it should be dict from analysis_service)
        report_data = analysis_result.get("report", {})
        summary_text = ""
        if isinstance(report_data, dict):
            summary_text = report_data.get("Summary", "") or report_data.get("summary", "")
        else:
            summary_text = str(report_data)

        new_meeting = Meeting(
            title=file.filename,
            transcript_text=transcript,
            summary_text=json.dumps(report_data) if isinstance(report_data, dict) else str(report_data),
            file_path=str(file_path)
        )
        db.add(new_meeting)
        await db.flush() # flush to get ID

        # Add Insights
        # Assuming report_data has keys that are lists, we can treat them as insight types
        if isinstance(report_data, dict):
            for key, value in report_data.items():
                if isinstance(value, list):
                    for item in value:
                        insight = Insight(
                            meeting_id=new_meeting.id,
                            insight_type=key,
                            content=str(item)
                        )
                        db.add(insight)
                elif isinstance(value, str) and key.lower() not in ["summary", "title"]:
                     insight = Insight(
                            meeting_id=new_meeting.id,
                            insight_type=key,
                            content=value
                        )
                     db.add(insight)
        
        await db.commit()
        await db.refresh(new_meeting)
        print(f"Meeting saved with ID: {new_meeting.id}")
        
        return {
            "id": new_meeting.id,
            "filename": file.filename,
            "transcript": transcript,
            "analysis": analysis_result,
            "csv_path": csv_path,
            "message": "Video processed and analyzed successfully"
        }
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Error processing video: {str(e)}")
        print(f"Traceback: {error_details}")
        raise HTTPException(status_code=500, detail=f"Error processing video: {str(e)}")

@router.post("/audio/upload")
async def upload_audio(file: UploadFile = File(...)):
    from app.services.audio_service import audio_service
    from app.services.transcription_service import transcription_service
    from app.services.analysis_service import analysis_service
    
    try:
        # 1. Save
        file_path = await audio_service.save_audio(file)
        
        # 2. Transcribe (assuming video transcriber works for audio, usually yes if using whisper/gemini)
        # If transcription_service expects video, might need tweak, but usually generic av support.
        transcript = await transcription_service.transcribe_video(file_path)
        
        # 3. Analyze
        analysis_result = await analysis_service.analyze_video_transcript(transcript, file.filename)
        
        return {
            "filename": file.filename,
            "transcript": transcript,
            "analysis": analysis_result,
            "message": "Audio processed successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/audio/tts")
async def generate_tts(text: str, voice: str = "en-US-ChristopherNeural"):
    """
    Generate TTS audio for the given text.
    """
    from app.services.audio_service import audio_service
    try:
        file_path = await audio_service.generate_tts(text, voice)
        # Return file or url?
        # Construct a downloadable URL
        filename = os.path.basename(file_path)
        return {"audio_url": f"/api/v1/download/tts/{filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/download/tts/{filename}")
async def download_tts(filename: str):
    from pathlib import Path
    from app.services.audio_service import TTS_DIR
    file_path = TTS_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path, media_type="audio/mpeg", filename=filename)

@router.get("/download/{filename}")
async def download_csv(filename: str):
    """Download generated CSV report"""
    from pathlib import Path
    csv_path = Path(os.getcwd()) / "exports" / f"{filename}.csv"
    if not csv_path.exists():
        raise HTTPException(status_code=404, detail="CSV file not found")
    return FileResponse(csv_path, filename=f"{filename}.csv")
