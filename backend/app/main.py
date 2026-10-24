from fastapi import FastAPI
from .fetcher import fetch_actual_wind, fetch_forecast_wind

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

