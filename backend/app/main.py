import datetime
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session

from .fetcher import fetch_actual_wind, fetch_forecast_wind
from .dependencies import get_db
from . import crud, metrics

from .db import engine, Base
# Ensure tables exist
Base.metadata.create_all(bind=engine)

app = FastAPI()
@app.get('/')
def hello():
    return {"message": "Hello, world!"}

@app.get('/wind')
async def get_wind_data():
    """Fetch actual and forecast wind generation for Jan 2026.
    Returns a JSON dict with two keys: ``actual`` and ``forecast``.
    """
    actual = await fetch_actual_wind()
    forecast = await fetch_forecast_wind()
    return {"actual": actual, "forecast": forecast}

@app.get('/metrics/{date_str}')
async def get_metrics(date_str: str, db: Session = Depends(get_db)):
    """Calculate error metrics for a specific date (YYYY-MM-DD).
    The endpoint fetches data for that 24‑hour period, persists it if needed,
    and returns MAE, RMSE, bias, and selected percentiles.
    """
    # Parse date string
    try:
        target_date = datetime.datetime.strptime(date_str, "%Y-%m-%d").replace(tzinfo=datetime.timezone.utc)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format, expected YYYY-MM-DD")
    start_dt = target_date
    end_dt = start_dt + datetime.timedelta(days=1) - datetime.timedelta(seconds=1)
    # Ensure data exists in DB – if not, fetch and store
    existing = crud.get_wind_data(db, start_dt, end_dt)
    if not existing:
        # Fetch from external API
        actual = await fetch_actual_wind()
        forecast = await fetch_forecast_wind()
        # Upsert into DB
        crud.upsert_actuals(db, actual)
        crud.upsert_forecasts(db, forecast)
        existing = crud.get_wind_data(db, start_dt, end_dt)
    # Compute metrics
    result = metrics.calculate_metrics(existing)
    return result

