import os
from google import genai
from google.genai import types
from app.core.config import settings

class TranscriptionService:
    def __init__(self):
        self.client = genai.Client(api_key=settings.GOOGLE_API_KEY)

    async def transcribe_video(self, video_path: str, prompt: str = "Generate a detailed transcript of this video."):
        """
        Uploads video to Gemini and generates a transcript.
        """
        try:
            # Upload the file
            # Note: In a real prod app, we might want to manage file lifecycle (delete after processing)
            # For now, we upload and let Gemini handle it.
            video_file = self.client.files.upload(file=video_path)
            
            # Wait for processing if necessary (Gemini usually handles this, but for large videos might need polling)
            # The SDK might handle waiting or we might need to check state.
            # For simplicity in this iteration, we assume it's ready or we wait.
            
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
