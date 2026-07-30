"""RARS Shield — AI Engine API (v2, current architecture)"""

from typing import List, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from llm_scorer import analyze_content
from hybrid_scorer import score_transaction, score_recipient
from ml_features import TransactionFeatures, TX_TYPES

app = FastAPI(title="RARS Shield AI Engine")


# ---------- Endpoint 1: Communication analysis (LLM only) ----------
class MessageRequest(BaseModel):
    channel: str
    sender: str
    content: str


@app.post("/api/analyze/message")
def analyze_message_endpoint(req: MessageRequest):
    return analyze_content(req.channel, req.sender, req.content)


# ---------- Endpoint 2: Recipient check (hybrid ML + LLM) ----------
class RecipientRequest(BaseModel):
    recipient_name: str
    account_status: str
    account_age_days: int
    transaction_history_summary: str
    red_flag_markers: Optional[List[str]] = None


@app.post("/api/analyze/recipient")
def analyze_recipient_endpoint(req: RecipientRequest):
    return score_recipient(
        req.recipient_name,
        req.account_status,
        req.account_age_days,
        req.transaction_history_summary,
        req.red_flag_markers,
    )


# ---------- Endpoint 3: Transaction scoring (hybrid ML + LLM) ----------
class TransactionRequest(BaseModel):
    amount: float
    oldbalanceOrg: float
    newbalanceOrig: float
    oldbalanceDest: float
    newbalanceDest: float
    is_new_device: bool
    is_new_recipient: bool
    is_unusual_location: bool
    tx_type: str
    narrative_context: Optional[str] = None


@app.post("/api/analyze/transaction")
def analyze_transaction_endpoint(req: TransactionRequest):
    if req.tx_type not in TX_TYPES:
        raise HTTPException(400, f"tx_type must be one of {TX_TYPES}")

    tx = TransactionFeatures(
        amount=req.amount,
        oldbalanceOrg=req.oldbalanceOrg,
        newbalanceOrig=req.newbalanceOrig,
        oldbalanceDest=req.oldbalanceDest,
        newbalanceDest=req.newbalanceDest,
        is_new_device=req.is_new_device,
        is_new_recipient=req.is_new_recipient,
        is_unusual_location=req.is_unusual_location,
        tx_type=req.tx_type,
    )
    return score_transaction(tx, narrative_context=req.narrative_context)


@app.get("/")
def health_check():
    return {"status": "RARS Shield AI Engine is running"}