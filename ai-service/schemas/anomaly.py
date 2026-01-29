class AnomalyRequest(BaseModel):
    rackId: str
    metrics: Dict[str, List[float]]
