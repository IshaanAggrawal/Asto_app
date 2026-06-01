from langchain_core.tools import tool

# Bootstrap ephemeris path before immanuel import (Windows path fix)
import swisseph as _swe
from immanuel.setup import settings as _imm_settings
_swe.set_ephe_path(_imm_settings._file_path)
del _swe, _imm_settings

from immanuel import charts, const
import json
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

@tool
def get_daily_transits(natal_chart: dict, date_str: str = None) -> dict:
    """
    Get current planetary transits and their aspects to the natal chart.
    natal_chart: output from compute_birth_chart
    date_str: YYYY-MM-DD, defaults to today
    """
    try:
        if not date_str:
            date_str = datetime.now().strftime("%Y-%m-%d")
            
        transits_result = {
            "date": date_str,
            "transits": [],
            "significant_transits": [],
            "overall_theme": ""
        }
        
        # We will manually calculate aspects since the exact natal chart format might vary slightly
        # For a full implementation, we would re-instantiate immanuel objects.
        # But we can calculate aspects purely mathematically.
        
        # Just getting the current transiting planets
        today_subject = charts.Subject(date_time=f"{date_str} 12:00", latitude=0.0, longitude=0.0)
        today_chart = charts.Natal(today_subject) # Treat today as a 'natal' chart for transit positions
        today_data = json.loads(today_chart.to_json())
        
        aspect_types = {
            "conjunction": {"angle": 0, "orb": 8, "meaning": "blends with"},
            "sextile": {"angle": 60, "orb": 6, "meaning": "harmonizes with"},
            "square": {"angle": 90, "orb": 8, "meaning": "challenges"},
            "trine": {"angle": 120, "orb": 8, "meaning": "flows easily with"},
            "opposition": {"angle": 180, "orb": 8, "meaning": "opposes"}
        }
        
        planets_to_check = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"]
        
        if "objects" in today_data:
            for t_obj_key, t_planet in today_data["objects"].items():
                t_planet_name = t_planet.get("name", "")
                t_name = t_planet_name.lower()
                if t_name not in planets_to_check: continue
                    
                t_deg = t_planet.get("longitude", {}).get("raw", 0.0)
            
            for n_planet_name in planets_to_check:
                if n_planet_name in natal_chart:
                    n_deg = natal_chart[n_planet_name].get("degree", 0.0)
                    
                    # Calculate angular distance
                    diff = abs(t_deg - n_deg) % 360
                    # Handle the fact that 359 is 1 degree away from 0
                    if diff > 180:
                        diff = 360 - diff
                        
                    # Check for aspects
                    for aspect_name, aspect_info in aspect_types.items():
                        if abs(diff - aspect_info["angle"]) <= aspect_info["orb"]:
                            orb_val = round(abs(diff - aspect_info["angle"]), 2)
                            
                            description = f"Transiting {t_name.capitalize()} {aspect_info['meaning']} your natal {n_planet_name.capitalize()}."
                            
                            transit_info = {
                                "transiting_planet": t_name.capitalize(),
                                "aspect": aspect_name,
                                "natal_planet": n_planet_name.capitalize(),
                                "orb": orb_val,
                                "description": description
                            }
                            transits_result["transits"].append(transit_info)
                            
                            # Determine if significant (tight orb < 2, or involving slow planets)
                            if orb_val <= 2.0 or t_name in ["jupiter", "saturn", "uranus", "neptune", "pluto"]:
                                transits_result["significant_transits"].append(transit_info)
                                
        # Sort significant transits by tightest orb
        transits_result["significant_transits"] = sorted(
            transits_result["significant_transits"], 
            key=lambda x: x["orb"]
        )[:3] # Keep top 3
        
        transits_result["overall_theme"] = "A time of movement and shifting energies. Pay attention to how the current cosmic weather interacts with your foundational traits."
        
        return transits_result
    except Exception as e:
        logger.error(f"Error computing daily transits: {e}")
        return {"error": f"An error occurred while computing daily transits: {str(e)}"}
