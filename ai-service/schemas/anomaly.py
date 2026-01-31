from pydantic import BaseModel
from typing import Dict, List, Optional


class AnomalyRequest(BaseModel):
    rackId: str
    metrics: Dict[str, List[float]]


class AnomalyResponse(BaseModel):
    rackId: str
    status: str
    confidence: float
    reconstructionError: float
    threshold: float
    message: Optional[str] = None
