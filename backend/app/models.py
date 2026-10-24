from .db import Base
from sqlalchemy import Column, DateTime, Float

class WindData(Base):
    __tablename__ = "wind_data"

    # Primary key is the start time (each 30‑min interval appears once)
    start_time = Column(DateTime, primary_key=True, index=True)
    generation_actual = Column(Float, nullable=True)
    generation_forecast = Column(Float, nullable=True)
    # When the forecast was published (only relevant for forecast rows)
    publish_time = Column(DateTime, nullable=True)
