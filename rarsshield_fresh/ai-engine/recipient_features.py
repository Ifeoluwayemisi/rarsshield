"""
RARS Shield — Recipient Feature Schema

Feature contract for the recipient-check RF model. Reads the output of
build_recipient_dataset.py (recipient_check_dataset.csv) and turns its
columns into a model-ready matrix.

account_status  -> one-hot encoded
account_age_days -> used directly
red_flag_markers -> multi-hot encoded (one column per known flag)
transaction_history_summary -> NOT fed to the model (free text) — it's
    still passed to the LLM for context, same as narrative_context is
    for transactions.
"""

from dataclasses import dataclass
from typing import List, Optional
import ast
import pandas as pd

ACCOUNT_STATUSES = ["active", "dormant", "under_review", "suspended"]

KNOWN_FLAGS = [
    "email_name_mismatch",
    "high_velocity_transfers",
    "device_fraud_history",
    "very_new_account",
    "foreign_request",
    "invalid_phone_on_file",
]

FEATURE_COLUMNS = (
    ["account_age_days"]
    + [f"status_{s}" for s in ACCOUNT_STATUSES]
    + [f"flag_{f}" for f in KNOWN_FLAGS]
)


@dataclass
class RecipientFeatures:
    account_status: str
    account_age_days: int
    red_flag_markers: Optional[List[str]] = None

    def to_row(self) -> dict:
        flags = self.red_flag_markers or []
        row = {"account_age_days": self.account_age_days}
        for s in ACCOUNT_STATUSES:
            row[f"status_{s}"] = int(self.account_status == s)
        for f in KNOWN_FLAGS:
            row[f"flag_{f}"] = int(f in flags)
        return row


def _parse_flags(value) -> list:
    """red_flag_markers is written to CSV as a Python list literal
    (e.g. "['very_new_account']") by build_recipient_dataset.py — this
    reads it back safely."""
    if isinstance(value, list):
        return value
    if pd.isna(value) or value == "":
        return []
    try:
        return ast.literal_eval(value)
    except (ValueError, SyntaxError):
        return []


def load_recipient_dataset(path: str) -> pd.DataFrame:
    """Loads recipient_check_dataset.csv and engineers it into a
    model-ready feature matrix + label column."""
    df = pd.read_csv(path)
    df["red_flag_markers"] = df["red_flag_markers"].apply(_parse_flags)

    rows = []
    for _, r in df.iterrows():
        feats = RecipientFeatures(
            account_status=r["account_status"],
            account_age_days=r["account_age_days"],
            red_flag_markers=r["red_flag_markers"],
        ).to_row()
        feats["is_fraud"] = r["is_fraud"]
        rows.append(feats)

    return pd.DataFrame(rows)[FEATURE_COLUMNS + ["is_fraud"]]
