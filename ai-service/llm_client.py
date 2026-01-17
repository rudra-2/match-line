"""
LLM Client abstraction layer
Supports: OpenAI, Ollama (FREE), and any OpenAI-compatible API
Allows easy switching between providers without code changes
"""

from typing import Dict, Optional
from settings import settings
import json


class LLMClient:
    """
    Universal LLM client supporting multiple providers
    
    Why Multiple Providers?
    ----------------------
    - Development: Use free Ollama locally (no API costs)
    - Production: Switch to OpenAI for better quality
    - Cost optimization: Use cheaper alternatives (Groq, Together AI)
    - No vendor lock-in: Easy migration between providers
    
    Supported Providers:
    -------------------
    1. OpenAI: Best quality, requires API key ($$$)
    2. Ollama: FREE, runs locally (llama3.1, mistral, etc.)
    3. Custom: Any OpenAI-compatible API (Groq, Together, LocalAI)
    """

    def __init__(self):
        self.provider = settings.LLM_PROVIDER
        self.temperature = settings.LLM_TEMPERATURE
        self.max_tokens = settings.LLM_MAX_TOKENS
        self.timeout = settings.LLM_TIMEOUT

        if self.provider == "openai":
            self._init_openai()
        elif self.provider == "ollama":
            self._init_ollama()
        elif self.provider == "custom":
            self._init_custom()
        else:
            raise ValueError(f"Unknown LLM provider: {self.provider}")

    def _init_openai(self):
        """Initialize OpenAI client"""
        if not settings.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY required for OpenAI provider")
        
        from openai import OpenAI
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL
        print(f"✓ Using OpenAI LLM: {self.model}")

    def _init_ollama(self):
        """Initialize Ollama client (FREE, local)"""
        import requests
        
        self.model = settings.OLLAMA_MODEL
        self.base_url = settings.OLLAMA_BASE_URL
        
        # Test Ollama connection
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            if response.status_code != 200:
                raise ConnectionError("Ollama not running")
            
            # Check if model is available
            models = response.json().get("models", [])
            model_names = [m.get("name", "").split(":")[0] for m in models]
            
            if self.model not in model_names:
                print(f"⚠ Model '{self.model}' not found. Run: ollama pull {self.model}")
            
            print(f"✓ Using Ollama LLM: {self.model} (FREE, local)")
        except Exception as e:
            raise ConnectionError(
                f"Ollama not accessible at {self.base_url}. "
                f"Install: https://ollama.ai, then run: ollama pull {self.model}"
            ) from e

    def _init_custom(self):
        """Initialize custom OpenAI-compatible API"""
        if not settings.CUSTOM_API_URL:
            raise ValueError("CUSTOM_API_URL required for custom provider")
        
        from openai import OpenAI
        self.client = OpenAI(
            api_key=settings.CUSTOM_API_KEY or "dummy",
            base_url=settings.CUSTOM_API_URL
        )
        self.model = settings.OPENAI_MODEL
        print(f"✓ Using custom LLM API: {settings.CUSTOM_API_URL}")

    def generate(self, prompt: str) -> str:
        """
        Generate completion from LLM
        Returns: Text response
        """
        if self.provider == "openai" or self.provider == "custom":
            return self._generate_openai(prompt)
        elif self.provider == "ollama":
            return self._generate_ollama(prompt)

    def _generate_openai(self, prompt: str) -> str:
        """Generate using OpenAI or compatible API"""
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            temperature=self.temperature,
            max_tokens=self.max_tokens,
        )
        return response.choices[0].message.content

    def _generate_ollama(self, prompt: str) -> str:
        """Generate using Ollama (FREE)"""
        import requests
        
        response = requests.post(
            f"{self.base_url}/api/generate",
            json={
                "model": self.model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": self.temperature,
                    "num_predict": self.max_tokens,
                }
            },
            timeout=self.timeout
        )
        
        if response.status_code != 200:
            raise RuntimeError(f"Ollama generation failed: {response.text}")
        
        return response.json()["response"]

    def generate_json(self, prompt: str) -> Dict:
        """
        Generate JSON response from LLM
        Attempts to parse JSON from response
        """
        response = self.generate(prompt)
        
        # Try to extract JSON from markdown code blocks
        if "```json" in response:
            response = response.split("```json")[1].split("```")[0].strip()
        elif "```" in response:
            response = response.split("```")[1].split("```")[0].strip()
        
        # Remove any leading/trailing whitespace
        response = response.strip()
        
        try:
            return json.loads(response)
        except json.JSONDecodeError as e:
            # Attempt to fix common JSON issues
            try:
                # Remove potential markdown or extra text
                start = response.find("{")
                end = response.rfind("}") + 1
                if start != -1 and end > start:
                    clean_json = response[start:end]
                    return json.loads(clean_json)
            except:
                pass
            
            raise ValueError(f"Failed to parse JSON response: {e}\nResponse: {response}")
