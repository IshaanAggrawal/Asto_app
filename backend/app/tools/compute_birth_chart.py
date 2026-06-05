from langchain_core.tools import tool
import json
from datetime import datetime
import logging

# ── Swiss Ephemeris path must be set BEFORE any immanuel import ───────────────
# immanuel bundles its own .se1 data files; we just need to tell pyswisseph
# where they live before any chart object is instantiated.
import swisseph as _swe
from immanuel.setup import settings as _imm_settings
_swe.set_ephe_path(_imm_settings._file_path)
del _swe, _imm_settings
# ─────────────────────────────────────────────────────────────────────────────

from immanuel import charts
from immanuel.classes.serialize import ToJSON
from functools import lru_cache

logger = logging.getLogger(__name__)

@lru_cache(maxsize=128)
def _compute_birth_chart(date_str: str, time_str: str, lat: float, lng: float, timezone: str) -> dict:
    try:
        # Validate date
        try:
            birth_date = datetime.strptime(date_str, "%Y-%m-%d")
            if birth_date > datetime.now():
                return {"error": "Birth date cannot be in the future"}
        except ValueError:
            return {"error": f"Invalid date format: {date_str}. Expected YYYY-MM-DD."}

        # Handle time
        time_unknown = False
        if time_str.lower() == "unknown":
            time_unknown = True
            time_str = "12:00"
        elif ":" not in time_str:
            time_str = "12:00"
        
        # Validate timezone
        from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
        timezone = str(timezone)  # Ensure it's a string, not int
        try:
            ZoneInfo(timezone)
        except (ZoneInfoNotFoundError, KeyError, Exception):
            logger.warning(f"Invalid timezone '{timezone}', falling back to UTC")
            timezone = "UTC"
            
        date_time_str = f"{date_str} {time_str}"
        
        # Calculate chart using immanuel
        native = charts.Subject(
            date_time=date_time_str,
            latitude=lat,
            longitude=lng,
            timezone=timezone
        )
        natal = charts.Natal(native)
        
        # Serialize to JSON directly from the object
        data = json.loads(natal.to_json())
        
        # Structure the response
        result = {
            "time_unknown": time_unknown,
            "houses": []
        }
        
        # Extract planets from objects
        if "objects" in data:
            for obj_key, obj_data in data["objects"].items():
                planet_name = obj_data.get("name", "")
                if planet_name.lower() in ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto", "north node", "chiron"]:
                    result[planet_name.lower()] = {
                        "sign": obj_data.get("sign", {}).get("name", ""),
                        "degree": obj_data.get("longitude", {}).get("raw", 0.0),
                        "house": obj_data.get("house", {}).get("number", 0),
                        "retrograde": obj_data.get("speed", 0.0) < 0
                    }
                    
        # Extract houses and angles
        if "houses" in data:
            for house_num, house_data in data["houses"].items():
                h_number = house_data.get("number", 0)
                result["houses"].append({
                    "number": h_number,
                    "sign": house_data.get("sign", {}).get("name", ""),
                    "degree": house_data.get("longitude", {}).get("raw", 0.0)
                })
                # Set rising (Ascendant) and midheaven
                if str(h_number) == "1":
                    result["rising"] = {
                        "sign": house_data.get("sign", {}).get("name", ""),
                        "degree": house_data.get("longitude", {}).get("raw", 0.0)
                    }
                elif str(h_number) == "10":
                    result["midheaven"] = {
                        "sign": house_data.get("sign", {}).get("name", ""),
                        "degree": house_data.get("longitude", {}).get("raw", 0.0)
                    }
                    
        return result
    except Exception as e:
        logger.error(f"Error computing birth chart: {e}")
        return {"error": f"An error occurred while computing the birth chart: {str(e)}"}

@tool("compute_birth_chart")
def compute_birth_chart(date_str: str, time_str: str, lat: float, lng: float, timezone: str) -> dict:
    """
    Compute natal birth chart using Swiss Ephemeris.
    date_str: YYYY-MM-DD
    time_str: HH:MM (24h) or "unknown" — if unknown use 12:00 and flag it
    lat/lng: from geocode_place
    timezone: IANA string e.g. "Asia/Kolkata"
    """
    return _compute_birth_chart(date_str, time_str, lat, lng, timezone)
