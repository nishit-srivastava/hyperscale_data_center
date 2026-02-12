import joblib
import numpy as np
from tensorflow.keras.models import load_model

model = None
scalers = None

WINDOW = 30

def load_artifacts():
    global model, scalers
    model = load_model("./models/lstm_forecasting_model.h5", compile=False)
    scalers = joblib.load("./models/scalers_per_rack.pkl")
    print("✅ LSTM model and scalers loaded")

def short_term_insight(payload):
    if model is None or scalers is None:
        raise RuntimeError("Model not loaded")

    rack = payload["rackId"]
    metrics = payload["metrics"]

    X = np.array(list(metrics.values())).T
    scaler = scalers[rack]
    X_scaled = scaler.transform(X)

    X_window = X_scaled[-WINDOW:].reshape(1, WINDOW, -1)
    prediction = model.predict(X_window, verbose=0)

    deviation = np.mean(np.abs(prediction - X_scaled[-1]))

    status = "NOMINAL" if deviation < 1.2 else "WATCH"

    message = (
        "Current thermal and power behavior is within nominal operating limits. System efficiency optimal"
        if status == "NOMINAL"
        else "Rack behavior deviates from expected pattern"
    )

    return {
        "rackId": rack,
        "status": status,
        "confidence": round(float(max(0, 1 - deviation)), 2),
        "message": message
    }
