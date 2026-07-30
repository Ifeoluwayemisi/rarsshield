"""
RARS Shield — ML Feature Schema (Transaction Scoring)

This is the FEATURE CONTRACT for the RandomForest layer. It is a
different shape from the recipient-check schema in contract.md —
this plugs into a transaction-scoring flow (money actually moving),
not the pre-transaction recipient lookup.

IMPORTANT: `make_synthetic_training_data()` below is a PLACEHOLDER.
It generates PaySim-shaped data with hand-picked fraud rules so the
pipeline has something to train on end-to-end. Before this goes near
a real decision, swap it for the actual PaySim CSV (or BMONI's real
transaction history) — see train_ml_model.py.
"""

from dataclasses import dataclass, asdict
from typing import Optional
import numpy as np
import pandas as pd

# Transaction types, PaySim-style
TX_TYPES = ["CASH_OUT", "PAYMENT", "CASH_IN", "TRANSFER", "DEBIT"]

FEATURE_COLUMNS = [
    "amount",
    "oldbalanceOrg",
    "newbalanceOrig",
    "oldbalanceDest",
    "newbalanceDest",
    "is_new_device",
    "is_new_recipient",
    "is_unusual_location",
    "type_CASH_OUT",
    "type_PAYMENT",
    "type_CASH_IN",
    "type_TRANSFER",
    "type_DEBIT",
]


@dataclass
class TransactionFeatures:
    """One transaction, in the shape the RF model expects."""
    amount: float
    oldbalanceOrg: float
    newbalanceOrig: float
    oldbalanceDest: float
    newbalanceDest: float
    is_new_device: bool
    is_new_recipient: bool
    is_unusual_location: bool
    tx_type: str  # one of TX_TYPES

    def to_row(self) -> dict:
        row = {
            "amount": self.amount,
            "oldbalanceOrg": self.oldbalanceOrg,
            "newbalanceOrig": self.newbalanceOrig,
            "oldbalanceDest": self.oldbalanceDest,
            "newbalanceDest": self.newbalanceDest,
            "is_new_device": int(self.is_new_device),
            "is_new_recipient": int(self.is_new_recipient),
            "is_unusual_location": int(self.is_unusual_location),
        }
        for t in TX_TYPES:
            row[f"type_{t}"] = int(self.tx_type == t)
        return row


def make_synthetic_training_data(n: int = 20000, seed: int = 7) -> pd.DataFrame:
    """
    PLACEHOLDER generator. Mimics PaySim's shape and a few of its known
    fraud patterns (fraud concentrated in TRANSFER/CASH_OUT, destination
    balance draining to ~0, origin balance not matching the debit) plus
    the three device/recipient/location signals this product cares about.

    Replace with real PaySim (or BMONI transaction history) before
    training a model that will actually gate a transaction.
    """
    rng = np.random.default_rng(seed)
    rows = []

    for _ in range(n):
        tx_type = rng.choice(TX_TYPES, p=[0.30, 0.30, 0.10, 0.25, 0.05])
        is_new_device = rng.random() < 0.15
        is_new_recipient = rng.random() < 0.20
        is_unusual_location = rng.random() < 0.10

        # base "riskiness" latent score drives both the fraud label and
        # the numeric features, so the model has real signal to find
        risk_latent = (
            2.5 * is_new_device
            + 2.0 * is_new_recipient
            + 2.5 * is_unusual_location
            + (1.5 if tx_type in ("TRANSFER", "CASH_OUT") else 0)
        )
        is_fraud = rng.random() < (0.02 + 0.10 * (risk_latent / 8.5))

        if tx_type in ("TRANSFER", "CASH_OUT"):
            amount = rng.lognormal(mean=9.5 if is_fraud else 8.0, sigma=1.1)
        else:
            amount = rng.lognormal(mean=7.0, sigma=1.0)

        old_org = max(amount, rng.lognormal(mean=10, sigma=1.2))
        new_org = max(0.0, old_org - amount)

        old_dest = rng.lognormal(mean=8, sigma=1.5)
        if is_fraud and tx_type in ("TRANSFER", "CASH_OUT") and rng.random() < 0.7:
            # classic PaySim fraud tell: destination balance drained right after
            new_dest = rng.uniform(0, old_dest * 0.05)
        else:
            new_dest = old_dest + amount

        rows.append({
            **TransactionFeatures(
                amount=amount,
                oldbalanceOrg=old_org,
                newbalanceOrig=new_org,
                oldbalanceDest=old_dest,
                newbalanceDest=new_dest,
                is_new_device=is_new_device,
                is_new_recipient=is_new_recipient,
                is_unusual_location=is_unusual_location,
                tx_type=tx_type,
            ).to_row(),
            "is_fraud": int(is_fraud),
        })

    return pd.DataFrame(rows)[FEATURE_COLUMNS + ["is_fraud"]]
