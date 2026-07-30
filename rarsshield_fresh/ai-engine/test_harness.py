"""
RARS Shield -- Test Harness

Runs one live test call per mode, so you can confirm all three work
before restarting the API. Requires OLLAMA_API_KEY set (via .env or
export) and rf_model.joblib / rf_recipient_model.joblib present.
"""

import json

from llm_scorer import analyze_content
from hybrid_scorer import score_transaction, score_recipient
from ml_features import TransactionFeatures


def test_message():
    print("=== 1. Communication analysis ===")
    result = analyze_content(
        channel="SMS",
        sender="+234-812-000-0000",
        content="Dear customer your GTBank account has been suspended. "
                "Click http://gtb-secure-verify.com to reactivate immediately or lose access.",
    )
    print(json.dumps(result, indent=2))


def test_recipient():
    print("\n=== 2. Recipient check (hybrid ML+LLM) ===")
    result = score_recipient(
        recipient_name="John Adekunle",
        account_status="active",
        account_age_days=3,
        transaction_history_summary="No prior transactions",
        red_flag_markers=["very_new_account"],
    )
    print(json.dumps(result, indent=2))


def test_transaction():
    print("\n=== 3. Transaction scoring (hybrid ML+LLM) ===")
    tx = TransactionFeatures(
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
        tx,
        narrative_context="Account received a scam SMS impersonating GTBank 4 minutes before this transfer.",
    )
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    test_message()
    test_recipient()
    test_transaction()