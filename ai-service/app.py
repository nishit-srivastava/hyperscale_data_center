from fastapi import FastAPI
from services.forecast import short_term_insight, load_artifacts
from schemas.forecast import ShortTermInsightRequest, ShortTermInsightResponse
# from services.anomaly import detect_anomaly
# from services.sustainability import yearly_risk, scenario_simulation

app = FastAPI(title="AI Digital Twin Inference API")


@app.on_event("startup")
def startup_event():
    load_artifacts()

@app.post(
    "/api/ai/insight/short-term",
    response_model=ShortTermInsightResponse
)
def ai_insight(payload: ShortTermInsightRequest):
    return short_term_insight(payload.dict())

# @app.post("/api/ai/anomalies/detect")
# def anomalies(payload: dict):
#     return detect_anomaly(payload)

# @app.post("/api/ai/sustainability/risk")
# def sustainability(payload: dict):
#     return yearly_risk(payload)

# @app.post("/api/ai/sustainability/scenario")
# def scenario(payload: dict):
#     return scenario_simulation(payload)
