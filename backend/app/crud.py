import datetime
from typing import List
from sqlalchemy.orm import Session
from . import models

def upsert_actuals(db: Session, records: List[dict]):
    for rec in records:
        start = datetime.datetime.fromisoformat(rec["startTime"]).replace(tzinfo=datetime.timezone.utc)
        obj = db.query(models.WindData).filter(models.WindData.start_time == start).first()
        if obj:
            obj.generation_actual = rec["generation"]
        else:
            obj = models.WindData(
                start_time=start,
                generation_actual=rec["generation"],
                generation_forecast=None,
                publish_time=None,
            )
            db.add(obj)
    db.commit()

def upsert_forecasts(db: Session, records: List[dict]):
    for rec in records:
        start = datetime.datetime.fromisoformat(rec["startTime"]).replace(tzinfo=datetime.timezone.utc)
        publish = None
        if rec.get("publishTime"):
            publish = datetime.datetime.fromisoformat(rec["publishTime"]).replace(tzinfo=datetime.timezone.utc)
        obj = db.query(models.WindData).filter(models.WindData.start_time == start).first()
        if obj:
            obj.generation_forecast = rec["generation"]
            obj.publish_time = publish
        else:
            obj = models.WindData(
                start_time=start,
                generation_actual=None,
                generation_forecast=rec["generation"],
                publish_time=publish,
            )
            db.add(obj)
    db.commit()

def get_wind_data(db: Session, start: datetime.datetime, end: datetime.datetime):
    return (
        db.query(models.WindData)
        .filter(models.WindData.start_time >= start, models.WindData.start_time <= end)
        .order_by(models.WindData.start_time)
        .all()
    )
