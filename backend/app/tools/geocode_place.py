from langchain_core.tools import tool
from geopy.geocoders import Nominatim
from timezonefinder import TimezoneFinder
import logging

logger = logging.getLogger(__name__)

@tool
def geocode_place(place_name: str) -> dict:
    """Resolve a place name to lat/lng/timezone. Required before computing birth chart."""
    try:
        geolocator = Nominatim(user_agent="astroagent/1.0")
        location = geolocator.geocode(place_name, timeout=10)
        
        if not location:
            return {"error": f"Could not find location: {place_name}. Please be more specific."}
            
        tf = TimezoneFinder()
        timezone = tf.timezone_at(lng=location.longitude, lat=location.latitude)
        
        if not timezone:
            return {"error": f"Could not determine timezone for location: {place_name}."}
            
        return {
            "lat": location.latitude,
            "lng": location.longitude,
            "timezone": timezone,
            "display_name": location.address
        }
    except Exception as e:
        logger.error(f"Geocoding error: {e}")
        return {"error": f"An error occurred while looking up the location: {str(e)}"}
