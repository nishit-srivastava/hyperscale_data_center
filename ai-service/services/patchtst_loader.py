import json
import torch
from services.patchtst_model import PatchTST

patchtst_model = None
feature_schema = None


def load_patchtst():
    global patchtst_model, feature_schema

    with open("./models/patchtst_config.json") as f:
        cfg = json.load(f)

    with open("./models/feature_schema.json") as f:
        feature_schema = json.load(f)

    patchtst_model = PatchTST(
        n_features=cfg["n_features"],
        horizon=cfg["horizon"],
        d_model=cfg["d_model"],
        n_heads=cfg["n_heads"],
        n_layers=cfg["n_layers"]
    )

    patchtst_model.load_state_dict(
        torch.load("./models/patchtst_energy.pt", map_location="cpu")
    )

    patchtst_model.eval()

    print("✅ PatchTST model loaded")
