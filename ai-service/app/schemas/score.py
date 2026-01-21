"""
Pydantic schemas for request/response validation
"""

from pydantic import BaseModel, Field
from typing import List, Optional


class ScoreRequest(BaseModel):
    """Request model for scoring endpoint"""

    resume_text: str = Field(..., min_length=1, description="Resume text content")
    job_description: str = Field(..., min_length=1, description="Job description text")
    job_requirements: Optional[str] = Field(None, description="Additional job requirements")

    class Config:
        json_schema_extra = {
            "example": {
                "resume_text": "Senior Backend Engineer with 5 years Node.js experience...",
                "job_description": "Looking for experienced backend developer with Node.js...",
                "job_requirements": "Node.js, PostgreSQL, Docker, AWS",
            }
        }


class ScoreResponse(BaseModel):
    """Response model for scoring results"""

    match_score: float = Field(..., ge=0, le=100, description="Overall match score 0-100")
    matched_skills: List[str] = Field(..., description="Top matched skills")
    missing_skills: List[str] = Field(..., description="Missing critical skills")
    experience_gap: str = Field(..., description="Experience gap: None, Minor, Moderate, Major")
    summary: str = Field(..., description="Brief summary of the match")

    class Config:
        json_schema_extra = {
            "example": {
                "match_score": 82.5,
                "matched_skills": ["Node.js", "PostgreSQL", "Docker", "Backend APIs", "REST"],
                "missing_skills": ["Kubernetes", "System Design"],
                "experience_gap": "Minor",
                "summary": "Strong backend expertise with core technologies. Missing advanced DevOps.",
            }
        }


class HealthResponse(BaseModel):
    """Health check response"""

    status: str
    version: str
    service: str
