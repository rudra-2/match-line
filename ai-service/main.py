"""
Match-Line AI Service
FastAPI application for intelligent resume-job matching
Supports multiple LLM providers: OpenAI, Ollama, or custom
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import make_asgi_app
from contextlib import asynccontextmanager
import logging
import os
from app.config import settings
from app.core import ScoringEngine
from app.api import router, set_scoring_engine

# Create logs directory if it doesn't exist
os.makedirs("logs", exist_ok=True)

# Configure logging
logging.basicConfig(
    level=logging.INFO if settings.DEBUG else logging.WARNING,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown"""
    # Startup
    try:
        scoring_engine = ScoringEngine()
        set_scoring_engine(scoring_engine)
        logger.info("[OK] AI Service started successfully")
        logger.info(f"  LLM Provider: {settings.LLM_PROVIDER}")
        logger.info(f"  Embeddings Provider: {settings.EMBEDDING_PROVIDER}")
    except Exception as e:
        logger.error(f"[ERROR] Failed to initialize AI service: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("AI Service shutting down")


# Create FastAPI app
app = FastAPI(
    title="Match-Line AI Service",
    description="Intelligent resume-job matching using embeddings and LLM",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Mount Prometheus metrics app
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(router)


@app.get("/")
async def root():
    """Root endpoint with service information"""
    return {
        "service": "Match-Line AI Service",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "metrics": "/metrics",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host=settings.HOST,
        port=settings.PORT,
        log_level="info" if settings.DEBUG else "warning",
    )
