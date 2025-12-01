from google import genai
from google.genai import types
from app.core.config import settings

class LLMService:
    def __init__(self):
        self.client = genai.Client(api_key=settings.GOOGLE_API_KEY)

    async def get_embeddings(self, text: str):
        """
        Get embeddings for a text.
        """
        response = self.client.models.embed_content(
            model="text-embedding-004",
            contents=text
        )
        return response.embeddings[0].values

    async def generate_content(self, prompt: str, model: str = "gemini-2.0-flash"):
        """
        Generate content from text prompt.
        """
        response = self.client.models.generate_content(
            model=model,
            contents=prompt
        )
        return response.text

    async def generate_json(self, prompt: str, schema: dict = None, model: str = "gemini-2.0-flash"):
        """
        Generate JSON content.
        """
        # TODO: Use structured output if available in SDK, else prompt engineering
        # For now, we'll just append "Return JSON" to prompt and parse.
        # Or use response_mime_type="application/json" if supported by the specific model/SDK version
        
        # config = types.GenerateContentConfig(response_mime_type="application/json")
        # response = self.client.models.generate_content(model=model, contents=prompt, config=config)
        
        config = types.GenerateContentConfig(response_mime_type="application/json")
        response = self.client.models.generate_content(
            model=model,
            contents=prompt,
            config=config
        )
        return response.text

llm_service = LLMService()
