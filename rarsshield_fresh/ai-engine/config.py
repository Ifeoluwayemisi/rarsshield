"""
RARS Shield — AI Engine Config

Points the OpenAI SDK at Ollama Cloud's OpenAI-compatible endpoint
instead of OpenAI directly. Every other module imports `client` and
`MODEL_NAME` from here — never instantiate a second client elsewhere.
"""

import os
from openai import OpenAI
from dotenv import load_dotenv
load_dotenv(override=True)


client = OpenAI(
    base_url=os.getenv("OLLAMA_BASE_URL", "https://ollama.com/v1"),
    api_key=os.getenv("OLLAMA_API_KEY"),
)

MODEL_NAME = os.getenv("OLLAMA_MODEL", "nemotron-3-ultra")