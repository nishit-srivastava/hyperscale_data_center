from pydantic import BaseModel
from typing import Dict, List

class ShortTermInsightRequest(BaseModel):
    rackId: str
    metrics: Dict[str, List[float]]


class ShortTermInsightResponse(BaseModel):
    rackId: str
    status: str
    confidence: float
    message: str
