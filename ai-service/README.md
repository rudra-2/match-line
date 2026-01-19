# AI Service - Clean Architecture

## Folder Structure

```
ai-service/
├── app/                           # Application package
│   ├── __init__.py
│   ├── api/                       # API routes and endpoints
│   │   ├── __init__.py
│   │   └── routes.py              # FastAPI routers
│   ├── config/                    # Configuration management
│   │   ├── __init__.py
│   │   └── settings.py            # Pydantic settings with multi-provider support
│   ├── core/                      # Core business logic
│   │   ├── __init__.py
│   │   ├── llm_client.py          # LLM abstraction layer (OpenAI, Ollama, custom)
│   │   ├── embeddings.py          # Embeddings service (multi-provider)
│   │   └── scoring.py             # Main scoring engine
│   ├── prompts/                   # LLM prompt templates
│   │   ├── __init__.py
│   │   └── scoring.py             # Scoring prompts
│   ├── schemas/                   # Pydantic request/response models
│   │   ├── __init__.py
│   │   └── score.py               # Score request/response DTOs
│   └── utils/                     # Utility functions
│       ├── __init__.py
│       └── text_processor.py      # Text processing and validation
├── main.py                        # FastAPI application entry point
├── requirements.txt               # Python dependencies
├── .env.example                   # Example environment variables
├── Dockerfile                     # Docker configuration
└── README.md                      # This file
```

## Architecture Overview

### Separation of Concerns

- **api/routes.py**: Pure API layer - request validation, response formatting
- **core/scoring.py**: Business logic - orchestrates LLM + embeddings
- **core/llm_client.py**: LLM provider abstraction - OpenAI, Ollama, or custom
- **core/embeddings.py**: Embeddings provider abstraction - flexible backend
- **config/settings.py**: Configuration management - environment variables
- **schemas/score.py**: Data validation - Pydantic models
- **utils/**: Helper functions - text processing, JSON parsing
- **prompts/**: Prompt engineering - LLM instructions

### Design Patterns

1. **Dependency Injection**: Services initialized in startup event
2. **Provider Pattern**: Switch LLM/embeddings via configuration
3. **Factory Pattern**: Automatic provider initialization in __init__
4. **Composition**: ScoringEngine composes LLMClient + EmbeddingsService

## Key Features

✅ **Multi-Provider LLM Support**
- OpenAI GPT-4, GPT-3.5
- Ollama (FREE, local) - llama3.1, mistral, phi3
- Custom OpenAI-compatible APIs (Groq, Together, LocalAI)

✅ **Multi-Provider Embeddings**
- OpenAI text-embedding-3-small
- Ollama nomic-embed-text (FREE)
- Local sentence-transformers (FREE, offline)

✅ **Deterministic Scoring**
- Weighted formula (40% skills + 30% semantic + 20% experience + 10% keywords)
- Low LLM temperature (0.3) for consistency
- Fallback mechanism if LLM unavailable

✅ **Production Ready**
- Clean code organization
- Type hints everywhere
- Comprehensive logging
- Error handling
- CORS middleware

## Running the Service

### Option 1: Ollama (FREE, Recommended)

```bash
# Install Ollama: https://ollama.ai
ollama pull llama3.1
ollama pull nomic-embed-text

# Create .env
cp .env.example .env

# Configure for Ollama
# LLM_PROVIDER=ollama
# EMBEDDING_PROVIDER=ollama

# Run service
pip install -r requirements.txt
python main.py
```

### Option 2: OpenAI

```bash
# Create .env
OPENAI_API_KEY=sk-...
LLM_PROVIDER=openai
EMBEDDING_PROVIDER=openai

python main.py
```

### Option 3: Mixed (Ollama LLM + OpenAI Embeddings)

```bash
LLM_PROVIDER=ollama
EMBEDDING_PROVIDER=openai
OPENAI_API_KEY=sk-...

python main.py
```

## API Documentation

### Endpoints

```
GET  /              - Service info
GET  /health        - Health check
POST /score         - Score resume vs job
GET  /docs          - Interactive API docs (Swagger)
```

### POST /score

```bash
curl -X POST http://localhost:8000/score \
  -H "Content-Type: application/json" \
  -d '{
    "resume_text": "Senior Backend Engineer with 5 years Node.js...",
    "job_description": "Looking for experienced backend developer...",
    "job_requirements": "Node.js, PostgreSQL, Docker"
  }'
```

Response:
```json
{
  "match_score": 82.5,
  "matched_skills": ["Node.js", "PostgreSQL", "Backend APIs"],
  "missing_skills": ["Kubernetes"],
  "experience_gap": "Minor",
  "summary": "Strong alignment with core requirements..."
}
```

## Development

### Add New Feature

1. Create module in appropriate package (core/api/utils)
2. Add imports to package `__init__.py`
3. Update routes if needed
4. Add tests
5. Update this README

### Switch Providers

Just change environment variables! No code changes needed.

```bash
# Was using OpenAI?
LLM_PROVIDER=openai

# Switch to Ollama
LLM_PROVIDER=ollama

# Switch to custom
LLM_PROVIDER=custom
CUSTOM_API_URL=https://api.groq.com/openai/v1
```

## Logging

All services log to console with timestamps and levels:

```
2024-01-21 10:30:45 - app.core.scoring - INFO - ✓ Scoring engine initialized
```

Configure via DEBUG environment variable:
- `DEBUG=True`: INFO level
- `DEBUG=False`: WARNING level

## Error Handling

- **Invalid input**: 400 Bad Request (Pydantic validation)
- **Service unavailable**: 503 Service Unavailable (LLM/embeddings down)
- **Processing error**: 500 Internal Server Error (with details)
- **Fallback**: Returns basic keyword-based scoring if LLM fails

## Performance Considerations

- Embeddings cached in ScoringEngine instance (no re-computation)
- Text limited to 4000 chars to avoid LLM context overflow
- Ollama (local) has ~500ms latency vs OpenAI (network)
- Local embeddings (sentence-transformers) fastest (~10ms)
