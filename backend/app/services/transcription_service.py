import os
import tempfile
from google import genai
from google.genai import types
from groq import Groq
from app.core.config import settings
from moviepy import *

class TranscriptionService:
    def __init__(self):
        self.client = genai.Client(api_key=settings.GOOGLE_API_KEY)
        self.groq_client = Groq(api_key=settings.GROQ_API_KEY)

    def extract_audio_from_video(self, video_path: str) -> str:
        """
        Extracts audio from video file and saves as temporary mp3.
        Returns the path to the audio file.
        """
        try:
            video = VideoFileClip(video_path)
            # Create temp file
            temp_audio = tempfile.NamedTemporaryFile(suffix=".mp3", delete=False)
            temp_audio.close()
            
            video.audio.write_audiofile(temp_audio.name, verbose=False, logger=None)
            return temp_audio.name
        except Exception as e:
            print(f"Error extracting audio: {e}")
            raise e

    def transcribe_audio_groq(self, audio_path: str) -> str:
        """
        Transcribes audio using Groq's whisper-large-v3 model.
        """
        try:
            with open(audio_path, "rb") as file:
                transcription = self.groq_client.audio.transcriptions.create(
                    file=(os.path.basename(audio_path), file.read()),
                    model="whisper-large-v3",
                    response_format="text"
                )
            return transcription
        except Exception as e:
            print(f"Error calling Groq Whisper: {e}")
            raise e
        finally:
            # Clean up temp audio if managed here, but caller should ideally manage
            pass

    async def transcribe_video(self, video_path: str, prompt: str = "Generate a detailed transcript of this video.", method: str = "gemini"):
        """
        Uploads video to Gemini and generates a transcript OR uses Groq Whisper.
        method: 'gemini' or 'groq'
        """
        if method == 'groq':
            print("Using Groq Whisper for transcription...")
            try:
                audio_path = self.extract_audio_from_video(video_path)
                text = self.transcribe_audio_groq(audio_path)
                # Cleanup audio
                if os.path.exists(audio_path):
                    os.remove(audio_path)
                return text
            except Exception as e:
                print(f"Groq transcription failed: {e}. Falling back to Gemini...")
                # Fallback to Gemini if Groq fails
        
        # Default Gemini Flow
        try:
            # Upload the file
            # Note: In a real prod app, we might want to manage file lifecycle (delete after processing)
            # For now, we upload and let Gemini handle it.
            video_file = self.client.files.upload(file=video_path)
            
            # Wait for processing if necessary (Gemini usually handles this, but for large videos might need polling)
            while video_file.state == types.FileState.PROCESSING:
                import time
                time.sleep(2)
                video_file = self.client.files.get(name=video_file.name)

            if video_file.state == types.FileState.FAILED:
                raise Exception("Video processing failed by Gemini.")

            # Generate content
            response = self.client.models.generate_content(
                model="gemini-2.0-flash",
                contents=[
                    video_file,
                    prompt
                ]
            )
            
            return response.text

        except Exception as e:
            print(f"Error in transcription: {e}")
            raise e

transcription_service = TranscriptionService()
