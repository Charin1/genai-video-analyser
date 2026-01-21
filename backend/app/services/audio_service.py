import os
import edge_tts
import uuid
from pathlib import Path
from fastapi import UploadFile

UPLOAD_DIR = Path(os.getcwd()) / "uploads"
AUDIO_DIR = UPLOAD_DIR / "audio"
TTS_DIR = UPLOAD_DIR / "tts"

# Ensure directories exist
AUDIO_DIR.mkdir(parents=True, exist_ok=True)
TTS_DIR.mkdir(parents=True, exist_ok=True)

class AudioService:
    async def save_audio(self, file: UploadFile) -> str:
        file_extension = Path(file.filename).suffix
        if not file_extension:
            file_extension = ".mp3" # default
            
        file_name = f"{uuid.uuid4()}{file_extension}"
        file_path = AUDIO_DIR / file_name
        
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
            
        return str(file_path)

    async def generate_tts(self, text: str, voice: str = "en-US-ChristopherNeural") -> str:
        """
        Generates TTS audio file and returns the relative path or filename.
        """
        communicate = edge_tts.Communicate(text, voice)
        file_name = f"tts_{uuid.uuid4()}.mp3"
        file_path = TTS_DIR / file_name
        
        await communicate.save(str(file_path))
        
        return str(file_path)

audio_service = AudioService()
