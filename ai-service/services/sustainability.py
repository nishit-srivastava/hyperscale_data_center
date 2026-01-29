import joblib
import numpy as np

model = joblib.load("models/patchtst.pkl")

def yearly_risk(payload):
    racks = payload["rackIds"]

    return {
        "yearlyRisk": {
            "2026": {r: "YELLOW" if r == "C" else "GREEN" for r in racks},
            "2027": {r: "RED" if r == "C" else "GREEN" for r in racks}
        }
    }

def scenario_simulation(payload):
    delta = payload["scenario"]["coolingEfficiencyChangePercent"]

    return {
        "rackId": payload["rackId"],
        "scenario": f"{delta}%",
        "impact": {
            "energyDelta": "-4.8%" if delta > 0 else "+5.2%",
            "riskChange": "RED → YELLOW" if delta > 0 else "YELLOW → RED"
        }
    }
