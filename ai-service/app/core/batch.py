"""
Batch scoring endpoint for multiple resumes/jobs
Performance optimization for bulk operations
"""

from typing import List
from pydantic import BaseModel, Field

from app.core import ScoringEngine


class BatchScoreRequest(BaseModel):
    """Batch scoring request"""
    resumes: List[str] = Field(..., description="List of resume texts")
    jobs: List[str] = Field(..., description="List of job descriptions")
    requirements: List[str] = Field(default_factory=list, description="List of job requirements")


class BatchScoreItem(BaseModel):
    """Individual batch result"""
    resume_index: int
    job_index: int
    match_score: float
    matched_skills: List[str]
    missing_skills: List[str]
    experience_gap: str


class BatchScoreResponse(BaseModel):
    """Batch scoring response"""
    results: List[BatchScoreItem]
    total_comparisons: int
    processing_time_seconds: float


def score_batch(
    scoring_engine: ScoringEngine,
    request: BatchScoreRequest,
) -> BatchScoreResponse:
    """Score multiple resume-job pairs in batch"""
    import time

    start = time.time()
    results = []

    for r_idx, resume_text in enumerate(request.resumes):
        for j_idx, job_desc in enumerate(request.jobs):
            requirement = request.requirements[j_idx] if j_idx < len(request.requirements) else ""

            score_result = scoring_engine.score_match(
                resume_text=resume_text,
                job_description=job_desc,
                job_requirements=requirement,
            )

            results.append(
                BatchScoreItem(
                    resume_index=r_idx,
                    job_index=j_idx,
                    match_score=score_result["match_score"],
                    matched_skills=score_result["matched_skills"],
                    missing_skills=score_result["missing_skills"],
                    experience_gap=score_result["experience_gap"],
                )
            )

    elapsed = time.time() - start

    return BatchScoreResponse(
        results=results,
        total_comparisons=len(request.resumes) * len(request.jobs),
        processing_time_seconds=round(elapsed, 2),
    )
