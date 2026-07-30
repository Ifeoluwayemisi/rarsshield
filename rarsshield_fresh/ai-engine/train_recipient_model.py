"""
RARS Shield -- RF Recipient Model Training

Trains on recipient_check_dataset.csv, built by build_recipient_dataset.py
from the real Bank Account Fraud (BAF) Dataset Suite (NeurIPS 2022).

Run:
    pip install scikit-learn pandas numpy joblib imbalanced-learn --break-system-packages
    python3 build_recipient_dataset.py     # if you haven't already
    python3 train_recipient_model.py

Produces rf_recipient_model.joblib. hybrid_scorer.py's score_recipient()
loads that file at import time.
"""

import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score
from imblearn.over_sampling import SMOTE

from recipient_features import load_recipient_dataset, FEATURE_COLUMNS

DATA_PATH = "recipient_check_dataset.csv"
MODEL_PATH = "rf_recipient_model.joblib"


def train():
    df = load_recipient_dataset(DATA_PATH)
    X = df[FEATURE_COLUMNS]
    y = df["is_fraud"]

    print(f"Loaded {len(df):,} rows | real fraud rate: {y.mean():.4%}")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=7, stratify=y
    )

    # BAF's real fraud rate is ~1.1% -- SMOTE on training only, same
    # rule we followed for the transaction model: never balance test data
    smote = SMOTE(random_state=7)
    X_train_bal, y_train_bal = smote.fit_resample(X_train, y_train)

    clf = RandomForestClassifier(
        n_estimators=200,
        max_depth=10,
        min_samples_leaf=5,
        random_state=7,
        n_jobs=-1,
    )
    clf.fit(X_train_bal, y_train_bal)

    y_prob = clf.predict_proba(X_test)[:, 1]
    y_pred = clf.predict(X_test)

    print("\n=== Held-out evaluation (real BAF-derived data) ===")
    print(classification_report(y_test, y_pred, digits=3))
    print(f"ROC-AUC: {roc_auc_score(y_test, y_prob):.3f}")

    print("\n=== Feature importances ===")
    for name, imp in sorted(
        zip(FEATURE_COLUMNS, clf.feature_importances_), key=lambda x: -x[1]
    ):
        print(f"  {name:28s} {imp:.3f}")

    joblib.dump(clf, MODEL_PATH)
    print(f"\nSaved model to {MODEL_PATH}")


if __name__ == "__main__":
    train()
