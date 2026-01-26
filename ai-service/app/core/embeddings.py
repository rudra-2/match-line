"""
Embeddings service with multi-provider support
Supports: OpenAI, Ollama (FREE), and local Sentence Transformers (FREE)
Explains why embeddings are used and advantages over keyword matching
"""

from typing import List
import numpy as np
from app.config import settings
from app.core.cache import get_cache
import logging

logger = logging.getLogger(__name__)


class EmbeddingsService:
    """
    Why Embeddings?
    ---------------
    Traditional keyword matching fails to capture semantic meaning.
    
    Embeddings convert text to high-dimensional vectors that capture meaning.
    Similar concepts cluster together in vector space, enabling:
      - Synonym recognition (API ≈ REST ≈ web service)
      - Context understanding (React experience → frontend skills)
      - Skill inference (Docker + Kubernetes → DevOps knowledge)

    Provider Options:
    ----------------
    1. OpenAI: Best quality, requires API key, costs money
    2. Ollama: FREE, runs locally, good quality
    3. Sentence Transformers: FREE, runs locally, no dependencies
    """

    def __init__(self):
        self.provider = settings.EMBEDDING_PROVIDER
        self.client = None

        if self.provider == "openai":
            self._init_openai()
        elif self.provider == "ollama":
            self._init_ollama()
        elif self.provider == "local":
            self._init_local()
        else:
            raise ValueError(f"Unknown embedding provider: {self.provider}")

    def _init_openai(self):
        """Initialize OpenAI embeddings"""
        if not settings.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY required for OpenAI embeddings")
        
        from openai import OpenAI
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_EMBEDDING_MODEL
        logger.info(f"[OK] Using OpenAI embeddings: {self.model}")

    def _init_ollama(self):
        """Initialize Ollama embeddings (FREE, local)"""
        import requests
        self.model = settings.OLLAMA_EMBEDDING_MODEL
        self.base_url = settings.OLLAMA_BASE_URL
        
        # Test Ollama connection
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            if response.status_code != 200:
                raise ConnectionError("Ollama not running")
            logger.info(f"[OK] Using Ollama embeddings: {self.model} (FREE, local)")
        except Exception as e:
            raise ConnectionError(
                f"Ollama not accessible at {self.base_url}. "
                f"Install: https://ollama.ai, then run: ollama pull {self.model}"
            ) from e

    def _init_local(self):
        """Initialize local Sentence Transformers (FREE, completely offline)"""
        from sentence_transformers import SentenceTransformer
        self.model = settings.LOCAL_EMBEDDING_MODEL
        self.client = SentenceTransformer(self.model)
        logger.info(f"[OK] Using local embeddings: {self.model} (FREE, offline)")

    def get_embedding(self, text: str) -> List[float]:
        """Generate embedding vector for text (with caching)"""
        if not text or not text.strip():
            raise ValueError("Cannot generate embedding for empty text")

        # Check cache first
        cache = get_cache()
        cached = cache.get(text)
        if cached:
            return cached

        # Compute embedding
        if self.provider == "openai":
            embedding = self._get_openai_embedding(text)
        elif self.provider == "ollama":
            embedding = self._get_ollama_embedding(text)
        elif self.provider == "local":
            embedding = self._get_local_embedding(text)

        # Cache result
        cache.set(text, embedding)
        return embedding

    def _get_openai_embedding(self, text: str) -> List[float]:
        """Get embedding from OpenAI"""
        response = self.client.embeddings.create(
            model=self.model, input=text, encoding_format="float"
        )
        return response.data[0].embedding

    def _get_ollama_embedding(self, text: str) -> List[float]:
        """Get embedding from Ollama (FREE)"""
        import requests
        
        response = requests.post(
            f"{self.base_url}/api/embeddings",
            json={"model": self.model, "prompt": text},
            timeout=30
        )
        
        if response.status_code != 200:
            raise RuntimeError(f"Ollama embedding failed: {response.text}")
        
        return response.json()["embedding"]

    def _get_local_embedding(self, text: str) -> List[float]:
        """Get embedding from local model (FREE, offline)"""
        embedding = self.client.encode(text, convert_to_numpy=True)
        return embedding.tolist()

    def calculate_similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        """Calculate cosine similarity between two embeddings"""
        vec1 = np.array(embedding1)
        vec2 = np.array(embedding2)

        dot_product = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)

        if norm1 == 0 or norm2 == 0:
            return 0.0

        similarity = dot_product / (norm1 * norm2)
        return float((similarity + 1) / 2 * 100)

    def get_semantic_similarity(self, text1: str, text2: str) -> float:
        """Calculate semantic similarity between two texts (0-100)"""
        emb1 = self.get_embedding(text1)
        emb2 = self.get_embedding(text2)
        return self.calculate_similarity(emb1, emb2)
