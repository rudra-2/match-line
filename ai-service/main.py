"""
FastAPI AI Service for Resume-Job Matching
Handles all AI/ML logic: embeddings, LLM scoring, NLP
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from settings import settings
from scoring import ScoringEngine
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Match-Line AI Service",
    description="Intelligent resume-job matching using embeddings and LLM",
    version="1.0.0",
)

# Initialize scoring engine
scoring_engine: Optional[ScoringEngine] = None


@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    global scoring_engine
    try:
        scoring_engine = ScoringEngine()
        logger.info("✓ AI Service initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize AI service: {e}")
        raise


# Request/Response Models
class ScoreRequest(BaseModel):
    """Request model for scoring endpoint"""

    resume_text: str = Field(..., description="Resume text content")
    job_description: str = Field(..., description="Job description text")
    job_requirements: Optional[str] = Field(None, description="Additional job requirements")


class ScoreResponse(BaseModel):
    """Response model for scoring results"""

    match_score: float = Field(..., description="Overall match score 0-100")
    matched_skills: List[str] = Field(..., description="Top matched skills")
    missing_skills: List[str] = Field(..., description="Missing critical skills")
    experience_gap: str = Field(..., description="Experience gap: None, Minor, Moderate, Major")
    summary: str = Field(..., description="Brief summary of the match")


# API Endpoints
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "service": "Match-Line AI Service",
    }


@app.post("/score", response_model=ScoreResponse)
async def score_match(request: ScoreRequest):
    """
    Score a resume against a job description
    Uses LLM + Embeddings for intelligent matching

    Scoring Formula:
    ---------------
    Match Score = (0.40 × Skills) + (0.30 × Semantic) + (0.20 × Experience) + (0.10 × Keywords)
    """
    if not scoring_engine:
        raise HTTPException(status_code=503, detail="AI service not initialized")

    try:
        logger.info("Processing scoring request")

        result = scoring_engine.score_match(
            resume_text=request.resume_text,
            job_description=request.job_description,
            job_requirements=request.job_requirements or "",
        )

        logger.info(f"Scoring completed: {result['match_score']}")
        return result

    except Exception as e:
        logger.error(f"Scoring error: {e}")
        raise HTTPException(status_code=500, detail=f"Scoring failed: {str(e)}")


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
