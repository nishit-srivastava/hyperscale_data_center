from pydantic import BaseModel
from typing import Dict, List, Literal


class EnergyForecastRequest(BaseModel):
    rackId: str
    metrics: Dict[str, List[float]]   # SAME STRUCTURE as others
    cracDeltaC: List[int] = [0]


class EnergySummary(BaseModel):
    mean: float
    peak: float
    total: float


class EnergyForecastResponse(BaseModel):
    rackId: str
    baseline: EnergySummary
    scenarios: Dict[str, EnergySummary]
    sensitivityKwPerC: float
