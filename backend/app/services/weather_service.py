from datetime import date
from typing import Any

import httpx

from app.services.travel_context_service import unavailable_weather

GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"
FORECAST_URL = "https://api.open-meteo.com/v1/forecast"

WEATHER_CODE_LABELS = {
    0: "clear sky",
    1: "mainly clear",
    2: "partly cloudy",
    3: "overcast",
    45: "fog",
    48: "depositing rime fog",
    51: "light drizzle",
    53: "moderate drizzle",
    55: "dense drizzle",
    61: "slight rain",
    63: "moderate rain",
    65: "heavy rain",
    71: "slight snow",
    73: "moderate snow",
    75: "heavy snow",
    80: "slight rain showers",
    81: "moderate rain showers",
    82: "violent rain showers",
    95: "thunderstorm",
}


def get_weather_context(destination: str, start_date: date, end_date: date) -> dict[str, Any]:
    try:
        with httpx.Client(timeout=6.0) as client:
            location = geocode_destination(client, destination)
            if location is None:
                return unavailable_weather("Weather data is unavailable because the destination could not be located.")

            forecast = fetch_forecast(client, location, start_date, end_date)
            if not forecast:
                return unavailable_weather("Weather data is unavailable for these travel dates.")
            return summarize_forecast(forecast, location)
    except (httpx.HTTPError, KeyError, TypeError, ValueError):
        return unavailable_weather("Weather data is temporarily unavailable.")


def geocode_destination(client: httpx.Client, destination: str) -> dict[str, Any] | None:
    response = client.get(
        GEOCODING_URL,
        params={"name": destination, "count": 1, "language": "en", "format": "json"},
    )
    response.raise_for_status()
    results = response.json().get("results") or []
    return results[0] if results else None


def fetch_forecast(client: httpx.Client, location: dict[str, Any], start_date: date, end_date: date) -> dict[str, Any] | None:
    response = client.get(
        FORECAST_URL,
        params={
            "latitude": location["latitude"],
            "longitude": location["longitude"],
            "daily": "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max",
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "timezone": "auto",
        },
    )
    response.raise_for_status()
    daily = response.json().get("daily")
    return daily if daily and daily.get("time") else None


def summarize_forecast(forecast: dict[str, Any], location: dict[str, Any]) -> dict[str, Any]:
    max_temperatures = _numbers(forecast.get("temperature_2m_max"))
    min_temperatures = _numbers(forecast.get("temperature_2m_min"))
    rain_probabilities = _numbers(forecast.get("precipitation_probability_max"))
    wind_speeds = _numbers(forecast.get("wind_speed_10m_max"))
    weather_codes = [code for code in forecast.get("weather_code", []) if code is not None]

    temperature = None
    if max_temperatures and min_temperatures:
        temperature = {
            "min_c": round(min(min_temperatures)),
            "max_c": round(max(max_temperatures)),
        }

    top_condition = most_common_condition(weather_codes)
    rain_probability = round(max(rain_probabilities)) if rain_probabilities else None
    wind_speed = round(max(wind_speeds)) if wind_speeds else None

    return {
        "available": True,
        "summary": build_weather_summary(temperature, top_condition, rain_probability, wind_speed),
        "location_name": location.get("name"),
        "country": location.get("country"),
        "expected_temperature": temperature,
        "conditions": top_condition,
        "rain_probability": rain_probability,
        "wind_conditions": f"Up to {wind_speed} km/h" if wind_speed is not None else None,
    }


def most_common_condition(weather_codes: list[int]) -> str | None:
    if not weather_codes:
        return None
    most_common_code = max(set(weather_codes), key=weather_codes.count)
    return WEATHER_CODE_LABELS.get(most_common_code, "variable conditions")


def build_weather_summary(
    temperature: dict[str, int] | None,
    condition: str | None,
    rain_probability: int | None,
    wind_speed: int | None,
) -> str:
    parts = []
    if temperature:
        parts.append(f"{temperature['min_c']}C to {temperature['max_c']}C")
    if condition:
        parts.append(condition)
    if rain_probability is not None:
        parts.append(f"{rain_probability}% rain probability")
    if wind_speed is not None:
        parts.append(f"winds up to {wind_speed} km/h")
    return ", ".join(parts) if parts else "Weather details are limited for these dates."


def _numbers(values: list[Any] | None) -> list[float]:
    return [float(value) for value in values or [] if value is not None]
