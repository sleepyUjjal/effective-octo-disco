import json
import pytest
import respx
import httpx
from datetime import datetime, timezone
from app import fetcher
from app.fetcher import FUELHH_URL, WINDFOR_URL

@pytest.mark.asyncio
async def test_fetch_actual_wind_success():
    # Mock NDJSON response with wind and non‑wind records
    payload = [
        {"fuelType": "WIND", "startTime": "2026-01-01T00:00:00Z", "generation": 1200},
        {"fuelType": "SOLAR", "startTime": "2026-01-01T00:00:00Z", "generation": 500},
        {"fuelType": "WIND", "startTime": "2025-12-31T23:30:00Z", "generation": 1100},
    ]
    with respx.mock(base_url="https://bmrs.elexon.co.uk") as mock:
        mock.get("/api/v1/datasets/FUELHH/stream").respond(
            status_code=200,
            content=json.dumps(payload),
            headers={"Content-Type": "application/json"},
        )
        actual = await fetcher.fetch_actual_wind()
        # Only the WIND record within Jan 2026 should be kept
        assert len(actual) == 1
        rec = actual[0]
        assert rec["generation"] == 1200.0
        assert rec["startTime"] == "2026-01-01T00:00:00+00:00"

@pytest.mark.asyncio
async def test_fetch_forecast_wind_success():
    payload = [
        {"fuelType": "WIND", "startTime": "2026-01-01T00:30:00Z", "publishTime": "2025-12-31T12:30:00Z", "generation": 1150},
        {"fuelType": "WIND", "startTime": "2026-01-02T00:00:00Z", "publishTime": "2025-12-31T12:00:00Z", "generation": 1180},
        {"fuelType": "WIND", "startTime": "2025-12-31T23:30:00Z", "publishTime": "2025-12-31T10:00:00Z", "generation": 1100},
    ]
    with respx.mock(base_url="https://bmrs.elexon.co.uk") as mock:
        mock.get("/api/v1/datasets/WINDFOR/stream").respond(
            status_code=200,
            content=json.dumps(payload),
            headers={"Content-Type": "application/json"},
        )
        forecast = await fetcher.fetch_forecast_wind()
        # Only records within Jan 2026 should be returned
        assert len(forecast) == 2
        times = {f["startTime"] for f in forecast}
        assert "2026-01-01T00:30:00+00:00" in times
        assert "2026-01-02T00:00:00+00:00" in times
