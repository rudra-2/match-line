"""
Utility functions for text processing and validation
"""

import re
import json
from typing import Optional


def clean_text(text: str) -> str:
    """
    Clean and normalize text for processing
    - Remove extra whitespace
    - Remove special characters where appropriate
    - Convert to lowercase for processing
    """
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()

    # Remove URLs
    text = re.sub(r'http\S+', '', text)

    # Keep alphanumeric, spaces, and basic punctuation
    text = re.sub(r'[^\w\s.,\-+#]', '', text)

    return text


def extract_text_chunk(text: str, max_chars: int = 3000) -> str:
    """
    Extract and limit text to manageable chunks for LLM
    Ensures we don't exceed token limits
    """
    if not text:
        return ""

    if len(text) > max_chars:
        return text[:max_chars] + "..."

    return text


def parse_json_response(response_text: str) -> Optional[dict]:
    """
    Safely parse JSON from LLM response
    Handles cases where model includes markdown or extra text
    """
    try:
        # Try direct parsing first
        return json.loads(response_text)
    except json.JSONDecodeError:
        # Try to extract JSON from markdown code blocks
        json_match = re.search(r'```(?:json)?\s*([\s\S]*?)```', response_text)
        if json_match:
            try:
                return json.loads(json_match.group(1))
            except json.JSONDecodeError:
                pass

        # Try to find JSON object in the text
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            try:
                return json.loads(json_match.group(0))
            except json.JSONDecodeError:
                pass

    return None


def validate_score_response(data: dict) -> bool:
    """
    Validate scoring response has required fields
    """
    required_fields = [
        "matched_skills",
        "missing_skills",
        "experience_gap",
        "skill_overlap_percentage",  # This is what the LLM prompt asks for
        "summary",
    ]

    return all(field in data for field in required_fields)
