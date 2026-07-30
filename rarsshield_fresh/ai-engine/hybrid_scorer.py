"""
RARS Shield — Hybrid ML+LLM Scorer (Transactions + Recipients)
"""

import json
from typing import List, Optional

import joblib
import pandas as pd

from config import client, MODEL_NAME
from prompts import SYSTEM_PROMPT
from prompt_builder import build_transaction_prompt, build_recipient_check_prompt
from ml_features import FEATURE_COLUMNS, TX_TYPES, TransactionFeatures
from recipient_features import (
    FEATURE_COLUMNS as RECIPIENT_FEATURE_COLUMNS,
    RecipientFeatures,
)

MODEL_PATH = "rf_model.joblib"
RECIPIENT_MODEL_PATH = "rf_recipient_model.joblib"
ML_WEIGHT = 0.65
MAX_LLM_ADJUSTMENT = 15

_rf_model = None
_rf_recipient_model = None


def _load_model():
    global _rf_model
    if _rf_model is None:
        _rf_model = joblib.load(MODEL_PATH)
    return _rf_model


def _load_recipient_model():
    global _rf_recipient_model
    if _rf_recipient_model is None:
        _rf_recipient_model = joblib.load(RECIPIENT_MODEL_PATH)
    return _rf_recipient_model


def _flagged_signals(tx: TransactionFeatures) -> List[str]:
    signals = []
    if tx.is_new_device:
        signals.append("is_new_device")
    if tx.is_new_recipient:
        signals.append("is_new_recipient")
    if tx.is_unusual_location:
        signals.append("is_unusual_location")
    if tx.tx_type in ("TRANSFER", "CASH_OUT"):
        signals.append("high_risk_tx_type")
    return signals


def _verdict_from_score(score: int) -> str:
    if score >= 70:
        return "Likely Scam"
    if score >= 30:
        return "Suspicious"
    return "Likely Safe"


def score_transaction(tx: TransactionFeatures, narrative_context: Optional[str] = None) -> dict:
    rf = _load_model()

    row = pd.DataFrame([tx.to_row()])[FEATURE_COLUMNS]
    ml_probability = float(rf.predict_proba(row)[0, 1])
    flagged = _flagged_signals(tx)

    llm_response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": build_transaction_prompt(
                    ml_fraud_probability=ml_probability,
                    flagged_signals=flagged,
                    tx_type=tx.tx_type,
                    amount=tx.amount,
                    narrative_context=narrative_context,
                ),
            },
        ],
        response_format={"type": "json_object"},
        temperature=0.2,
    )
    llm_result = json.loads(llm_response.choices[0].message.content)

    ml_score = ml_probability * 100
    llm_score = llm_result.get("risk_score", ml_score)
    raw_adjustment = llm_score - ml_score
    capped_adjustment = max(-MAX_LLM_ADJUSTMENT, min(MAX_LLM_ADJUSTMENT, raw_adjustment))
    capped_llm_score = ml_score + capped_adjustment
    final_score = round(ML_WEIGHT * ml_score + (1 - ML_WEIGHT) * capped_llm_score)
    final_score = max(0, min(100, final_score))

    detected_patterns = sorted(set(flagged) | set(llm_result.get("detected_patterns", [])))

    return {
        "risk_score": final_score,
        "confidence": llm_result.get("confidence", 60),
        "detected_patterns": detected_patterns,
        "explanation": llm_result.get("explanation", ""),
        "verdict": _verdict_from_score(final_score),
        "ml_signal": {
            "fraud_probability": round(ml_probability, 3),
            "flagged_signals": flagged,
            "llm_adjustment_applied": round((1 - ML_WEIGHT) * capped_adjustment, 1),
        },
    }


def _flagged_recipient_signals(rf_features: RecipientFeatures) -> List[str]:
    signals = []
    if rf_features.account_status in ("dormant", "under_review", "suspended"):
        signals.append(f"status_{rf_features.account_status}")
    if rf_features.account_age_days <= 30:
        signals.append("very_new_account")
    for flag in (rf_features.red_flag_markers or []):
        if flag not in signals:        
            signals.append(flag)
    return signals

def score_recipient(
    recipient_name: str,
    account_status: str,
    account_age_days: int,
    transaction_history_summary: str,
    red_flag_markers: Optional[List[str]] = None,
) -> dict:
    rf = _load_recipient_model()

    rf_features = RecipientFeatures(
        account_status=account_status,
        account_age_days=account_age_days,
        red_flag_markers=red_flag_markers,
    )
    row = pd.DataFrame([rf_features.to_row()])[RECIPIENT_FEATURE_COLUMNS]
    ml_probability = float(rf.predict_proba(row)[0, 1])
    flagged = _flagged_recipient_signals(rf_features)

    llm_response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": build_recipient_check_prompt(
                    recipient_name=recipient_name,
                    account_status=account_status,
                    account_age_days=account_age_days,
                    transaction_history_summary=transaction_history_summary,
                    red_flag_markers=red_flag_markers,
                    ml_fraud_probability=ml_probability,
                ),
            },
        ],
        response_format={"type": "json_object"},
        temperature=0.2,
    )
    llm_result = json.loads(llm_response.choices[0].message.content)

    ml_score = ml_probability * 100
    llm_score = llm_result.get("risk_score", ml_score)
    raw_adjustment = llm_score - ml_score
    capped_adjustment = max(-MAX_LLM_ADJUSTMENT, min(MAX_LLM_ADJUSTMENT, raw_adjustment))
    capped_llm_score = ml_score + capped_adjustment
    final_score = round(ML_WEIGHT * ml_score + (1 - ML_WEIGHT) * capped_llm_score)
    final_score = max(0, min(100, final_score))

    detected_patterns = sorted(set(flagged) | set(llm_result.get("detected_patterns", [])))

    return {
        "risk_score": final_score,
        "confidence": llm_result.get("confidence", 60),
        "detected_patterns": detected_patterns,
        "explanation": llm_result.get("explanation", ""),
        "verdict": _verdict_from_score(final_score),
        "ml_signal": {
            "fraud_probability": round(ml_probability, 3),
            "flagged_signals": flagged,
            "llm_adjustment_applied": round((1 - ML_WEIGHT) * capped_adjustment, 1),
        },
    }


if __name__ == "__main__":
    print("=== Demo: risky transaction ===")
    risky = TransactionFeatures(
        amount=850_000,
        oldbalanceOrg=900_000,
        newbalanceOrig=50_000,
        oldbalanceDest=2_000,
        newbalanceDest=500,
        is_new_device=True,
        is_new_recipient=True,
        is_unusual_location=True,
        tx_type="TRANSFER",
    )
    result = score_transaction(
        risky,
        narrative_context="Account received a scam SMS impersonating GTBank 4 minutes before this transfer.",
    )
    print(json.dumps(result, indent=2))