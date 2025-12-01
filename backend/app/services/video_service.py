import shutil
import os
from fastapi import UploadFile
from pathlib import Path

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

class VideoService:
    async def save_upload(self, file: UploadFile) -> str:
        """
        Saves uploaded file to disk and returns the path.
        """
        file_path = UPLOAD_DIR / file.filename
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return str(file_path)

video_service = VideoService()
