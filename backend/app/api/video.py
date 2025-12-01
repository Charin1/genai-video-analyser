from fastapi import APIRouter, UploadFile, File, HTTPException
import os
from fastapi.responses import FileResponse
from app.services.video_service import video_service
from app.services.transcription_service import transcription_service
from app.services.analysis_service import analysis_service
from app.services.csv_export_service import csv_export_service

router = APIRouter()

@router.post("/upload")
async def upload_video(file: UploadFile = File(...)):
    try:
        print(f"Received upload request for file: {file.filename}")
        
        # 1. Save locally
        print("Step 1: Saving file...")
        file_path = await video_service.save_upload(file)
        print(f"File saved to: {file_path}")
        
        # 2. Transcribe
        print("Step 2: Transcribing video...")
        transcript = await transcription_service.transcribe_video(file_path)
        print(f"Transcription complete. Length: {len(transcript)} characters")
        
        # 3. Analyze
        print("Step 3: Analyzing transcript...")
        analysis_result = await analysis_service.analyze_video_transcript(transcript, file.filename)
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

@router.get("/download/{filename}")
async def download_csv(filename: str):
    """Download generated CSV report"""
    from pathlib import Path
    csv_path = Path(os.getcwd()) / "exports" / f"{filename}.csv"
    if not csv_path.exists():
        raise HTTPException(status_code=404, detail="CSV file not found")
    return FileResponse(csv_path, filename=f"{filename}.csv")
