"""
RARS Shield — RF Transaction Model Training

Run:
    pip install scikit-learn pandas numpy joblib --break-system-packages
    python3 train_ml_model.py

Produces rf_model.joblib in the working directory. hybrid_scorer.py
loads that file at import time.

TODO before production: replace ml_features.make_synthetic_training_data()
with the real PaySim CSV (or BMONI's actual transaction history, same
column shape). The synthetic generator exists only so the pipeline can
be built and tested end-to-end without that data in hand yet.
"""

import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score

from ml_features import make_synthetic_training_data, FEATURE_COLUMNS

MODEL_PATH = "rf_model.joblib"


def train():
    df = make_synthetic_training_data(n=30000)
    X = df[FEATURE_COLUMNS]
    y = df["is_fraud"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=7, stratify=y
    )

    clf = RandomForestClassifier(
        n_estimators=200,
        max_depth=10,
        min_samples_leaf=5,
        class_weight="balanced",
        random_state=7,
        n_jobs=-1,
    )
    clf.fit(X_train, y_train)

    y_prob = clf.predict_proba(X_test)[:, 1]
    y_pred = clf.predict(X_test)

    print("=== Held-out evaluation (synthetic data) ===")
    print(classification_report(y_test, y_pred, digits=3))
    print(f"ROC-AUC: {roc_auc_score(y_test, y_prob):.3f}")

    print("\n=== Feature importances ===")
    for name, imp in sorted(
        zip(FEATURE_COLUMNS, clf.feature_importances_), key=lambda x: -x[1]
    ):
        print(f"  {name:22s} {imp:.3f}")

    joblib.dump(clf, MODEL_PATH)
    print(f"\nSaved model to {MODEL_PATH}")


if __name__ == "__main__":
    train()
