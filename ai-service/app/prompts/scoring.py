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
TASK: Analyze the resume and compare skills to the job description.

=== RESUME TEXT ===
{resume_text}
=== END RESUME ===

=== JOB DESCRIPTION ===
{job_description}
=== END JOB ===

=== ADDITIONAL REQUIREMENTS ===
{job_requirements}
=== END REQUIREMENTS ===

SKILL MATCHING RULES:
1. Match skills that appear in BOTH resume AND job description
2. Treat these as EQUIVALENT matches (case-insensitive):
   - "TypeScript" = "TS" = "typescript"
   - "JavaScript" = "JS" = "javascript" 
   - "Node.js" = "NodeJS" = "Node"
   - "React.js" = "ReactJS" = "React"
   - "Next.js" = "NextJS" = "Next"
   - "NestJS" = "Nest.js" = "Nest"
   - "Express.js" = "ExpressJS" = "Express"
   - "PostgreSQL" = "Postgres" = "psql"
   - "MongoDB" = "Mongo"
   - "Prisma" = "PrismaORM" = "Prisma ORM"
   - "Docker" = "Containerization"
   - "Kubernetes" = "K8s"
   - "Amazon Web Services" = "AWS"
   - "Google Cloud Platform" = "GCP"
   - "Microsoft Azure" = "Azure"
   - "CI/CD" = "CICD" = "Continuous Integration"
   - "REST API" = "RESTful" = "REST"
   - "GraphQL" = "GQL"
   - "Python" = "py"
   - "Java" = "JDK"
   - "C++" = "CPP"
   - "C#" = "CSharp" = "dotnet" = ".NET"
3. If resume has a skill AND job requires it (or equivalent), it's a MATCH
4. Be generous - partial word matches count (e.g., "TypeScript developer" matches "TypeScript")

REQUIRED OUTPUT FORMAT (valid JSON only):
{{
  "matched_skills": ["skill1", "skill2", "skill3"],
  "missing_skills": ["skill required by job but NOT in resume"],
  "skill_overlap_percentage": <number 0-100>,
  "experience_gap": "<None|Minor|Moderate|Major>",
  "summary": "<one sentence about the match quality>"
}}

CRITICAL:
- matched_skills: List ALL skills from resume that match job requirements
- skill_overlap_percentage: (matched skills count / total required skills) * 100
- Return ONLY valid JSON, no markdown code blocks
"""


def get_scoring_prompt(resume_text: str, job_description: str, job_requirements: str = "") -> str:
    """
    Generate scoring prompt for LLM
    """
    return SCORING_PROMPT_TEMPLATE.format(
        resume_text=resume_text[:3000],  # Increased limit for better context
        job_description=job_description[:2000],
        job_requirements=job_requirements[:1000] or "No additional requirements provided",
    )
