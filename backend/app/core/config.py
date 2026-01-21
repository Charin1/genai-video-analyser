from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "NexusInsightStream"
    GOOGLE_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    
    # Database Config
    # Default to SQLite if no POSTGRES_URL env var
    POSTGRES_URL: str = "sqlite+aiosqlite:///./local_db.sqlite"
    
    NEO4J_URI: str = "bolt://localhost:7687"
    NEO4J_USER: str = "neo4j"
    NEO4J_PASSWORD: str = "password"
    
    # AI Config
    DEFAULT_MODEL: str = "openai/gpt-oss-120b"
    
    class Config:
        env_file = ".env"
        # Allow missing env vars for defaults to take effect
        extra = "ignore" 

settings = Settings()
