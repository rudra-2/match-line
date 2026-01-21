# Match-Line: AI-Powered Resume-JD Matching Platform

> A production-grade, microservice-based resume-job description matching system using artificial intelligence and semantic embeddings. Built with NestJS, Python FastAPI, and PostgreSQL.

## Overview

Match-Line is a realistic Applicant Tracking System (ATS) solution that replicates how modern talent platforms evaluate and rank candidates. The system is architected using microservices to separate business logic from AI operations:

- **NestJS Backend**: REST APIs, business logic, and database orchestration
- **Python FastAPI Service**: LLM-based scoring, embeddings, and semantic analysis
- **PostgreSQL Database**: Persistent storage for resumes, job descriptions, and match results

### Core Capabilities

- Resume text ingestion and storage
- Job description management with requirements tracking
- AI-powered intelligent resume-to-job matching
- Semantic similarity analysis using embeddings
- Flexible LLM provider support (OpenAI, Ollama, custom APIs)
- Production-ready error handling, logging, and validation
- Docker containerization for deployment

---

## System Architecture

```
Client Layer (Postman, cURL, Web Applications)
           |
           | HTTP REST
           v
NestJS Backend Service (Port 3000)
  - POST /resumes/upload       (Store resume text)
  - POST /jobs/create          (Create job posting)
  - POST /match/score          (Trigger AI scoring)
  - GET  /health               (Status verification)
           |
           | HTTP POST to /score
           v
Python FastAPI AI Service (Port 8000)
  - LLM Scoring (GPT-4, Llama3.1, Mistral, etc.)
  - Embeddings (OpenAI, Ollama, Local Models)
  - Skill Extraction & Semantic Analysis
           |
           | Query & Persist
           v
PostgreSQL Database
  - Resumes Table      | Jobs Table        | Matches Table
  - Embeddings Table   | Scores Table      | History Logs
```

---

## Getting Started

### Prerequisites

The following components are required:
- Node.js 18 or higher
- Python 3.11 or higher
- PostgreSQL 15 or higher
- Ollama (free) or OpenAI API Key (paid)

### Installation Steps

**Step 1: Clone and Install Dependencies**

```bash
git clone https://github.com/yourusername/match-line.git
cd match-line

cd backend
npm install

cd ../ai-service
pip install -r requirements.txt
```

**Step 2: Environment Configuration**

Backend configuration (backend/.env):
```bash
NODE_ENV=development
SERVER_PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/match_line_db
AI_SERVICE_URL=http://localhost:8000
CORS_ORIGIN=http://localhost:3000
```

AI Service configuration (ai-service/.env):
```bash
# Using Ollama (free, recommended for development)
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1

EMBEDDING_PROVIDER=ollama
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
PORT=8000
DEBUG=True
```

**Step 3: Initial Setup (Ollama)**

```bash
# Download and install Ollama from https://ollama.ai
# After installation, pull required models:
ollama pull llama3.1
ollama pull nomic-embed-text
# Ollama will run on http://localhost:11434
```

**Step 4: Start All Services**

Terminal 1 - Start Database:
```bash
docker-compose up postgres
```

Terminal 2 - Start AI Service:
```bash
cd ai-service
python main.py
# Service running on http://localhost:8000
```

Terminal 3 - Start Backend:
```bash
cd backend
npm run start:dev
# Service running on http://localhost:3000
```

Terminal 4 - Initialize Database (one-time):
```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

### Testing the API

Health check:
```bash
curl http://localhost:3000/health
```

Create a job posting:
```bash
curl -X POST http://localhost:3000/jobs/create \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Backend Engineer",
    "description": "Seeking experienced backend engineer with proven expertise in distributed systems and modern web technologies",
    "requirements": "Node.js, PostgreSQL, Docker, AWS, System Design"
  }'
```

Upload a resume:
```bash
curl -X POST http://localhost:3000/resumes/upload \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "john_doe_resume.pdf",
    "rawText": "Senior Backend Developer with 5 years of professional experience in Node.js and distributed systems architecture..."
  }'
```

Score a resume against a job (replace IDs from above responses):
```bash
curl -X POST http://localhost:3000/match/score \
  -H "Content-Type: application/json" \
  -d '{
    "resumeId": "YOUR_RESUME_ID",
    "jobId": "YOUR_JOB_ID"
  }'
```

---

## Scoring Methodology

### Scoring Formula

The match score is calculated using a weighted combination of four components:

```
Match Score = (40% x Skills Overlap) + (30% x Semantic Similarity) 
            + (20% x Experience Alignment) + (10% x Role Keywords)
```

### Component Breakdown

| Component | Weight | Description | Method |
|-----------|--------|-------------|--------|
| Skills Overlap | 40% | Percentage of required skills found in resume | LLM extraction + comparison |
| Semantic Similarity | 30% | Contextual relevance between resume and job | Vector embeddings + cosine similarity |
| Experience Alignment | 20% | Years, seniority level, and domain match | LLM-based assessment (None=100, Minor=75, Moderate=50, Major=25) |
| Role Keywords | 10% | Presence of role-specific terminology | Rule-based pattern matching |

### Design Rationale

The hybrid approach combining Large Language Models and embeddings provides:
- Context awareness: LLM understands implicit skills and domain knowledge
- Cost efficiency: Local embeddings reduce API costs by up to 80%
- Resilience: Fallback to keyword matching if LLM service becomes unavailable
- Determinism: Low temperature (0.3) ensures consistent scoring across identical inputs

---

## API Reference

### Health Check Endpoint

```http
GET /health HTTP/1.1
Host: localhost:3000
```

Response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "service": "Match-Line Backend",
  "timestamp": "2024-01-21T10:30:00Z"
}
```

### Resume Management

**Upload Resume:**
```http
POST /resumes/upload HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "fileName": "john_doe.pdf",
  "rawText": "Professional resume text content...",
  "processedText": "Optional: cleaned and normalized text"
}
```

Response (201 Created):
```json
{
  "id": "clnx4z2k3j0001ox8q9t4z2k1",
  "fileName": "john_doe.pdf",
  "uploadedAt": "2024-01-21T10:30:00Z",
  "updatedAt": "2024-01-21T10:30:00Z"
}
```

**Retrieve Resume:**
```http
GET /resumes/{id} HTTP/1.1
Host: localhost:3000
```

**List All Resumes:**
```http
GET /resumes HTTP/1.1
Host: localhost:3000
```

**Delete Resume:**
```http
DELETE /resumes/{id} HTTP/1.1
Host: localhost:3000
```

### Job Management

**Create Job:**
```http
POST /jobs/create HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "title": "Senior Backend Engineer",
  "description": "Job description text...",
  "requirements": "Required skills and qualifications..."
}
```

Response (201 Created):
```json
{
  "id": "clnx4z2k3j0002ox8q9t4z2k2",
  "title": "Senior Backend Engineer",
  "description": "...",
  "requirements": "...",
  "createdAt": "2024-01-21T10:30:00Z"
}
```

**Retrieve Job:**
```http
GET /jobs/{id} HTTP/1.1
Host: localhost:3000
```

**List All Jobs:**
```http
GET /jobs HTTP/1.1
Host: localhost:3000
```

**Delete Job:**
```http
DELETE /jobs/{id} HTTP/1.1
Host: localhost:3000
```

### Matching and Scoring

**Score Resume Against Job:**
```http
POST /match/score HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "resumeId": "clnx4z2k3j0001ox8q9t4z2k1",
  "jobId": "clnx4z2k3j0002ox8q9t4z2k2"
}
```

Response (201 Created):
```json
{
  "id": "clnx4z2k3j0003ox8q9t4z2k3",
  "resumeId": "clnx4z2k3j0001ox8q9t4z2k1",
  "jobId": "clnx4z2k3j0002ox8q9t4z2k2",
  "matchScore": 82.5,
  "matchedSkills": ["Node.js", "PostgreSQL", "Docker", "REST APIs"],
  "missingSkills": ["Kubernetes", "System Design"],
  "experienceGap": "Minor",
  "summary": "Strong alignment with core backend requirements. Missing advanced DevOps skills.",
  "scoredAt": "2024-01-21T10:30:00Z"
}
```

**Retrieve Match Result:**
```http
GET /match/{id} HTTP/1.1
Host: localhost:3000
```

**List Matches with Filtering:**
```http
GET /match?resumeId={id}&jobId={id} HTTP/1.1
Host: localhost:3000
```

---

## Project Structure

```
match-line/
├── backend/                          NestJS Backend Service
│   ├── src/
│   │   ├── app.module.ts
│   │   ├── main.ts
│   │   ├── common/
│   │   │   ├── prisma/
│   │   │   ├── ai-client/
│   │   │   └── dto/
│   │   ├── resumes/
│   │   ├── jobs/
│   │   ├── match/
│   │   └── health/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   └── tsconfig.json
│
├── ai-service/                       Python FastAPI Service
│   ├── app/
│   │   ├── config/
│   │   ├── core/
│   │   ├── api/
│   │   ├── schemas/
│   │   ├── prompts/
│   │   └── utils/
│   ├── main.py
│   ├── requirements.txt
│   └── .env.example
│
├── docs/
│   ├── OLLAMA_SETUP.md
│   ├── API_EXAMPLES.md
│   └── ARCHITECTURE.md
│
├── docker-compose.yml
├── LICENSE
└── README.md
```

---

## LLM Provider Configuration

### Ollama (Free, Recommended for Development)

```bash
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1

EMBEDDING_PROVIDER=ollama
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
```

Benefits: No costs, runs locally, good quality, fast iteration

### OpenAI (Paid, Production Quality)

```bash
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4-turbo

EMBEDDING_PROVIDER=openai
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

Benefits: Highest quality, well-documented, enterprise support

### Mixed Configuration (Cost-Optimized)

```bash
LLM_PROVIDER=ollama
EMBEDDING_PROVIDER=openai
OPENAI_API_KEY=sk-your-key-here
```

For detailed setup instructions, see [OLLAMA_SETUP.md](docs/OLLAMA_SETUP.md)

---

## Docker Deployment

### Quick Start with Docker Compose

```bash
docker-compose up
```

This starts:
- PostgreSQL database (port 5432)
- Backend service (port 3000) - optional, uncomment in docker-compose.yml
- AI service (port 8000) - optional, uncomment in docker-compose.yml

### Production Deployment

Build containerized images:
```bash
docker build -t match-line-backend:latest ./backend
docker build -t match-line-ai:latest ./ai-service
```

Deploy on Kubernetes:
```bash
kubectl apply -f k8s-manifests/
```

---

## Testing

### Backend Unit Tests

```bash
cd backend
npm test
npm run test:cov
```

### AI Service Unit Tests

```bash
cd ai-service
pytest tests/ -v
pytest tests/ --cov=app
```

---

## Performance Optimization

### Identified Bottlenecks and Solutions

| Bottleneck | Recommended Solution | Expected Improvement |
|-----------|-------------------|---------------------|
| LLM API latency | Result caching, batch processing | 60% latency reduction |
| Embedding generation cost | Local embeddings (Ollama/Sentence Transformers) | 80% cost reduction |
| Database query performance | Strategic indexing, connection pooling | 40% query time reduction |
| Large document processing | Text chunking, incremental processing | 50% memory reduction |

### Scaling Strategies

- Horizontal scaling: Deploy multiple NestJS backend instances behind load balancer
- Asynchronous processing: Use task queues (Celery, RQ) for scoring operations
- Caching layer: Redis for frequently scored resume-job pairs
- Database optimization: Partition match records by date, archive historical data

---

## Security Considerations

### Environment Variables
- Never commit .env files to version control
- Use secret management systems (AWS Secrets Manager, HashiCorp Vault)
- Rotate API keys on a regular schedule
- Restrict access to sensitive configuration

### API Security
- Implement authentication (JWT, OAuth2) for endpoints
- Add rate limiting, especially on scoring endpoint
- Validate and sanitize file uploads
- Implement input validation and sanitization

### Database Security
- Use strong, randomly generated PostgreSQL passwords
- Enable SSL/TLS for all database connections
- Maintain regular automated backups
- Apply least privilege principle to database users

---

## Troubleshooting

### Ollama Connection Issues

Problem: "Ollama not accessible at http://localhost:11434"

Solution:
```bash
# Verify Ollama is running
curl http://localhost:11434/api/tags

# Start Ollama service
ollama serve

# Pull required models
ollama pull llama3.1
ollama pull nomic-embed-text
```

### Out of Memory Errors

Problem: LLM model exceeds available system memory

Solution: Use a smaller model
```bash
OLLAMA_MODEL=phi3          # 2.3 GB RAM
```

### Slow Scoring Performance

Problem: Scoring requests taking too long

Solution: 
```bash
EMBEDDING_PROVIDER=local
# Or reduce model precision
LLM_TEMPERATURE=0.5
```

---

## Resources and References

- NestJS Documentation: https://docs.nestjs.com
- FastAPI Guide: https://fastapi.tiangolo.com
- Prisma ORM: https://www.prisma.io/docs
- Ollama Model Library: https://ollama.ai/library
- OpenAI API Reference: https://platform.openai.com/docs
- PostgreSQL Documentation: https://www.postgresql.org/docs

---

## Contributing Guidelines

Contributions are welcome. Please follow this process:

1. Fork the repository
2. Create a feature branch (git checkout -b feature/your-feature-name)
3. Commit changes with descriptive messages (git commit -m 'feat: description')
4. Push to your branch (git push origin feature/your-feature-name)
5. Open a Pull Request with detailed description

---

## License

This project is licensed under the MIT License. See LICENSE file for details.

---

## Support and Contact

For issues, questions, or discussions:
- Issues: https://github.com/yourusername/match-line/issues
- Discussions: https://github.com/yourusername/match-line/discussions
- Email: support@match-line.dev

---

## Project Credits

Match-Line is developed as a production-grade internship and hiring platform with emphasis on realistic ATS workflows and enterprise-level code quality. Built with professional engineering practices and commitment to clean code architecture.

**Created by:** Rudra Patel
**Email:** 02rudrapatel@gmail.com   
**GitHub:** https://github.com/rudra-2
**LinkedIn:** https://linkedin.com/in/Rudra20
**Website:** https://rudraa.me
