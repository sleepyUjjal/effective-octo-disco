import datetime
import math
from typing import List, Dict, Any
from .models import WindData

def calculate_metrics(records: List[WindData]) -> Dict[str, Any]:
    """Calculate error metrics for a list of WindData rows.

    Only rows where both actual and forecast values are present are considered.
    Returns a dict with MAE, RMSE, bias, and selected error percentiles.
    """
    errors = []
    signed_errors = []
    for rec in records:
        if rec.generation_actual is None or rec.generation_forecast is None:
            continue
        err = rec.generation_actual - rec.generation_forecast
        signed_errors.append(err)
        errors.append(abs(err))
    if not errors:
        return {"mae": None, "rmse": None, "bias": None, "percentiles": {}}
    mae = sum(errors) / len(errors)
    mse = sum(e * e for e in errors) / len(errors)
    rmse = math.sqrt(mse)
    bias = sum(signed_errors) / len(signed_errors)
    # Compute common percentiles
    sorted_errors = sorted(errors)
    def perc(p):
        k = (len(sorted_errors) - 1) * p / 100
        f = math.floor(k)
        c = math.ceil(k)
        if f == c:
            return sorted_errors[int(k)]
        d0 = sorted_errors[int(f)] * (c - k)
        d1 = sorted_errors[int(c)] * (k - f)
        return d0 + d1
    percentiles = {str(p): perc(p) for p in [5, 25, 50, 75, 95]}
    return {
        "mae": mae,
        "rmse": rmse,
        "bias": bias,
        "percentiles": percentiles,
    }
