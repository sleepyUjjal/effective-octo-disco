import datetime
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .fetcher import fetch_actual_wind, fetch_forecast_wind
from .dependencies import get_db
from .security import get_current_user
from . import crud, metrics, schemas

from .db import engine, Base
Base.metadata.create_all(bind=engine)
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

from .scheduler import schedule_job

@app.get('/')
async def hello(user: str = Depends(get_current_user)):
    return {"message": "Hello, world!"}

@app.on_event('startup')
async def startup_event():
    schedule_job()

@app.on_event('shutdown')
def shutdown_event():
    # Gracefully shut down the scheduler
    from .scheduler import scheduler
    scheduler.shutdown()


@app.get('/wind')
async def get_wind_data(user: str = Depends(get_current_user)):
    """Fetch actual and forecast wind generation for Jan 2026.
    Returns a JSON dict with two keys: ``actual`` and ``forecast``.
    """
    actual = await fetch_actual_wind()
    forecast = await fetch_forecast_wind()
    return {"actual": actual, "forecast": forecast}

@app.get('/actuals/{date_str}')
async def get_actuals(date_str: str, db: Session = Depends(get_db), user: str = Depends(get_current_user)):
    """Return actual wind generation for a given date (YYYY-MM-DD)."""
    try:
        target_date = datetime.datetime.strptime(date_str, "%Y-%m-%d").replace(tzinfo=datetime.timezone.utc)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format, expected YYYY-MM-DD")
    start_dt = target_date
    end_dt = start_dt + datetime.timedelta(days=1) - datetime.timedelta(seconds=1)
    rows = crud.get_wind_data(db, start_dt, end_dt)
    if not rows:
        # Populate DB if empty
        actual = await fetch_actual_wind()
        forecast = await fetch_forecast_wind()
        crud.upsert_actuals(db, actual)
        crud.upsert_forecasts(db, forecast)
        rows = crud.get_wind_data(db, start_dt, end_dt)
    actuals = [
        schemas.ActualWind(start_time=row.start_time, generation=row.generation_actual)
        for row in rows if row.generation_actual is not None
    ]
    return actuals

@app.get('/forecasts/{date_str}')
async def get_forecasts(date_str: str, db: Session = Depends(get_db), user: str = Depends(get_current_user)):
    """Return wind forecasts for a given date (YYYY-MM-DD)."""
    try:
        target_date = datetime.datetime.strptime(date_str, "%Y-%m-%d").replace(tzinfo=datetime.timezone.utc)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format, expected YYYY-MM-DD")
    start_dt = target_date
    end_dt = start_dt + datetime.timedelta(days=1) - datetime.timedelta(seconds=1)
    rows = crud.get_wind_data(db, start_dt, end_dt)
    if not rows:
        actual = await fetch_actual_wind()
        forecast = await fetch_forecast_wind()
        crud.upsert_actuals(db, actual)
        crud.upsert_forecasts(db, forecast)
        rows = crud.get_wind_data(db, start_dt, end_dt)
    forecasts = [
        schemas.ForecastWind(
            start_time=row.start_time,
            generation=row.generation_forecast,
            publish_time=row.publish_time,
        )
        for row in rows if row.generation_forecast is not None
    ]
    return forecasts

@app.get('/metrics/{date_str}')
async def get_metrics(date_str: str, db: Session = Depends(get_db), user: str = Depends(get_current_user)):
    """Calculate error metrics for a specific date (YYYY-MM-DD).
    Fetches data, stores if missing, returns MAE, RMSE, bias, and percentiles.
    """
    try:
        target_date = datetime.datetime.strptime(date_str, "%Y-%m-%d").replace(tzinfo=datetime.timezone.utc)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format, expected YYYY-MM-DD")
    start_dt = target_date
    end_dt = start_dt + datetime.timedelta(days=1) - datetime.timedelta(seconds=1)
    existing = crud.get_wind_data(db, start_dt, end_dt)
    if not existing:
        actual = await fetch_actual_wind()
        forecast = await fetch_forecast_wind()
        crud.upsert_actuals(db, actual)
        crud.upsert_forecasts(db, forecast)
        existing = crud.get_wind_data(db, start_dt, end_dt)
    result = metrics.calculate_metrics(existing)
    return schemas.MetricsResponse(**result)


