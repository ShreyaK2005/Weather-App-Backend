from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_create_record():

    response = client.post(
        "/records",
        json={
            "location_query": "New York",
            "start_date": "2026-07-01",
            "end_date": "2026-07-05"
        }
    )

    assert response.status_code == 200

    body = response.json()

    assert body["location_query"] == "New York"

    assert "id" in body

def test_get_records():
        response = client.get("/records")

        assert response.status_code == 200

        assert isinstance(response.json(), list)

def test_get_record():

    response = client.get("/records/1")

    assert response.status_code in [200,404]


def test_update_record():

    response = client.put(
        "/records/1",
        json={
            "location_query":"Mumbai"
        }
    )

    assert response.status_code in [200,404]

def test_delete_record():

    response = client.delete("/records/1")

    assert response.status_code in [200,404]

def test_invalid_city():

    response = client.post(
        "/records",
        json={
            "location_query":"abcdefxyz",
            "start_date":"2026-07-01",
            "end_date":"2026-07-05"
        }
    )

    assert response.status_code == 404


def test_invalid_dates():

    response = client.post(
        "/records",
        json={
            "location_query":"Nagpur",
            "start_date":"2026-07-10",
            "end_date":"2026-07-01"
        }
    )

    assert response.status_code == 422

def test_export_json():

    response = client.get("/records/1/export?format=json")

    assert response.status_code in [200,404]

def test_google_maps():

    response = client.get("/weather/current?location=New York")

    assert response.status_code == 200

    body = response.json()

    assert "google_maps" in body

def test_youtube():

    response = client.get("/weather/current?location=New York")

    body = response.json()

    assert "youtube" in body

def test_air_quality():

    response = client.get("/weather/current?location=New York")

    body = response.json()

    assert "air_quality" in body

def test_uv_index():

    response = client.get("/weather/current?location=New York")

    body = response.json()

    assert "uv_index" in body

def test_weather_recommendation():

    response = client.get("/weather/current?location=New York")

    body = response.json()

    assert "weather_advice" in body
