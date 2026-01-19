"""
Match-Line AI Service
FastAPI application for intelligent resume-job matching
Supports multiple LLM providers: OpenAI, Ollama, or custom
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import make_asgi_app
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

# Create FastAPI app
app = FastAPI(
    title="Match-Line AI Service",
    description="Intelligent resume-job matching using embeddings and LLM",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
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


@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    try:
        scoring_engine = ScoringEngine()
        set_scoring_engine(scoring_engine)
        logger.info("✓ AI Service started successfully")
        logger.info(f"  LLM Provider: {settings.LLM_PROVIDER}")
        logger.info(f"  Embeddings Provider: {settings.EMBEDDING_PROVIDER}")
    except Exception as e:
        logger.error(f"✗ Failed to initialize AI service: {e}")
        raise


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("AI Service shutting down")


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
