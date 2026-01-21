"""
Prompt templates and engineering for LLM scoring
Control hallucinations and ensure deterministic outputs
"""


SCORING_SYSTEM_PROMPT = """
You are an expert ATS (Applicant Tracking System) recruiter evaluating resume-job fit.
Provide ONLY valid JSON response with no markdown, no explanations, no code blocks.
Your response must be parseable JSON.
"""

SCORING_PROMPT_TEMPLATE = """
RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

JOB REQUIREMENTS:
{job_requirements}

EVALUATION CRITERIA:
1. Extract all technical and soft skills from the resume
2. Extract all required skills from the job description
3. Calculate skill overlap percentage
4. Assess experience alignment (years, level, domain)
5. Provide match score using this formula:
   - Skill overlap: 40%
   - Semantic relevance: 30%
   - Experience level: 20%
   - Role keywords: 10%

OUTPUT JSON ONLY (no markdown, no explanation):
{{
  "matched_skills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "missing_skills": ["skill1", "skill2", "skill3"],
  "skill_overlap_percentage": 85,
  "experience_gap": "Minor",
  "match_score": 82,
  "summary": "Strong alignment with core backend requirements. Minor DevOps knowledge gap."
}}

RULES:
- experience_gap must be: "None", "Minor", "Moderate", or "Major"
- match_score must be between 0-100
- Return only JSON, no other text
"""


def get_scoring_prompt(resume_text: str, job_description: str, job_requirements: str = "") -> str:
    """
    Generate scoring prompt for LLM
    """
    return SCORING_PROMPT_TEMPLATE.format(
        resume_text=resume_text[:2000],  # Limit to avoid token explosion
        job_description=job_description[:2000],
        job_requirements=job_requirements[:1000] or "No additional requirements provided",
    )
