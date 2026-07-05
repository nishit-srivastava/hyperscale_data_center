# AI-Enabled Digital Twin for Sustainable Hyperscale Data Centers

**M.Tech Dissertation (AIMLCZG628T) — BITS Pilani WILP**
Dissertation work carried out at Nehish Software Solution Pvt Ltd, Bangalore, under the supervision of **Tushar Ranjan**.

An AI-powered digital twin that models server racks, workloads, and thermal dynamics in a hyperscale data center, combining real-time IoT telemetry simulation, deep learning forecasting/anomaly models, and an interactive 3D visualization layer to support sustainability-focused operational decisions.

## Objectives

- Model a Digital Twin representation of server racks, workloads, and thermal dynamics in a hyperscale data center
- Develop AI/ML models for energy consumption forecasting, thermal prediction, and anomaly detection
- Perform sustainability-focused what-if simulations — e.g. workload shifting and cooling policy (CRAC) adjustments
- Recommend operational optimization strategies to reduce energy usage while maintaining performance reliability

## Architecture

The system is organized into three layers, from live telemetry simulation through to AI inference and visualization:

### 1. Data Acquisition Layer
Simulates realistic server rack workloads and streams telemetry:
- Server racks A–D, each with CPU utilization, power consumption, temperature (ambient/inlet/exhaust), fan speed, and humidity sensors (simulated)
- Raspberry Pi edge devices and Node-RED flows aggregate and normalize sensor data, tagging it with rack identifiers, and publish it to the IoT broker

### 2. IoT & Platform Layer
- MQTT broker + **ThingsBoard** IoT platform for device authentication, rule-based alerting, and real-time WebSocket streaming
- **TimescaleDB** (PostgreSQL) persists all telemetry as time-series data

### 3. Data Engineering & Feature Processing Layer
- Python ETL jobs extract historical telemetry from TimescaleDB
- Converts time-series data into flat per-rack datasets, with scaling/normalization, derived thermal features, and sliding-window sequence generation for model training

### AI / Inference Layer
A FastAPI microservice (`ai-service/`) serves four model-backed capabilities over the processed telemetry:

| Capability | Model | Purpose |
|---|---|---|
| Short-term health insight | LSTM | Forecasts near-future operating trends; classifies rack health as Nominal / Watch / Critical |
| Anomaly detection | LSTM-Autoencoder | Unsupervised detection of abnormal rack behavior, with timestamp, metric deviation, and severity |
| Energy forecasting | PatchTST (transformer) | Time-series forecasting of energy consumption for sustainability what-if analysis |
| Sustainability risk scoring | Rule engine + PatchTST | Yearly degradation-risk scoring per rack, factoring forecasted load and cooling sensitivity (±2°C CRAC scenarios) |

### Visualization Layer
A real-time 3D digital twin of the data hall (React Three Fiber), spatially mapping each rack to its physical counterpart, with live telemetry overlays, AI health classification, and anomaly highlighting directly in the 3D view.

## Key Features

- **Live Digital Twin** — real-time 3D view of the data hall with per-rack telemetry (inlet/exhaust temperature, power draw, fan speed, CPU utilization)
- **AI-Assisted Health Insights** — continuous evaluation of live telemetry against expected behavior, with short-term LSTM-based forecasting
- **Anomaly Detection** — automatic detection of abnormal patterns, highlighted on affected racks in the 3D view, with a full anomaly history
- **Sustainability Analysis** — PatchTST-based energy forecasting, cooling-sensitivity analysis, and early-intervention recommendations for at-risk racks

## Repository Structure

```
hyperscale_data_center/
├── ai-service/                 # FastAPI inference microservice
│   ├── app.py                   # API routes: insight, anomaly, energy forecast, sustainability risk
│   ├── models/                  # Trained model artifacts (LSTM, LSTM-AE, PatchTST, scalers)
│   ├── services/                # forecast.py, anomaly.py, energy_forecast.py, patchtst_loader.py, risk.py
│   └── schemas/                 # Pydantic request/response schemas
├── ai_models/                   # Rack Telemetry ML Pipeline
│   ├── notebooks/, scripts/     # TimescaleDB → flat datasets → LSTM/GRU + Autoencoder training
│   └── README.md
├── IoTFramework/
│   ├── Bulk_Simulators/          # C#/.NET bulk IoT device simulators (MQTT + ThingsBoard provisioning)
│   ├── Sensors/                  # Node-RED flows per rack (A–D) + anomaly detection flow
│   └── docker/                   # ThingsBoard + TimescaleDB + RabbitMQ docker-compose stack
├── ui/                           # Primary digital twin viewer — React + TypeScript + Vite
│                                 # (shadcn/ui, Radix, Tailwind, @react-three/fiber, @react-three/drei, TanStack Query)
└── hyperscale-viewer/            # Earlier prototype viewer (JS, legacy 3D model loader + mock server)
```

## Tech Stack

| Layer | Tools |
|---|---|
| Edge / simulation | C# (.NET), Node-RED, Raspberry Pi |
| IoT platform | MQTT, ThingsBoard |
| Data storage | TimescaleDB (PostgreSQL) |
| ML / AI | Python, Pandas, NumPy, TensorFlow/Keras, PyTorch, LSTM, LSTM-Autoencoder, PatchTST |
| Backend API | FastAPI |
| Frontend | React, TypeScript, Vite, Three.js (@react-three/fiber, @react-three/drei), shadcn/ui, Tailwind CSS |
| Infra | Docker Compose |

## Progress

| Phase | Duration | Work | Status |
|---|---|---|---|
| Dissertation Outline | 03 Nov 2025 – 10 Nov 2025 | Literature review and understanding of sustainable data center operations | Completed |
| Design & Development & Testing | 11 Nov 2025 – 1 Dec 2025 | Digital Twin architecture design and modeling of server rack structures | Completed |
| Model Design, Development & Testing | 2 Dec 2025 – 13 Jan 2026 | Development and training of AI/ML monitoring, forecasting, and anomaly detection models; sustainability what-if simulation and evaluation | Completed |
| Dissertation Review | 14 Jan 2026 – 25 Jan 2026 | Visualization dashboard creation; submission to Supervisor and examiner for review | Completed |
| Submission | 26 Jan 2026 – 28 Jan 2026 | Documentation, final review, and submission | Completed |

## Setup

**AI inference service:**
```bash
cd ai-service
python -m venv svc
svc\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

**ML training pipeline:**
```bash
cd ai_models
python -m venv env
env\Scripts\activate
pip install -r requirements.txt
jupyter lab
```

**Digital twin viewer:**
```bash
cd ui
npm install
npm run dev
```

**IoT simulation stack** (ThingsBoard + TimescaleDB + RabbitMQ):
```bash
cd IoTFramework/docker
docker-compose -f docker-compose.tb.yml up -d
```

## Author

Nishit Srivastava — M.Tech (AI & ML), BITS Pilani WILP
Supervisor: Tushar Ranjan, Nehish Software Solution Pvt Ltd, Bangalore
