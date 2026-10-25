import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_without_auth_returns_401():
    response = client.get('/')
    assert response.status_code == 401
    assert response.json()["detail"] == "Not authenticated"
