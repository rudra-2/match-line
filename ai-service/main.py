"""
Match-Line AI Service
FastAPI application for intelligent resume-job matching
Supports multiple LLM providers: OpenAI, Ollama, or custom
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from app.config import settings
from app.core import ScoringEngine
from app.api import router, set_scoring_engine

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
    except Exception as e:
        logger.error(f"✗ Failed to initialize AI service: {e}")
        raise


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("AI Service shutting down")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host=settings.HOST,
        port=settings.PORT,
        log_level="info" if settings.DEBUG else "warning",
    )


@app.get("/")
async def root():
    """Root endpoint with service information"""
    return {
        "service": "Match-Line AI Service",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app, host=settings.HOST, port=settings.PORT, log_level="info" if settings.DEBUG else "warning"
    )
