import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app import models, crud, metrics
from datetime import datetime, timezone

# Use an in‑memory SQLite database for isolated testing
engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
models.Base.metadata.create_all(bind=engine)
Session = sessionmaker(bind=engine)

@pytest.fixture
def db_session():
    session = Session()
    yield session
    session.close()

def test_upsert_and_query(db_session):
    # Upsert a set of actual records
    actuals = [
        {"startTime": "2026-01-01T00:00:00+00:00", "generation": 1200},
        {"startTime": "2026-01-01T00:30:00+00:00", "generation": 1150},
    ]
    crud.upsert_actuals(db_session, actuals)
    # Upsert corresponding forecasts
    forecasts = [
        {"startTime": "2026-01-01T00:00:00+00:00", "generation": 1180, "publishTime": "2025-12-31T12:00:00+00:00"},
        {"startTime": "2026-01-01T00:30:00+00:00", "generation": 1195, "publishTime": "2025-12-31T12:30:00+00:00"},
    ]
    crud.upsert_forecasts(db_session, forecasts)
    # Retrieve the combined rows
    start = datetime.fromisoformat("2026-01-01T00:00:00+00:00")
    end = datetime.fromisoformat("2026-01-01T23:59:59+00:00")
    rows = crud.get_wind_data(db_session, start, end)
    assert len(rows) == 2
    # Verify both actual and forecast values are stored
    for row in rows:
        assert row.generation_actual is not None
        assert row.generation_forecast is not None
        assert row.publish_time is not None

def test_calculate_metrics():
    # Create dummy WindData objects
    w1 = models.WindData(
        start_time=datetime(2026, 1, 1, tzinfo=timezone.utc),
        generation_actual=1200,
        generation_forecast=1180,
        publish_time=datetime(2025, 12, 31, 12, 0, tzinfo=timezone.utc),
    )
    w2 = models.WindData(
        start_time=datetime(2026, 1, 1, 0, 30, tzinfo=timezone.utc),
        generation_actual=1150,
        generation_forecast=1195,
        publish_time=datetime(2025, 12, 31, 12, 30, tzinfo=timezone.utc),
    )
    result = metrics.calculate_metrics([w1, w2])
    # Manual calculations
    errors = [abs(1200 - 1180), abs(1150 - 1195)]
    mae = sum(errors) / 2
    mse = sum(e * e for e in errors) / 2
    rmse = mse ** 0.5
    bias = ((1200 - 1180) + (1150 - 1195)) / 2
    assert pytest.approx(result["mae"], rel=1e-3) == mae
    assert pytest.approx(result["rmse"], rel=1e-3) == rmse
    assert pytest.approx(result["bias"], rel=1e-3) == bias
    # Percentiles should contain the expected keys
    for p in ["5", "25", "50", "75", "95"]:
        assert p in result["percentiles"]
