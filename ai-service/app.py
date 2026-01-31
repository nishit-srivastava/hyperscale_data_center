from fastapi import FastAPI
from services.forecast import short_term_insight, load_artifacts
from schemas.forecast import ShortTermInsightRequest, ShortTermInsightResponse


from services.anomaly import detect_anomaly, load_artifacts as load_anomaly
from schemas.anomaly import AnomalyRequest, AnomalyResponse


from services.energy_forecast import energy_forecast
from services.patchtst_loader import patchtst_model
import services.patchtst_loader as patchtst_loader
from schemas.energy import EnergyForecastRequest, EnergyForecastResponse

app = FastAPI(title="AI Digital Twin Inference API")


@app.on_event("startup")
def startup_event():
    load_artifacts()
    load_anomaly()
    patchtst_loader.load_patchtst()

@app.post(
    "/api/ai/insight/short-term",
    response_model=ShortTermInsightResponse
)
def ai_insight(payload: ShortTermInsightRequest):
    return short_term_insight(payload.dict())

@app.post(
    "/api/ai/insight/anomaly",
    response_model=AnomalyResponse
)
def ai_anomaly(payload: AnomalyRequest):
    return detect_anomaly(payload.dict())

@app.post(
    "/api/ai/energy/forecast",
    response_model=EnergyForecastResponse
)
def energy_forecast_api(payload: EnergyForecastRequest):
    return energy_forecast(
        payload.dict(),
        patchtst_loader.patchtst_model
    )


# @app.post("/api/ai/sustainability/risk")
# def sustainability(payload: dict):
#     return yearly_risk(payload)

# @app.post("/api/ai/sustainability/scenario")
# def scenario(payload: dict):
#     return scenario_simulation(payload)
