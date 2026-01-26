"""
Core scoring engine combining embeddings, LLM, and rule-based logic
Implements the weighted scoring algorithm
"""

from typing import Dict, List, Set, Tuple
import json
import re
import logging
from app.config import settings
from app.core.embeddings import EmbeddingsService
from app.core.llm_client import LLMClient
from app.prompts import get_scoring_prompt
from app.utils import validate_score_response

logger = logging.getLogger(__name__)

# Skill patterns with all variations - pattern matches ANY of these
SKILL_PATTERNS: List[Tuple[str, str]] = [
    (r"\b(?:typescript)\b", "TypeScript"),
    (r"\b(?:javascript)\b", "JavaScript"),
    (r"\b(?:node\.?js|nodejs)\b", "Node.js"),
    (r"\b(?:react\.?js|reactjs)\b", "React"),
    (r"\breact\b(?!\.?js|js)", "React"),  # "react" alone
    (r"\b(?:next\.?js|nextjs)\b", "Next.js"),
    (r"\b(?:nest\.?js|nestjs)\b", "NestJS"),
    (r"\b(?:express\.?js|expressjs)\b", "Express"),
    (r"\bexpress\b(?!\.?js|js)", "Express"),  # "express" alone
    (r"\b(?:prisma(?:\s*orm)?|prismaorm)\b", "Prisma"),
    (r"\b(?:postgresql|postgres|psql|pgsql)\b", "PostgreSQL"),
    (r"\b(?:mongodb|mongo)\b", "MongoDB"),
    (r"\b(?:mysql)\b", "MySQL"),
    (r"\b(?:python)\b", "Python"),
    (r"\bjava\b(?!\s*script)", "Java"),  # "java" not followed by "script"
    (r"\b(?:c\+\+|cpp)\b", "C++"),
    (r"\b(?:c#|csharp|\.net|dotnet)\b", "C#/.NET"),
    (r"\b(?:golang|go\s+lang)\b", "Go"),
    (r"\b(?:rust)\b", "Rust"),
    (r"\b(?:ruby)\b", "Ruby"),
    (r"\b(?:php)\b", "PHP"),
    (r"\b(?:swift)\b", "Swift"),
    (r"\b(?:kotlin)\b", "Kotlin"),
    (r"\b(?:docker|containerization)\b", "Docker"),
    (r"\b(?:kubernetes|k8s)\b", "Kubernetes"),
    (r"\b(?:aws|amazon\s*web\s*services)\b", "AWS"),
    (r"\b(?:gcp|google\s*cloud(?:\s*platform)?)\b", "GCP"),
    (r"\b(?:azure|microsoft\s*azure)\b", "Azure"),
    (r"\b(?:graphql|gql)\b", "GraphQL"),
    (r"\b(?:rest(?:ful)?(?:\s*api)?s?)\b", "REST API"),
    (r"\b(?:sql)\b", "SQL"),
    (r"\b(?:nosql)\b", "NoSQL"),
    (r"\b(?:git(?!hub))\b", "Git"),  # Git but not GitHub
    (r"\b(?:github)\b", "GitHub"),
    (r"\b(?:gitlab)\b", "GitLab"),
    (r"\b(?:redis)\b", "Redis"),
    (r"\b(?:elasticsearch|elastic\s*search)\b", "Elasticsearch"),
    (r"\b(?:kafka)\b", "Kafka"),
    (r"\b(?:rabbitmq)\b", "RabbitMQ"),
    (r"\b(?:tailwind(?:\s*css)?)\b", "Tailwind CSS"),
    (r"\b(?:bootstrap)\b", "Bootstrap"),
    (r"\b(?:html5?)\b", "HTML"),
    (r"\b(?:css3?)\b", "CSS"),
    (r"\b(?:sass|scss)\b", "SASS/SCSS"),
    (r"\b(?:vue\.?js|vuejs|vue)\b", "Vue.js"),
    (r"\b(?:angular(?:js)?)\b", "Angular"),
    (r"\b(?:svelte)\b", "Svelte"),
    (r"\b(?:django)\b", "Django"),
    (r"\b(?:flask)\b", "Flask"),
    (r"\b(?:fastapi)\b", "FastAPI"),
    (r"\b(?:spring(?:\s*boot)?)\b", "Spring Boot"),
    (r"\b(?:laravel)\b", "Laravel"),
    (r"\b(?:rails|ruby\s*on\s*rails)\b", "Ruby on Rails"),
    (r"\b(?:ci/?cd|continuous\s*integration)\b", "CI/CD"),
    (r"\b(?:jenkins)\b", "Jenkins"),
    (r"\b(?:terraform)\b", "Terraform"),
    (r"\b(?:ansible)\b", "Ansible"),
    (r"\b(?:linux)\b", "Linux"),
    (r"\b(?:nginx)\b", "Nginx"),
    (r"\b(?:apache)\b", "Apache"),
    (r"\b(?:microservices?)\b", "Microservices"),
    (r"\b(?:agile|scrum)\b", "Agile/Scrum"),
    (r"\b(?:jira)\b", "Jira"),
]


def extract_skills(text: str) -> Set[str]:
    """Extract skills from text using regex patterns"""
    text_lower = text.lower()
    found_skills = set()
    
    for pattern, skill_name in SKILL_PATTERNS:
        if re.search(pattern, text_lower, re.IGNORECASE):
            found_skills.add(skill_name)
    
    return found_skills


class ScoringEngine:
    """
    Scoring Logic (MANDATORY):
    -------------------------
    Match Score = (0.40 × Skills) + (0.30 × Semantic) + (0.20 × Experience) + (0.10 × Keywords)

    Why Hybrid Approach:
    - Use DETERMINISTIC regex for skill extraction (prevents hallucination)
    - Use embeddings for semantic similarity (fast, accurate)
    - Use LLM for experience gap assessment only (controlled output)
    """

    def __init__(self):
        self.llm = LLMClient()
        self.embeddings_service = EmbeddingsService()
        logger.info(
            f"[OK] Scoring engine initialized with {settings.LLM_PROVIDER} LLM "
            f"and {settings.EMBEDDING_PROVIDER} embeddings"
        )

    def score_match(self, resume_text: str, job_description: str, job_requirements: str = "") -> Dict:
        """Main scoring function - uses DETERMINISTIC skill matching to prevent hallucination"""
        
        # Step 1: DETERMINISTIC skill extraction (NO LLM - prevents hallucination)
        resume_skills = extract_skills(resume_text)
        job_text = job_description + " " + (job_requirements or "")
        job_skills = extract_skills(job_text)
        
        matched_skills = list(resume_skills & job_skills)
        missing_skills = list(job_skills - resume_skills)
        
        # Calculate skill overlap percentage
        if job_skills:
            skill_score = (len(matched_skills) / len(job_skills)) * 100
        else:
            skill_score = 50  # Default if no skills detected in JD
        
        logger.info(f"Resume skills: {resume_skills}")
        logger.info(f"Job skills: {job_skills}")
        logger.info(f"Matched: {matched_skills}, Missing: {missing_skills}")
        
        # Step 2: Get semantic similarity using embeddings (30% weight)
        semantic_score = self.embeddings_service.get_semantic_similarity(
            resume_text[:1000], job_text[:1500]
        )

        # Step 3: Get experience gap from LLM (only this part uses LLM)
        experience_gap = self._get_experience_gap(resume_text, job_description)
        experience_score = self._calculate_experience_score(experience_gap)
        
        # Step 4: Keyword score (10% weight)
        keyword_score = self._calculate_keyword_score(resume_text, job_description)

        # Final weighted score
        final_score = (
            (skill_score * 0.40)
            + (semantic_score * 0.30)
            + (experience_score * 0.20)
            + (keyword_score * 0.10)
        )
        
        # Generate summary
        if skill_score >= 80:
            summary = f"Excellent match! {len(matched_skills)} of {len(job_skills)} required skills found."
        elif skill_score >= 60:
            summary = f"Good match with {len(matched_skills)} skills. Missing: {', '.join(missing_skills[:3])}."
        elif skill_score >= 40:
            summary = f"Partial match. Has {len(matched_skills)} skills but missing key requirements."
        else:
            summary = f"Low match. Only {len(matched_skills)} of {len(job_skills)} required skills found."

        return {
            "match_score": round(final_score, 2),
            "matched_skills": matched_skills[:5],
            "missing_skills": missing_skills[:5],
            "experience_gap": experience_gap,
            "summary": summary,
        }

    def _get_experience_gap(self, resume_text: str, job_description: str) -> str:
        """Use LLM only for experience gap assessment"""
        prompt = f"""
Analyze the experience level. Return ONLY one word: None, Minor, Moderate, or Major.

Resume (first 500 chars): {resume_text[:500]}

Job requires: {job_description[:300]}

Experience gap (one word only):"""
        
        try:
            result = self.llm.generate(prompt)
            result = result.strip().strip('"').strip("'")
            
            # Validate response
            valid_gaps = ["None", "Minor", "Moderate", "Major"]
            for gap in valid_gaps:
                if gap.lower() in result.lower():
                    return gap
            return "Moderate"  # Default
        except Exception as e:
            logger.error(f"Experience gap error: {e}")
            return "Unknown"

    def _calculate_experience_score(self, experience_gap: str) -> float:
        """Convert experience gap to numerical score"""
        gap_scores = {"None": 100, "Minor": 75, "Moderate": 50, "Major": 25}
        return gap_scores.get(experience_gap, 50)

    def _calculate_keyword_score(self, resume_text: str, job_description: str) -> float:
        """Calculate role-specific keyword match"""
        keywords = {
            "senior": ["senior", "lead", "principal", "staff"],
            "mid": ["engineer", "developer", "specialist"],
            "keywords": ["api", "rest", "microservices", "docker", "kubernetes"],
        }

        resume_lower = resume_text.lower()
        job_lower = job_description.lower()

        matches = 0
        total = 0

        for category, terms in keywords.items():
            for term in terms:
                total += 1
                if term in job_lower and term in resume_lower:
                    matches += 1

        return (matches / total * 100) if total > 0 else 50
