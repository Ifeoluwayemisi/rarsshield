"""
RARS Shield — Recipient-Check Dataset Builder

Produces a CSV matching the ai-engine recipient-check schema:
    account_status, account_age_days, transaction_history_summary,
    red_flag_markers, is_fraud   (is_fraud is the label, for training/eval only)

Two modes:

1. REAL DATA MODE (recommended if you have time)
   Download the Bank Account Fraud (BAF) Dataset Suite (NeurIPS 2022)
   from Kaggle:
       https://www.kaggle.com/datasets/sgpjesus/bank-account-fraud-dataset-neurips-2022
   It's the closest public real-world match: it scores *account
   trustworthiness*, not just transactions, using fields like
   bank_months_count (account age), velocity_24h/4w (transfer velocity),
   name_email_similarity, device_fraud_count, credit_risk_score, and a
   fraud_bool label. License: CC BY-NC-ND 4.0 (academic/non-commercial —
   fine for a hackathon demo, don't ship it commercially as-is).

   Pick any one variant CSV (e.g. "Base.csv" or "Variant I.csv"), place
   it at DATA_PATH below, and run this script normally — it will map
   BAF's real columns into our schema.

2. SYNTHETIC FALLBACK MODE (works right now, no download needed)
   If DATA_PATH doesn't exist, this script generates a synthetic
   dataset with the same shape and similar fraud prevalence (~1.1%,
   matching BAF's real-world ratio) so you're not blocked today.

Run:
    pip install pandas numpy --break-system-packages
    python3 build_recipient_dataset.py
"""

import os
import numpy as np
import pandas as pd

DATA_PATH = "Base.csv"          # put a downloaded BAF variant here if you have it
OUTPUT_PATH = "recipient_check_dataset.csv"
N_SYNTHETIC_ROWS = 20000
FRAUD_PREVALENCE = 0.011        # matches BAF's real-world ~1.1%
RANDOM_SEED = 42


def _account_status(row) -> str:
    """Derived from real account signals only — NEVER from fraud_bool.
    This is what makes it a legitimate, non-leaking feature."""
    if row["bank_months_count"] <= 0:
        return "dormant"
    if row.get("email_is_free", 0) == 1 and row["bank_months_count"] <= 1:
        return "under_review"  # new account + free email = flagged for review, a real bank practice
    return "active"

def _account_age_days(row) -> int:
    # bank_months_count: months since the account relationship began
    # (-1 in BAF means missing/unknown -> treat as brand-new, age 0)
    months = max(row["bank_months_count"], 0)
    return int(months * 30)


def _transaction_history_summary(row) -> str:
    parts = []
    if row["velocity_24h"] > row.get("_velocity_24h_p75", 0):
        parts.append(f"high transfer velocity in the last 24 hours ({row['velocity_24h']:.0f} events)")
    if row["velocity_4w"] > row.get("_velocity_4w_p75", 0):
        parts.append(f"elevated activity over the last 4 weeks ({row['velocity_4w']:.0f} events)")
    if row["zip_count_4w"] > row.get("_zip_count_p75", 0):
        parts.append("transactions spread across an unusually high number of zip codes")
    if not parts:
        parts.append("normal, low-volume account activity with no unusual velocity")
    return "; ".join(parts).capitalize() + "."


def _red_flag_markers(row) -> list:
    flags = []
    if row["name_email_similarity"] < 0.3:
        flags.append("email_name_mismatch")
    if row["velocity_24h"] > row.get("_velocity_24h_p75", 0):
        flags.append("high_velocity_transfers")
    if row["device_fraud_count"] > 0:
        flags.append("device_fraud_history")
    if row["bank_months_count"] <= 1:
        flags.append("very_new_account")
    if row.get("foreign_request", False):
        flags.append("foreign_request")
    if not row.get("phone_mobile_valid", True):
        flags.append("invalid_phone_on_file")
    return flags


def build_from_baf(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)

    # Percentile thresholds used to flag "unusually high" activity
    df["_velocity_24h_p75"] = df["velocity_24h"].quantile(0.75)
    df["_velocity_4w_p75"] = df["velocity_4w"].quantile(0.75)
    df["_zip_count_p75"] = df["zip_count_4w"].quantile(0.75)

    out = pd.DataFrame()
    out["account_status"] = df.apply(_account_status, axis=1)
    out["account_age_days"] = df.apply(_account_age_days, axis=1)
    out["transaction_history_summary"] = df.apply(_transaction_history_summary, axis=1)
    out["red_flag_markers"] = df.apply(_red_flag_markers, axis=1)
    out["is_fraud"] = df["fraud_bool"]
    return out


def build_synthetic(n_rows: int, fraud_prevalence: float, seed: int) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    is_fraud = rng.random(n_rows) < fraud_prevalence

    rows = []
    for fraud in is_fraud:
        if fraud:
            bank_months = rng.integers(-1, 3)          # very new / just opened
            velocity_24h = rng.integers(15, 60)          # bursty activity
            velocity_4w = rng.integers(80, 300)
            zip_count_4w = rng.integers(8, 25)
            name_email_sim = rng.uniform(0.0, 0.25)
            device_fraud_count = rng.integers(0, 4)
            foreign_request = bool(rng.random() < 0.4)
            phone_mobile_valid = bool(rng.random() > 0.5)
        else:
            bank_months = rng.integers(1, 96)
            velocity_24h = rng.integers(0, 10)
            velocity_4w = rng.integers(0, 60)
            zip_count_4w = rng.integers(1, 6)
            name_email_sim = rng.uniform(0.4, 1.0)
            device_fraud_count = 0
            foreign_request = bool(rng.random() < 0.03)
            phone_mobile_valid = bool(rng.random() > 0.05)

        row = {
            "fraud_bool": int(fraud),
            "bank_months_count": bank_months,
            "velocity_24h": velocity_24h,
            "velocity_4w": velocity_4w,
            "zip_count_4w": zip_count_4w,
            "name_email_similarity": name_email_sim,
            "device_fraud_count": device_fraud_count,
            "foreign_request": foreign_request,
            "phone_mobile_valid": phone_mobile_valid,
        }
        rows.append(row)

    df = pd.DataFrame(rows)
    df["_velocity_24h_p75"] = df["velocity_24h"].quantile(0.75)
    df["_velocity_4w_p75"] = df["velocity_4w"].quantile(0.75)
    df["_zip_count_p75"] = df["zip_count_4w"].quantile(0.75)

    out = pd.DataFrame()
    out["account_status"] = df.apply(_account_status, axis=1)
    out["account_age_days"] = df.apply(_account_age_days, axis=1)
    out["transaction_history_summary"] = df.apply(_transaction_history_summary, axis=1)
    out["red_flag_markers"] = df.apply(_red_flag_markers, axis=1)
    out["is_fraud"] = df["fraud_bool"]
    return out


def main():
    if os.path.exists(DATA_PATH):
        print(f"Found real BAF data at {DATA_PATH} — mapping real dataset.")
        result = build_from_baf(DATA_PATH)
    else:
        print(
            f"No file at {DATA_PATH} — generating {N_SYNTHETIC_ROWS} synthetic "
            f"rows instead (fraud prevalence {FRAUD_PREVALENCE:.1%}, matching "
            "BAF's real-world ratio). Download the real BAF dataset from Kaggle "
            "and re-run for stronger signal: "
            "https://www.kaggle.com/datasets/sgpjesus/bank-account-fraud-dataset-neurips-2022"
        )
        result = build_synthetic(N_SYNTHETIC_ROWS, FRAUD_PREVALENCE, RANDOM_SEED)

    result.to_csv(OUTPUT_PATH, index=False)
    print(f"Wrote {len(result)} rows to {OUTPUT_PATH}")
    print(result["is_fraud"].value_counts(normalize=True))


if __name__ == "__main__":
    main()
