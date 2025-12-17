# Rack Telemetry ML Pipeline

This module converts TimescaleDB telemetry data  into
flat datasets for:

- Energy & thermal forecasting (LSTM / GRU)
- Anomaly detection (Autoencoder / LSTM-AE)

## Outputs

| File | Purpose |
|-----|--------|
| rack_timeseries.csv | Forecasting models |
| rack_sequences.npz | Anomaly detection models |

## Workflow

1. Fetch telemetry from TimescaleDB
2. Normalize & align timestamps
3. Export:
   - Flat time-series CSV
   - Sliding window sequences (NPZ)
4. Train forecasting & anomaly models

## Stack

- Python, Pandas, NumPy
- TimescaleDB (PostgreSQL)
- TensorFlow / Keras
- JupyterLab

## Run

```bash
cd ai_models
python -m venv env
env\Scripts\activate

pip install --upgrade pip
pip install -r requirements.txt
python -m ipykernel install --user --name rack-ml --display-name "Rack ML"


jupyter lab
