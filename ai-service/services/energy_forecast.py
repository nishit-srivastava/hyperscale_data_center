# services/energy_forecast.py
import torch
import numpy as np
import services.patchtst_loader as patchtst_loader

CRAC_IDX = None


def _init_crac_idx():
    global CRAC_IDX
    if CRAC_IDX is None:
        if patchtst_loader.feature_schema is None:
            raise RuntimeError("PatchTST feature_schema not loaded")
        CRAC_IDX = patchtst_loader.feature_schema["crac_feature_index"]
    


def summarize(pred):
    return {
        "mean": float(pred.mean()),
        "peak": float(pred.max()),
        "total": float(pred.sum())
    }


def apply_crac_delta(X, delta):
    X_s = X.copy()
    X_s[:, :, CRAC_IDX] += delta
    return X_s


def energy_forecast(payload: dict, model):
    _init_crac_idx()
    if model is None:
        raise RuntimeError("PatchTST model not loaded")

    metrics = payload["metrics"]

    X = np.array(list(metrics.values())).T
    X_latest = X[-30:].reshape(1, 30, -1)

    baseline = (
        model(torch.tensor(X_latest, dtype=torch.float32))
        .detach()
        .numpy()[0]
    )


    scenarios = {}

    for delta in payload["cracDeltaC"]:
        if delta == 0:
            continue

        X_delta = apply_crac_delta(X_latest, delta)

        pred = (
            model(torch.tensor(X_delta, dtype=torch.float32))
            .detach()
            .numpy()[0]
        )


        scenarios[f"crac_{delta:+}C"] = summarize(pred)

    sensitivity = 0.0
    if "crac_+2C" in scenarios:
        sensitivity = (
            scenarios["crac_+2C"]["mean"] - summarize(baseline)["mean"]
        ) / 2

    return {
        "rackId": payload["rackId"],
        "baseline": summarize(baseline),
        "scenarios": scenarios,
        "sensitivityKwPerC": round(sensitivity, 2)
    }
