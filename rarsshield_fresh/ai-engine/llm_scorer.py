"""
RARS Shield — LLM-only Scorers

Two functions, one per LLM-only analysis mode (no ML backing, unlike
hybrid_scorer.py's score_transaction). Both call the same Ollama Cloud
client and return the shared five-field schema from contract.md.
"""

import json
from typing import List, Optional

from config import client, MODEL_NAME
from prompts import SYSTEM_PROMPT
from prompt_builder import build_user_prompt, build_recipient_check_prompt


def analyze_content(channel: str, sender: str, content: str) -> dict:
    """Scores an incoming SMS/WhatsApp/call/email/link."""
    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": build_user_prompt(channel, sender, content)},
        ],
        response_format={"type": "json_object"},
        temperature=0.2,
    )
    return json.loads(response.choices[0].message.content)


def analyze_recipient(
    recipient_name: str,
    account_status: str,
    account_age_days: int,
    transaction_history_summary: str,
    red_flag_markers: Optional[List[str]] = None,
) -> dict:
    """Scores a transfer recipient BEFORE money is sent, using BMONI
    sandbox data. LLM-only — no trained model backs this yet."""
    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": build_recipient_check_prompt(
                    recipient_name,
                    account_status,
                    account_age_days,
                    transaction_history_summary,
                    red_flag_markers,
                ),
            },
        ],
        response_format={"type": "json_object"},
        temperature=0.2,
    )
    return json.loads(response.choices[0].message.content)
