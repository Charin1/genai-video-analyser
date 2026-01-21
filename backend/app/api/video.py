from fastapi import APIRouter, UploadFile, File, HTTPException, Form
import os
from fastapi.responses import FileResponse
from app.services.video_service import video_service
from app.services.transcription_service import transcription_service
from app.services.analysis_service import analysis_service
from app.services.csv_export_service import csv_export_service

router = APIRouter()

@router.post("/upload")
async def upload_video(
    file: UploadFile = File(...),
    transcription_method: str = Form("gemini"), # "gemini" or "groq"
    llm_model: str = Form(None) # e.g. "openai/gpt-oss-120b"
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
        
        return {
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
