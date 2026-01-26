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
TASK: Analyze the resume below and compare it to the job description. Extract ONLY the skills that ACTUALLY appear in the resume text.

=== RESUME TEXT (analyze this carefully) ===
{resume_text}
=== END RESUME ===

=== JOB DESCRIPTION ===
{job_description}
=== END JOB ===

=== ADDITIONAL REQUIREMENTS ===
{job_requirements}
=== END REQUIREMENTS ===

INSTRUCTIONS:
1. READ the resume text above carefully
2. Extract ONLY skills that are EXPLICITLY mentioned in the resume
3. Compare these to skills required in the job description
4. DO NOT invent skills that are not in the resume
5. DO NOT use example skills from this prompt

REQUIRED OUTPUT FORMAT (JSON only, no other text):
{{
  "matched_skills": ["actual skill from resume that matches job requirement"],
  "missing_skills": ["skill required by job but NOT in resume"],
  "skill_overlap_percentage": <number 0-100 based on actual overlap>,
  "experience_gap": "<None|Minor|Moderate|Major>",
  "summary": "<one sentence explaining the match>"
}}

CRITICAL RULES:
- matched_skills: ONLY include skills that appear in BOTH the resume AND job description
- missing_skills: Skills in job description that are NOT in the resume
- If resume says "Java, Node.js" - those are the ONLY matched skills (not TypeScript, not NestJS, etc.)
- experience_gap: "None", "Minor", "Moderate", or "Major"
- Return ONLY the JSON object, nothing else
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
