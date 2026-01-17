"""
Core scoring engine combining embeddings, LLM, and rule-based logic
Implements the weighted scoring algorithm
Supports multiple LLM providers (OpenAI, Ollama, etc.)
"""

from typing import Dict, List
import json
import re
from settings import settings
from embeddings import EmbeddingsService
from llm_client import LLMClient
from prompts import get_scoring_prompt
from utils import clean_text, extract_text_chunk, parse_json_response, validate_score_response


class ScoringEngine:
    """
    Scoring Logic (MANDATORY):
    -------------------------
    Match Score = (0.40 × Skills) + (0.30 × Semantic) + (0.20 × Experience) + (0.10 × Keywords)

    Components:
    1. Skills (40%): Exact and inferred skill overlap
    2. Semantic Similarity (30%): Vector-based meaning comparison using embeddings
    3. Experience (20%): Years, level, domain alignment
    4. Keywords (10%): Role-specific terms (e.g., "lead", "senior", "architect")

    Why LLM vs Traditional NLP:
    --------------------------
    Traditional NLP (regex, keyword counts):
      ✓ Fast and deterministic
      ✗ Cannot understand context or synonyms
      ✗ Misses implicit qualifications
      ✗ Poor at reasoning about experience level

    LLM (GPT-4):
      ✓ Understands context and semantics
      ✓ Infers skills from project descriptions
      ✓ Reasons about experience adequacy
      ✗ Slower and more expensive
      ✗ Potential for hallucinations (controlled via prompts)

    Best Practice: Hybrid approach
      - Use embeddings for semantic similarity (fast, accurate)
      - Use LLM for complex reasoning (skill extraction, experience gaps)
      - Use rules for deterministic scoring (weighted formula)
    """

    def __init__(self):
        self.llm = LLMClient()
        self.embeddings_service = EmbeddingsService()
        print(f"✓ Scoring engine initialized with {settings.LLM_PROVIDER} LLM and {settings.EMBEDDING_PROVIDER} embeddings")

    def score_match(
        self, resume_text: str, job_description: str, job_requirements: str = ""
    ) -> Dict:
        """
        Main scoring function
        Orchestrates LLM, embeddings, and weighted calculation
        """
        # Step 1: Clean and prepare text
        resume_clean = clean_text(extract_text_chunk(resume_text))
        job_clean = clean_text(extract_text_chunk(job_description))
        req_clean = clean_text(extract_text_chunk(job_requirements)) if job_requirements else ""

        # Step 2: Get semantic similarity using embeddings (30% weight)
        semantic_score = self.embeddings_service.get_semantic_similarity(
            resume_clean, job_clean + " " + req_clean
        )

        # Step 3: Call LLM for intelligent analysis
        llm_result = self._call_llm_scorer(resume_clean, job_clean, req_clean)

        # Step 4: Calculate weighted final score
        skill_score = llm_result.get("skill_overlap_percentage", 0)  # 40% weight
        experience_score = self._calculate_experience_score(
            llm_result.get("experience_gap", "Major")
        )  # 20% weight
        keyword_score = self._calculate_keyword_score(resume_clean, job_clean)  # 10% weight

        # Final weighted score
        final_score = (
            (skill_score * 0.40)
            + (semantic_score * 0.30)
            + (experience_score * 0.20)
            + (keyword_score * 0.10)
        )

        # Step 5: Format response
        return {
            "match_score": round(final_score, 2),
            "matched_skills": llm_result.get("matched_skills", [])[:5],
            "missing_skills": llm_result.get("missing_skills", [])[:5],
            "experience_gap": llm_result.get("experience_gap", "Unknown"),
            "summary": llm_result.get("summary", "Analysis completed successfully"),
        }

    def _call_llm_scorer(
        self, resume_text: str, job_description: str, job_requirements: str
    ) -> Dict:
        """
        Call LLM for intelligent skill extraction and reasoning
        Uses structured prompt to minimize hallucinations
        Works with any LLM provider (OpenAI, Ollama, etc.)
        """
        prompt = get_scoring_prompt(resume_text, job_description, job_requirements)

        try:
            result = self.llm.generate_json(prompt)

            if not result or not validate_score_response(result):
                raise ValueError("Invalid LLM response format")

            return result

        except Exception as e:
            print(f"LLM scoring error: {e}")
            # Fallback to basic parsing
            return self._fallback_scoring(resume_text, job_description)

    def _calculate_experience_score(self, experience_gap: str) -> float:
        """
        Convert experience gap to numerical score
        """
        gap_scores = {"None": 100, "Minor": 75, "Moderate": 50, "Major": 25}
        return gap_scores.get(experience_gap, 50)

    def _calculate_keyword_score(self, resume_text: str, job_description: str) -> float:
        """
        Calculate role-specific keyword match
        Simple but effective for title/level matching
        """
        # Define role-level keywords
        keywords = {
            "senior": ["senior", "lead", "principal", "staff"],
            "mid": ["engineer", "developer", "specialist"],
            "keywords": ["api", "rest", "microservices", "docker", "kubernetes", "ci/cd"],
        }

        resume_lower = resume_text.lower()
        job_lower = job_description.lower()

        matches = 0
        total = 0

        for category, terms in keywords.items():
            for term in terms:
                total += 1
                if term in job_lower:
                    if term in resume_lower:
                        matches += 1

        return (matches / total * 100) if total > 0 else 50

    def _fallback_scoring(self, resume_text: str, job_description: str) -> Dict:
        """
        Fallback scoring if LLM fails
        Uses basic keyword extraction
        """
        # Extract basic skills using regex
        skill_pattern = r"\b(?:python|java|javascript|node\.?js|react|vue|angular|docker|kubernetes|aws|gcp|azure|sql|mongodb|redis|kafka)\b"

        resume_skills = set(re.findall(skill_pattern, resume_text.lower()))
        job_skills = set(re.findall(skill_pattern, job_description.lower()))

        matched = list(resume_skills & job_skills)
        missing = list(job_skills - resume_skills)

        overlap_pct = (len(matched) / len(job_skills) * 100) if job_skills else 50

        return {
            "matched_skills": matched[:5],
            "missing_skills": missing[:5],
            "skill_overlap_percentage": overlap_pct,
            "experience_gap": "Unknown",
            "summary": "Fallback scoring used due to LLM unavailability",
        }
