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
            audio_path = None
            try:
                audio_path = self.extract_audio_from_video(video_path)
                
                # Check file size
                file_size_mb = os.path.getsize(audio_path) / (1024 * 1024)
                print(f"Audio file size: {file_size_mb:.2f} MB")
                
                if file_size_mb > 24: # Safety for 25MB limit
                    print("File too large for single request. Chunking...")
                    # Load audio to determine duration
                    # We can use MoviePy's AudioFileClip to split
                    from moviepy.editor import AudioFileClip
                    
                    full_audio = AudioFileClip(audio_path)
                    duration = full_audio.duration
                    
                    # Split into 10-minute chunks (600 seconds)
                    chunk_duration = 600
                    chunks = int(duration / chunk_duration) + 1
                    
                    full_transcript = []
                    
                    for i in range(chunks):
                        start = i * chunk_duration
                        end = min((i + 1) * chunk_duration, duration)
                        
                        if start >= end: break
                        
                        print(f"Processing chunk {i+1}/{chunks} ({start}-{end}s)...")
                        
                        chunk_filename = f"{audio_path}_chunk_{i}.mp3"
                        # Subclip and write
                        chunk_clip = full_audio.subclip(start, end)
                        chunk_clip.write_audiofile(chunk_filename, verbose=False, logger=None)
                        
                        # Transcribe chunk
                        chunk_text = self.transcribe_audio_groq(chunk_filename)
                        full_transcript.append(chunk_text)
                        
                        # Cleanup chunk
                        chunk_clip.close()
                        if os.path.exists(chunk_filename):
                            os.remove(chunk_filename)
                            
                    full_audio.close()
                    return " ".join(full_transcript)
                else:
                    text = self.transcribe_audio_groq(audio_path)
                    return text

            except Exception as e:
                print(f"Groq transcription failed: {e}. Falling back to Gemini...")
                # Fallback to Gemini if Groq fails
            finally:
                if audio_path and os.path.exists(audio_path):
                   os.remove(audio_path)
        
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
