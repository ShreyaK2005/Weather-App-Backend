"""
Main FastAPI application.

Run with:  uvicorn app.main:app --reload
Docs at:   http://127.0.0.1:8000/docs
"""
import json
import csv
import io

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

import models, schemas, Weather_Service
from Database import engine, get_db

# Create DB tables on startup (fine for SQLite + a project this size)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Weather App API")

# Allow the React dev server (localhost:5173 for Vite) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Weather display endpoints (Assessment 1 needs) ----------

@app.get("/weather/current")
async def current_weather(location: str = Query(..., description="City, zip, landmark, or 'lat,lon'")):
    try:
        loc = await Weather_Service.geocode_location(location)

    except Weather_Service.LocationNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

    except Weather_Service.WeatherServiceError as e:
        raise HTTPException(status_code=503, detail=str(e))

    data = await Weather_Service.get_current_and_forecast(loc["latitude"], loc["longitude"])
    return {"location": loc, "current": data.get("current"), "daily_forecast": data.get("daily")}


# ---------- CRUD endpoints (Assessment 2, section 2.1) ----------

@app.post("/records", response_model=schemas.WeatherRecordOut)
async def create_record(payload: schemas.WeatherRecordCreate, db: Session = Depends(get_db)):
    try:
        loc = await Weather_Service.geocode_location(payload.location_query)

        daily = await Weather_Service.get_daily_range(
            loc["latitude"],
            loc["longitude"],
            payload.start_date,
            payload.end_date,
        )

    except Weather_Service.LocationNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

    except Weather_Service.WeatherServiceError as e:
        raise HTTPException(status_code=503, detail=str(e))

    if not daily:
        raise HTTPException(
            status_code=400,
            detail="No weather data available for that date range"
        )

    record = models.WeatherRecord(
        location_query=payload.location_query,
        resolved_name=loc["name"],
        latitude=loc["latitude"],
        longitude=loc["longitude"],
        start_date=payload.start_date,
        end_date=payload.end_date,
        weather_data=json.dumps(daily),
    )

    try:
        db.add(record)
        db.commit()
        db.refresh(record)

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to save the record."
        )

    return _serialize(record)


@app.get("/records", response_model=list[schemas.WeatherRecordOut])
def list_records(db: Session = Depends(get_db)):
    records = db.query(models.WeatherRecord).all()
    return [_serialize(r) for r in records]


@app.get("/records/{record_id}", response_model=schemas.WeatherRecordOut)
def get_record(record_id: int, db: Session = Depends(get_db)):
    record = db.query(models.WeatherRecord).filter(models.WeatherRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    return _serialize(record)


@app.put("/records/{record_id}", response_model=schemas.WeatherRecordOut)
async def update_record(record_id: int, payload: schemas.WeatherRecordUpdate, db: Session = Depends(get_db)):
    record = db.query(models.WeatherRecord).filter(models.WeatherRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    new_location = payload.location_query or record.location_query
    new_start = payload.start_date or record.start_date
    new_end = payload.end_date or record.end_date
    if new_end < new_start:
        raise HTTPException(status_code=400, detail="end_date must be on or after start_date")

    # If location or dates changed, re-fetch weather data so it stays accurate
    if (payload.location_query, payload.start_date, payload.end_date) != (None, None, None):
        try:
            loc = await Weather_Service.geocode_location(new_location)

            daily = await Weather_Service.get_daily_range(
                loc["latitude"],
                loc["longitude"],
                new_start,
                new_end,
            )

        except Weather_Service.LocationNotFoundError as e:
            raise HTTPException(status_code=404, detail=str(e))

        except Weather_Service.WeatherServiceError as e:
            raise HTTPException(status_code=503, detail=str(e))
        record.resolved_name = loc["name"]
        record.latitude = loc["latitude"]
        record.longitude = loc["longitude"]
        record.weather_data = json.dumps(daily)

    record.location_query = new_location
    record.start_date = new_start
    record.end_date = new_end

    try:
        db.commit()
        db.refresh(record)

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to update the record."
        )

    return _serialize(record)


@app.delete("/records/{record_id}")
def delete_record(record_id: int, db: Session = Depends(get_db)):
    record = db.query(models.WeatherRecord).filter(models.WeatherRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    try:
        db.delete(record)
        db.commit()

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to delete the record."
        )

    return {"detail": "deleted"}


# ---------- Export endpoint (Assessment 2, section 2.3) ----------

@app.get("/records/{record_id}/export")
def export_record(record_id: int, format: str = Query("json", enum=["json", "csv", "xml", "markdown"]), db: Session = Depends(get_db)):
    record = db.query(models.WeatherRecord).filter(models.WeatherRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    data = _serialize(record)

    if format == "json":
        content = json.dumps(data, default=str, indent=2)
        media_type = "application/json"

    elif format == "csv":
        buf = io.StringIO()
        writer = csv.DictWriter(buf, fieldnames=["date", "temp_max", "temp_min"])
        writer.writeheader()
        for row in data["weather_data"]:
            writer.writerow(row)
        content = buf.getvalue()
        media_type = "text/csv"

    elif format == "xml":
        rows = "".join(
            f"<day><date>{d['date']}</date><temp_max>{d['temp_max']}</temp_max>"
            f"<temp_min>{d['temp_min']}</temp_min></day>"
            for d in data["weather_data"]
        )
        content = f"<record><location>{data['resolved_name']}</location>{rows}</record>"
        media_type = "application/xml"

    elif format == "markdown":
        lines = [f"# Weather Record: {data['resolved_name']}", "", "| Date | Max Temp | Min Temp |", "|---|---|---|"]
        for d in data["weather_data"]:
            lines.append(f"| {d['date']} | {d['temp_max']} | {d['temp_min']} |")
        content = "\n".join(lines)
        media_type = "text/markdown"

    return StreamingResponse(
        io.StringIO(content),
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename=record_{record_id}.{format}"},
    )


def _serialize(record: models.WeatherRecord) -> dict:
    return {
        "id": record.id,
        "location_query": record.location_query,
        "resolved_name": record.resolved_name,
        "latitude": record.latitude,
        "longitude": record.longitude,
        "start_date": record.start_date,
        "end_date": record.end_date,
        "weather_data": json.loads(record.weather_data),
    }