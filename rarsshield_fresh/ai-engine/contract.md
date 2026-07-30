# RARS Shield — AI Engine API Contract

Shared response schema across all three modes. Racheal implements these
three endpoints in Node.js/Express, calling Ollama Cloud with the same
prompts/system message defined in prompts.py / prompt_builder.py.

## Shared response fields (always present)
{
  "risk_score": <integer 0-100>,
  "confidence": <integer 0-100>,
  "detected_patterns": [<string>, ...],
  "explanation": "<1-3 plain-language sentences>",
  "verdict": "Likely Scam" | "Suspicious" | "Likely Safe"
}

Verdict thresholds:
- risk_score >= 70 -> "Likely Scam"
- 30-69            -> "Suspicious"
- risk_score <= 29 -> "Likely Safe"

---

## Endpoint 1 — POST /api/analyze/message
Communication analysis (SMS, WhatsApp, call transcript, email, link).

### Request
{
  "channel": "SMS",
  "sender": "+234-812-000-0000",
  "content": "Dear customer your GTBank account has been suspended..."
}

### Response
Shared schema only — no extra fields.

---

## Endpoint 2 — POST /api/analyze/recipient
Pre-transaction recipient/account check using BMONI sandbox data.
LLM-only (no ML model backing this endpoint).

### Request
{
  "recipient_name": "John Adekunle",
  "account_status": "active",
  "account_age_days": 3,
  "transaction_history_summary": "No prior transactions",
  "red_flag_markers": ["very_new_account"]
}

### Response
Shared schema only — no extra fields.

---

## Endpoint 3 — POST /api/analyze/transaction
Hybrid ML+LLM scoring, run when money is actually about to move.

### Request
{
  "amount": 850000,
  "oldbalanceOrg": 900000,
  "newbalanceOrig": 50000,
  "oldbalanceDest": 2000,
  "newbalanceDest": 500,
  "is_new_device": true,
  "is_new_recipient": true,
  "is_unusual_location": true,
  "tx_type": "TRANSFER",
  "narrative_context": "Account received a scam SMS 4 minutes before this transfer."
}

### Response
Shared schema PLUS one extra debug/audit field:
{
  ...shared fields...,
  "ml_signal": {
    "fraud_probability": 0.812,
    "flagged_signals": ["is_new_device", "is_new_recipient", "high_risk_tx_type"],
    "llm_adjustment_applied": 3.2
  }
}
`ml_signal` is for logs/audit only — do NOT build UI around it, it won't
appear on the other two endpoints.

---

## Notes for frontend
- `detected_patterns` vocabulary differs by mode (message mode: "urgency",
  "suspicious_link"; transaction mode: "is_new_device", "high_risk_tx_type").
  Use one label-mapping dictionary covering all three vocabularies.
- All three endpoints return the same 5 core fields — safe to build one
  shared Alert Details renderer around risk_score/confidence/detected_patterns/
  explanation/verdict.