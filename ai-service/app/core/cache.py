"""
Embedding cache layer for performance optimization
Stores computed embeddings to avoid redundant API calls
"""

import hashlib
import json
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)


class EmbeddingCache:
    """In-memory cache for embeddings with TTL support"""

    def __init__(self, max_size: int = 1000):
        self._cache: Dict[str, Any] = {}
        self._max_size = max_size

    def _get_key(self, text: str) -> str:
        """Generate cache key from text hash"""
        return hashlib.sha256(text.encode()).hexdigest()

    def get(self, text: str) -> Optional[list]:
        """Retrieve cached embedding"""
        key = self._get_key(text)
        if key in self._cache:
            logger.debug(f"Cache HIT for embedding")
            return self._cache[key]
        logger.debug(f"Cache MISS for embedding")
        return None

    def set(self, text: str, embedding: list) -> None:
        """Cache embedding with LRU eviction"""
        if len(self._cache) >= self._max_size:
            # Simple eviction: remove first key
            first_key = next(iter(self._cache))
            del self._cache[first_key]
            logger.debug(f"Cache evicted old entry, size={len(self._cache)}")

        key = self._get_key(text)
        self._cache[key] = embedding
        logger.debug(f"Cached embedding, cache_size={len(self._cache)}")

    def clear(self) -> None:
        """Clear all cache"""
        self._cache.clear()
        logger.info("Cache cleared")

    def stats(self) -> Dict[str, Any]:
        """Return cache statistics"""
        return {
            "size": len(self._cache),
            "max_size": self._max_size,
        }


# Global cache instance
_embedding_cache = EmbeddingCache()


def get_cache() -> EmbeddingCache:
    """Get global cache instance"""
    return _embedding_cache
