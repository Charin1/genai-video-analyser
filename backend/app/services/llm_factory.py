from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from langchain_core.language_models.chat_models import BaseChatModel
from app.core.config import settings

class LLMFactory:
    def get_llm(self, model_name: str = None) -> BaseChatModel:
        """
        Returns a LangChain ChatModel based on configuration.
        """
        # Determine model
        effective_model = model_name or settings.DEFAULT_MODEL
        
        # Simple routing logic
        # If explicitly requested 'gemini' or no Groq key, try Google
        if "gemini" in effective_model or not settings.GROQ_API_KEY:
            # Fallback to gemini-pro if just 'google' is passed or defaults mess up
            if not effective_model or "gemini" not in effective_model:
                effective_model = "gemini-pro"
                
            return ChatGoogleGenerativeAI(
                model=effective_model,
                google_api_key=settings.GOOGLE_API_KEY,
                convert_system_message_to_human=True 
            )
        else:
            # Default to Groq
            # Groq requires valid model ID. 'openai/gpt-oss-120b' from user prompt 
            # might not be valid on Groq's actual API.
            # We map 'openai/gpt-oss-120b' to 'mixtral-8x7b-32768' or similar for stability if needed,
            # BUT user asked for that string. Let's pass it. 
            # Realistically, for Groq, we should use 'llama3-8b-8192' or 'mixtral-8x7b-32768'.
            # I will pass it as is, but if it fails, user needs to change config.
            return ChatGroq(
                groq_api_key=settings.GROQ_API_KEY,
                model_name=effective_model,
                temperature=0
            )

llm_factory = LLMFactory()
