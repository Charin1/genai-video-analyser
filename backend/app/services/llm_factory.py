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
        
        # Lazy fallback logic
        use_gemini = False
        
        # If user explicitly asks for Gemini, try to use it
        if "gemini" in effective_model:
            use_gemini = True
        # If user asks for something else (e.g. default 'openai' string which maps to Groq usually)
        # Check if Groq key is actually present
        elif not settings.GROQ_API_KEY:
            # No Groq key, force Gemini if available
            if settings.GOOGLE_API_KEY:
                use_gemini = True
                effective_model = "gemini-pro" # Fallback model
            else:
                # No keys at all? Let it fail or raise
                pass

        if use_gemini:
            if not settings.GOOGLE_API_KEY:
                # If we ended up here but have no Google key, try Groq as last resort
                if settings.GROQ_API_KEY:
                     return ChatGroq(
                        groq_api_key=settings.GROQ_API_KEY,
                        model_name="llama3-8b-8192", # Safe default for Groq
                        temperature=0
                    )
            
            return ChatGoogleGenerativeAI(
                model=effective_model,
                google_api_key=settings.GOOGLE_API_KEY,
                convert_system_message_to_human=True 
            )
        else:
            return ChatGroq(
                groq_api_key=settings.GROQ_API_KEY,
                model_name=effective_model,
                temperature=0
            )

llm_factory = LLMFactory()
