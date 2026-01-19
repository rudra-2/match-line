"""
FastAPI AI Service Routes
Handles all API endpoints for scoring, batch scoring, and health checks
"""

from fastapi import APIRouter, HTTPException
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from app.schemas import ScoreRequest, ScoreResponse, HealthResponse
from app.core import ScoringEngine, get_cache
from app.core.batch import BatchScoreRequest, score_batch
import logging
import time

logger = logging.getLogger(__name__)

# Initialize router and scoring engine
router = APIRouter()
scoring_engine = None


def set_scoring_engine(engine: ScoringEngine):
    """Set the scoring engine instance"""
    global scoring_engine
    scoring_engine = engine


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint
    Returns service status and version
    """
    return {
        "status": "healthy",
        "version": "1.0.0",
        "service": "Match-Line AI Service",
    }


@router.post("/score", response_model=ScoreResponse)
async def score_match(request: ScoreRequest) -> ScoreResponse:
    """
    Score a resume against a job description
    Uses LLM + Embeddings for intelligent matching

    Scoring Formula:
    ---------------
    Match Score = (0.40 × Skills) + (0.30 × Semantic) + (0.20 × Experience) + (0.10 × Keywords)
    """
    if not scoring_engine:
        logger.error("Scoring engine not initialized")
        raise HTTPException(status_code=503, detail="AI service not initialized")

    try:
        start = time.time()
        logger.info(f"▶ Processing scoring request")

        result = scoring_engine.score_match(
            resume_text=request.resume_text,
            job_description=request.job_description,
            job_requirements=request.job_requirements or "",
        )

        elapsed = time.time() - start
        logger.info(f"✓ Scoring completed with score: {result['match_score']} ({elapsed:.2f}s)")
        return result

    except ValueError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Scoring error: {e}")
        raise HTTPException(status_code=500, detail=f"Scoring failed: {str(e)}")


@router.post("/batch-score")
async def batch_score(request: BatchScoreRequest):
    """
    Batch score multiple resumes against multiple jobs
    Optimized for bulk operations with caching
    
    Performance: Uses embedding cache to avoid redundant API calls
    """
    if not scoring_engine:
        logger.error("Scoring engine not initialized")
        raise HTTPException(status_code=503, detail="AI service not initialized")

    try:
        logger.info(f"▶ Batch scoring {len(request.resumes)} resumes × {len(request.jobs)} jobs")
        result = score_batch(scoring_engine, request)
        logger.info(f"✓ Batch scoring completed: {result.total_comparisons} comparisons in {result.processing_time_seconds}s")
        return result

    except Exception as e:
        logger.error(f"Batch scoring error: {e}")
        raise HTTPException(status_code=500, detail=f"Batch scoring failed: {str(e)}")


@router.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint"""
    return generate_latest()


@router.get("/cache-stats")
async def cache_stats():
    """Get embedding cache statistics"""
    cache = get_cache()
    return cache.stats()


@router.get("/")
async def root():
    """Root endpoint with service information"""
    return {
        "service": "Match-Line AI Service",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "score": "/score (POST)",
            "batch_score": "/batch-score (POST)",
            "metrics": "/metrics",
            "cache_stats": "/cache-stats",
            "docs": "/docs",
        },
    }

