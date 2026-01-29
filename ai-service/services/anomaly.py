import joblib
import numpy as np
from datetime import datetime

model = joblib.load("./models/lstm_forecasting_model.h5")
scaler = joblib.load("./models/scaler.pkl")

def detect_anomaly(payload):
    rack = payload["rackId"]
    metrics = payload["metrics"]

    X = np.array(list(metrics.values())).T
    X_scaled = scaler.transform(X)

    reconstructed = model.predict(X_scaled)
    error = np.mean(np.square(X_scaled - reconstructed), axis=1)

    threshold = np.percentile(error, 95)

    anomalies = []

    if error[-1] > threshold:
        anomalies.append({
            "timestamp": datetime.utcnow().isoformat(),
            "metric": "exhaustTemp",
            "severity": "HIGH",
            "deviationScore": round(float(error[-1]), 2)
        })

    return {
        "rackId": rack,
        "anomalies": anomalies,
        "overallStatus": "DEGRADED" if anomalies else "NORMAL"
    }
