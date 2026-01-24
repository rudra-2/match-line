"""
Structured logging for AI Service
Provides centralized logging with metrics collection
"""

import logging
import logging.handlers
import time
import os
from functools import wraps
from typing import Any, Callable
from app.config import settings

# Create logs directory if it doesn't exist
os.makedirs("logs", exist_ok=True)

# Configure structured logging
logging.basicConfig(
    level=logging.INFO if settings.DEBUG else logging.WARNING,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("logs/ai_service.log", mode="a"),
    ],
)


def timer_log(func: Callable) -> Callable:
    """Decorator to log function execution time"""
    @wraps(func)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        logger = logging.getLogger(func.__module__)
        start = time.time()
        logger.info(f"▶ {func.__name__} started")
        try:
            result = func(*args, **kwargs)
            elapsed = time.time() - start
            logger.info(f"[OK] {func.__name__} completed in {elapsed:.2f}s")
            return result
        except Exception as e:
            elapsed = time.time() - start
            logger.error(f"[ERROR] {func.__name__} failed after {elapsed:.2f}s: {e}")
            raise
    return wrapper


def get_logger(name: str) -> logging.Logger:
    """Get logger instance for module"""
    return logging.getLogger(name)
