import asyncio
from datetime import datetime
from .fetcher import fetch_actual_wind, fetch_forecast_wind
from .crud import upsert_actuals, upsert_forecasts
from .db import SessionLocal

from apscheduler.schedulers.background import BackgroundScheduler

scheduler = BackgroundScheduler()

async def _refresh_data():
    """Fetch latest wind data and upsert into DB."""
    # Get a new DB session for this job
    db = SessionLocal()
    try:
        actual = await fetch_actual_wind()
        forecast = await fetch_forecast_wind()
        upsert_actuals(db, actual)
        upsert_forecasts(db, forecast)
    finally:
        db.close()

def schedule_job():
    # Schedule the async job to run every hour
    loop = asyncio.get_event_loop()
    scheduler.add_job(lambda: loop.create_task(_refresh_data()), 'interval', hours=1, next_run_time=datetime.now())
    scheduler.start()
