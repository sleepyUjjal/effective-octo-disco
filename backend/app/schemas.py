from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class ActualWind(BaseModel):
    start_time: datetime
    generation: float

    class Config:
        orm_mode = True

class ForecastWind(BaseModel):
    start_time: datetime
    generation: float
    publish_time: Optional[datetime] = None

    class Config:
        orm_mode = True

class MetricsResponse(BaseModel):
    mae: Optional[float]
    rmse: Optional[float]
    bias: Optional[float]
    percentiles: dict
