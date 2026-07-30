"""
RARS Shield — Prompt Builders

Two entry points, one per analysis mode. Both are plain string builders
with no I/O — test_harness.py (and Racheal's Node.js port, per
contract.md) are responsible for actually calling the LLM.
"""

from typing import List, Optional


def build_user_prompt(channel: str, sender: str, content: str) -> str:
    """Formats an incoming message/call for communication analysis."""
    return f"""Analyze this incoming communication for scam risk.

Channel: {channel}
Sender: {sender}
Content: \"\"\"{content}\"\"\"

Follow the COMMUNICATION ANALYSIS instructions and return the required JSON only."""


def build_recipient_check_prompt(
    recipient_name: str,
    account_status: str,
    account_age_days: int,
    transaction_history_summary: str,
    red_flag_markers: Optional[List[str]] = None,
    ml_fraud_probability: Optional[float] = None,
) -> str:
    """Formats a pre-transaction recipient check using BMONI sandbox data.
    ml_fraud_probability is optional — set when hybrid_scorer.score_recipient()
    has an RF prediction to hand over as a prior; omitted for the plain
    LLM-only path."""
    red_flag_markers = red_flag_markers or []
    markers_text = ", ".join(red_flag_markers) if red_flag_markers else "none reported"
    ml_text = (
        f"\nRandomForest fraud probability: {ml_fraud_probability:.2f} (0.0-1.0 scale) — "
        "treat this as a strong prior, adjust only with concrete reason from the fields above."
        if ml_fraud_probability is not None else ""
    )

    return f"""Analyze this transfer recipient for fraud risk BEFORE the transaction is approved.

Recipient name: {recipient_name}
Account status: {account_status}
Account age (days): {account_age_days}
Transaction history summary: {transaction_history_summary}
Red flag markers already detected: {markers_text}{ml_text}

Follow the RECIPIENT/ACCOUNT CHECK instructions and return the required JSON only."""


def build_transaction_prompt(
    ml_fraud_probability: float,
    flagged_signals: List[str],
    tx_type: str,
    amount: float,
    narrative_context: Optional[str] = None,
) -> str:
    """
    Formats the RF model's output for the transaction-scoring mode.
    """
    signals_text = ", ".join(flagged_signals) if flagged_signals else "none"
    context_text = narrative_context or "none provided"

    return f"""Analyze this transaction for fraud risk. A RandomForest model has \
already scored it — treat its probability as a strong prior and explain it, \
adjusting only if the extra context below gives concrete reason to.

ML fraud probability: {ml_fraud_probability:.2f} (0.0-1.0 scale)
Flagged input signals: {signals_text}
Transaction type: {tx_type}
Amount: {amount}
Additional narrative context: {context_text}

Follow the TRANSACTION SCORING instructions and return the required JSON only."""