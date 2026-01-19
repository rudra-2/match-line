"""
FastAPI AI Service Routes
Handles all API endpoints for scoring and health checks
"""

from fastapi import APIRouter, HTTPException
from app.schemas import ScoreRequest, ScoreResponse, HealthResponse
from app.core import ScoringEngine
import logging

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
        logger.info(f"Processing scoring request for resume vs job")

        result = scoring_engine.score_match(
            resume_text=request.resume_text,
            job_description=request.job_description,
            job_requirements=request.job_requirements or "",
        )

        logger.info(f"Scoring completed with score: {result['match_score']}")
        return result

    except ValueError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Scoring error: {e}")
        raise HTTPException(status_code=500, detail=f"Scoring failed: {str(e)}")


@router.get("/")
async def root():
    """Root endpoint with service information"""
    return {
        "service": "Match-Line AI Service",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "score": "/score (POST)",
            "docs": "/docs",
        },
    }
