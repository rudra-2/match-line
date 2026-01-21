"""
Prometheus metrics collection for observability
Tracks scoring latency, cache hits, and AI service performance
"""

from prometheus_client import Counter, Histogram, Gauge
import time
from functools import wraps
from typing import Callable, Any

# Metrics
scoring_requests = Counter(
    "scoring_requests_total",
    "Total scoring requests",
    ["status"],
)

scoring_latency = Histogram(
    "scoring_latency_seconds",
    "Scoring latency in seconds",
    buckets=(0.1, 0.5, 1.0, 2.0, 5.0, 10.0),
)

cache_hits = Counter(
    "cache_hits_total",
    "Total cache hits",
)

cache_misses = Counter(
    "cache_misses_total",
    "Total cache misses",
)

embedding_latency = Histogram(
    "embedding_latency_seconds",
    "Embedding generation latency",
    buckets=(0.05, 0.1, 0.5, 1.0),
)

llm_latency = Histogram(
    "llm_latency_seconds",
    "LLM scoring latency",
    buckets=(0.5, 1.0, 2.0, 5.0, 10.0),
)

active_requests = Gauge(
    "active_scoring_requests",
    "Active scoring requests",
)


def track_latency(metric: Histogram) -> Callable:
    """Decorator to track operation latency"""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            start = time.time()
            try:
                result = func(*args, **kwargs)
                elapsed = time.time() - start
                metric.observe(elapsed)
                return result
            except Exception as e:
                elapsed = time.time() - start
                metric.observe(elapsed)
                raise
        return wrapper
    return decorator


def record_cache_hit() -> None:
    """Record cache hit"""
    cache_hits.inc()


def record_cache_miss() -> None:
    """Record cache miss"""
    cache_misses.inc()
