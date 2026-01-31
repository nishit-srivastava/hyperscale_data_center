# services/anomaly.py
import joblib
import numpy as np
from tensorflow.keras.models import load_model

autoencoder = None
threshold = None
scalers = None

WINDOW = 30

# Define this globally at the top of services/anomaly.py
FEATURES = [
    "cpu_util", "power_kw", "ambient_temp_c", 
    "inlet_temp_c", "exhaust_temp_c", "fan_speed_rpm", "humidity"
]


def load_artifacts():
    global autoencoder, threshold, scalers

    autoencoder = load_model(
        "./models/lstm_autoencoder_model.h5",
        compile=False
    )
    threshold = float(np.load("./models/anomaly_threshold.npy"))
    scalers = joblib.load("./models/scalers_per_rack.pkl")

    print("✅ Anomaly model, threshold, and scalers loaded")


def detect_anomaly(payload: dict):
    rack = payload["rackId"]
    metrics = payload["metrics"]

    # 1. Build the matrix in the CORRECT ORDER
    raw_values = []
    for i in range(WINDOW):
        # This ensures column 0 is always cpu_util, etc.
        timestep = [metrics[f][i] for f in FEATURES]
        raw_values.append(timestep)
    
    X_raw = np.array(raw_values) # Shape: (30, 7)

    # 2. Apply the RACK-SPECIFIC scaler
    # If the curl data is already 0-1 (scaled), SKIP this step.
    # If the curl data is raw (e.g. RPM = 2100), KEEP this step.
    if np.max(X_raw) > 1.0:
        scaler = scalers[rack] # Loaded from your .pkl
        X_scaled = scaler.transform(X_raw)
    else:
        X_scaled = X_raw

    # 3. Reshape for LSTM (Batch, Timesteps, Features)
    X_input = X_scaled.reshape(1, WINDOW, len(FEATURES))

    # 4. Predict and Calculate Error
    X_pred = autoencoder.predict(X_input, verbose=0)
    error = np.mean(np.square(X_input - X_pred))

    status = "ANOMALY" if error > threshold else "NORMAL"
    confidence = round(min(1.0, error / threshold), 2)

    return {
        "rackId": rack,
        "status": status,
        "confidence": confidence,
        "reconstructionError": round(error, 6),
        "threshold": round(threshold, 6),
        "message": "Rack operating within normal behavior range" if status == "NORMAL" else "Abnormal behavior detected"
    }
