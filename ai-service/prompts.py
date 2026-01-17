"""
Prompt templates and engineering for LLM scoring
Control hallucinations and ensure deterministic outputs
"""

SCORING_PROMPT = """
You are an expert ATS (Applicant Tracking System) recruiter evaluating resume-job fit.

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

JOB REQUIREMENTS:
{job_requirements}

Your task:
1. Extract all technical and soft skills from the resume
2. Extract all required skills from the job description and requirements
3. Calculate skill overlap percentage
4. Assess experience alignment and gaps
5. Provide a match score 0-100 based on this formula:
   - Skill overlap: 40%
   - Semantic relevance: 30%
   - Experience level alignment: 20%
   - Role-specific keywords: 10%

6. Identify top 5 matched skills
7. Identify top 5 missing critical skills
8. Rate experience gap: "None", "Minor", "Moderate", "Major"
9. Provide concise 2-sentence summary

RESPONSE FORMAT (JSON ONLY, NO MARKDOWN):
{{
  "matched_skills": ["skill1", "skill2", ...],
  "missing_skills": ["skill1", "skill2", ...],
  "skill_overlap_percentage": 85,
  "experience_gap": "Minor",
  "match_score": 82,
  "summary": "Strong backend expertise with all core requirements met..."
}}
"""


def get_scoring_prompt(resume_text: str, job_description: str, job_requirements: str = "") -> str:
    """
    Generate scoring prompt for LLM
    """
    return SCORING_PROMPT.format(
        resume_text=resume_text,
        job_description=job_description,
        job_requirements=job_requirements or "No additional requirements provided",
    )
