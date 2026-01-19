"""
Settings and configuration for AI Service
Handles environment variables and application settings
Supports multiple LLM providers: OpenAI, Ollama, or any compatible API
"""

from pydantic_settings import BaseSettings
from typing import Optional, Literal


class Settings(BaseSettings):
    """Application settings loaded from .env"""

    # Server
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    DEBUG: bool = True

    # LLM Provider Selection: "openai", "ollama", "custom"
    LLM_PROVIDER: Literal["openai", "ollama", "custom"] = "ollama"

    # OpenAI Configuration (if using OpenAI)
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4-turbo"
    OPENAI_BASE_URL: Optional[str] = None  # For custom OpenAI-compatible APIs

    # Ollama Configuration (if using Ollama - FREE LOCAL LLM)
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.1"  # or mistral, codellama, etc.

    # Custom LLM Configuration
    CUSTOM_API_URL: Optional[str] = None
    CUSTOM_API_KEY: Optional[str] = None

    # General LLM Parameters
    LLM_TEMPERATURE: float = 0.3  # Low temperature for deterministic scoring
    LLM_MAX_TOKENS: int = 500
    LLM_TIMEOUT: int = 30

    # Embeddings Provider: "openai", "ollama", "sentence-transformers" (local)
    EMBEDDING_PROVIDER: Literal["openai", "ollama", "local"] = "ollama"
    
    # OpenAI Embeddings
    OPENAI_EMBEDDING_MODEL: str = "text-embedding-3-small"
    
    # Ollama Embeddings
    OLLAMA_EMBEDDING_MODEL: str = "nomic-embed-text"  # FREE local embeddings
    
    # Local Sentence Transformers (completely free, no API)
    LOCAL_EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
