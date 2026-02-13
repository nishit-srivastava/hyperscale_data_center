from typing import List, Dict
from pydantic import BaseModel

class RiskRequest(BaseModel):
    racks: List[str] = ["A", "B", "C", "D"]
    metrics: Dict[str, List[float]]

class YearlyRiskData(BaseModel):
    year: str
    racks: Dict[str, str]

class RiskResponse(BaseModel):
    yearly_risks: List[YearlyRiskData]
    risk_analysis: str