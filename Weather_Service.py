"""
Talks to the Open-Meteo API (no API key required):
- Geocoding: resolves a free-text location into lat/lon (this is also our
  "fuzzy match / validate the location really exists" logic).
- Forecast: current weather + 5-day forecast.
- Archive: historical daily temps, for date ranges in the past.

Docs: https://open-meteo.com/en/docs
"""
import httpx
from datetime import date
import os
from dotenv import load_dotenv
load_dotenv()

GEOCODE_URL = os.getenv("GEOCODE_URL")
FORECAST_URL = os.getenv("FORECAST_URL")
ARCHIVE_URL = os.getenv("ARCHIVE_URL")
AIR_QUALITY_URL = os.getenv("AIR_QUALITY_URL")


class LocationNotFoundError(Exception):
    pass
class WeatherServiceError(Exception):
    pass


async def geocode_location(query: str) -> dict:
    """
    Resolve free-text (city, zip, landmark, 'lat,lon') into coordinates.
    Raises LocationNotFoundError if nothing matches — this is our
    location-validation / fuzzy-match step.
    """
    query = query.strip()

    # Support raw "lat,lon" input directly
    if "," in query:
        parts = query.split(",")
        if len(parts) == 2:
            try:
                lat, lon = float(parts[0]), float(parts[1])
                return {"name": f"{lat},{lon}", "latitude": lat, "longitude": lon}
            except ValueError:
                pass  # fall through to geocoding search

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                GEOCODE_URL,
                params={"name": query, "count": 1}
            )
            resp.raise_for_status()
            data = resp.json()

    except (httpx.RequestError, httpx.HTTPStatusError):
        raise WeatherServiceError(
            "Unable to connect to the weather service."
        )

    results = data.get("results")
    if not results:
        raise LocationNotFoundError(f"Could not resolve location: '{query}'")

    top = results[0]
    label = f"{top['name']}, {top.get('admin1', '')} {top.get('country', '')}".strip()
    return {"name": label, "latitude": top["latitude"], "longitude": top["longitude"]}


async def get_current_and_forecast(lat: float, lon: float) -> dict:
    """Current conditions + 5-day daily forecast."""
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": (
            "temperature_2m,"
            "weather_code,"
            "wind_speed_10m,"
            "relative_humidity_2m"
        ),
        "daily": (
            "temperature_2m_max,"
            "temperature_2m_min,"
            "weather_code,"
            "uv_index_max"
        ),
        "forecast_days": 5,
        "timezone": "auto",
    }
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(FORECAST_URL, params=params)
            resp.raise_for_status()
            return resp.json()

    except (httpx.RequestError, httpx.HTTPStatusError):
        raise WeatherServiceError(
            "Unable to connect to the weather service."
        )


async def get_daily_range(lat: float, lon: float, start: date, end: date) -> list:
    """
    Daily max/min temps for an arbitrary date range.
    Uses the archive endpoint for past dates and the forecast endpoint for
    upcoming ones — Open-Meteo splits these across two APIs.
    """
    today = date.today()
    results = []

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:

            if start < today:
                resp = await client.get(
                    ARCHIVE_URL,
                    params={
                        "latitude": lat,
                        "longitude": lon,
                        "start_date": start.isoformat(),
                        "end_date": min(end, today).isoformat(),
                        "daily": "temperature_2m_max,temperature_2m_min",
                        "timezone": "auto",
                    },
                )
                resp.raise_for_status()
                results.append(resp.json().get("daily", {}))

            if end >= today:
                resp = await client.get(
                    FORECAST_URL,
                    params={
                        "latitude": lat,
                        "longitude": lon,
                        "start_date": max(start, today).isoformat(),
                        "end_date": end.isoformat(),
                        "daily": "temperature_2m_max,temperature_2m_min",
                        "timezone": "auto",
                    },
                )
                resp.raise_for_status()
                results.append(resp.json().get("daily", {}))

    except (httpx.RequestError, httpx.HTTPStatusError):
        raise WeatherServiceError(
            "Unable to retrieve weather data from Open-Meteo."
        )

    # Merge the (up to 2) daily blocks into a flat list of {date, temp_max, temp_min}
    merged = []
    for block in results:
        dates = block.get("time", [])
        tmax = block.get("temperature_2m_max", [])
        tmin = block.get("temperature_2m_min", [])
        for d, hi, lo in zip(dates, tmax, tmin):
            merged.append({"date": d, "temp_max": hi, "temp_min": lo})
    return merged


async def get_air_quality(lat: float, lon: float) -> dict:
    """
    Fetch current air quality information for a location.
    """

    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "european_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone",
        "timezone": "auto",
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(AIR_QUALITY_URL, params=params)
            response.raise_for_status()
            data = response.json()

    except (httpx.RequestError, httpx.HTTPStatusError):
        raise WeatherServiceError("Unable to retrieve air quality data.")

    return data.get("current", {})

def get_google_maps_url(lat: float, lon: float) -> str:
    return f"https://www.google.com/maps?q={lat},{lon}"
def get_youtube_url(location: str) -> str:
    return (
        f"https://www.youtube.com/results?search_query={location}"
    )
def weather_advice(temp: float) -> list[str]:

    advice = []

    if temp >= 35:
        advice.extend([
            "Stay hydrated.",
            "Wear light clothing.",
            "Avoid prolonged outdoor activity during the afternoon."
        ])

    elif temp <= 10:
        advice.extend([
            "Wear warm clothing.",
            "Be cautious of cold weather."
        ])

    else:
        advice.append(
            "Weather conditions are comfortable."
        )

    return advice
def get_aqi_description(aqi: int) -> str:
    if aqi <= 20:
        return "Excellent"

    elif aqi <= 40:
        return "Good"

    elif aqi <= 60:
        return "Moderate"

    elif aqi <= 80:
        return "Poor"

    elif aqi <= 100:
        return "Very Poor"

    return "Extremely Poor"
def get_air_quality_advice(aqi: int) -> str:
    if aqi <= 20:
        return "Excellent air quality. Outdoor activities are ideal."

    elif aqi <= 40:
        return "Air quality is good. Most people can enjoy outdoor activities."

    elif aqi <= 60:
        return "Sensitive individuals should limit prolonged outdoor exertion."

    elif aqi <= 80:
        return "Consider reducing outdoor activities, especially if you have asthma."

    elif aqi <= 100:
        return "Avoid strenuous outdoor exercise."

    return "Stay indoors if possible and wear a mask when outside."
def get_uv_advice(uv):
    if uv is None:
        return "UV data unavailable."

    if uv <= 2:
        return "Low UV exposure. Minimal protection needed."

    elif uv <= 5:
        return "Moderate UV exposure. Consider sunglasses and sunscreen."

    elif uv <= 7:
        return "High UV exposure. Use sunscreen and seek shade during midday."

    elif uv <= 10:
        return "Very High UV exposure. Wear protective clothing and avoid prolonged sun exposure."

    else:
        return "Extreme UV exposure. Avoid going outdoors unless absolutely necessary."
