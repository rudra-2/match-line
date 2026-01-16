"""
Settings and configuration for AI Service
Handles environment variables and application settings
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from .env"""

    # Server
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    DEBUG: bool = True

    # LLM Configuration
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4-turbo"
    OPENAI_TEMPERATURE: float = 0.3  # Low temperature for deterministic scoring
    OPENAI_MAX_TOKENS: int = 500

    # Embeddings
    EMBEDDING_MODEL: str = "text-embedding-3-small"

    # Timeouts
    LLM_TIMEOUT: int = 30

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
