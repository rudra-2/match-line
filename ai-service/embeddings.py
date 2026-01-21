"""
Embeddings service using OpenAI for semantic similarity
Explains why embeddings are used and advantages over keyword matching
"""

from openai import OpenAI
from typing import List
import numpy as np
from settings import settings


class EmbeddingsService:
    """
    Why Embeddings?
    ---------------
    Traditional keyword matching fails to capture semantic meaning.
    Example:
      - Resume: "Built scalable web services with Node.js"
      - Job: "Requires experience in backend API development"
      - Keyword match: LOW (few exact matches)
      - Semantic match: HIGH (same underlying concept)

    Embeddings convert text to high-dimensional vectors that capture meaning.
    Similar concepts cluster together in vector space, enabling:
      - Synonym recognition (API ≈ REST ≈ web service)
      - Context understanding (React experience → frontend skills)
      - Skill inference (Docker + Kubernetes → DevOps knowledge)
    """

    def __init__(self):
        if not settings.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY not set in environment")

        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.EMBEDDING_MODEL

    def get_embedding(self, text: str) -> List[float]:
        """
        Generate embedding vector for text
        Returns: List of floats representing semantic meaning
        """
        if not text or not text.strip():
            raise ValueError("Cannot generate embedding for empty text")

        response = self.client.embeddings.create(
            model=self.model, input=text, encoding_format="float"
        )

        return response.data[0].embedding

    def calculate_similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        """
        Calculate cosine similarity between two embeddings
        Returns: Score 0-1 (0 = completely different, 1 = identical)

        Cosine similarity formula:
        similarity = (A · B) / (||A|| ||B||)
        """
        vec1 = np.array(embedding1)
        vec2 = np.array(embedding2)

        dot_product = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)

        if norm1 == 0 or norm2 == 0:
            return 0.0

        similarity = dot_product / (norm1 * norm2)

        # Convert from [-1, 1] to [0, 100]
        return float((similarity + 1) / 2 * 100)

    def get_semantic_similarity(self, text1: str, text2: str) -> float:
        """
        One-shot semantic similarity between two texts
        Returns: Percentage similarity 0-100
        """
        emb1 = self.get_embedding(text1)
        emb2 = self.get_embedding(text2)
        return self.calculate_similarity(emb1, emb2)
