from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from typing import Optional
from app.models.schemas import ChartRequest, ChatRequest
import uuid
import logging

from app.tools.geocode_place import geocode_place
from app.tools.compute_birth_chart import compute_birth_chart
from app.tools.get_daily_transits import get_daily_transits
from app.agent.state import AstroAgentState
from app.api.streaming import stream_agent
from langchain_core.messages import HumanMessage

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api")

# In-memory dictionary acting as the ephemeral database for natal charts.
CHART_STORE = {}



@router.post("/chart")
async def create_chart(request: ChartRequest):
    """Generates and stores a birth chart based on user details."""
    try:
        # 1. Geocode the location
        geo_result = geocode_place.invoke({"place_name": request.place})
        if "error" in geo_result:
            raise HTTPException(status_code=400, detail=geo_result["error"])
            
        # 2. Compute birth chart
        chart_result = compute_birth_chart.invoke({
            "date_str": request.dob,
            "time_str": request.tob,
            "lat": geo_result["lat"],
            "lng": geo_result["lng"],
            "timezone": geo_result["timezone"]
        })
        
        if "error" in chart_result:
            raise HTTPException(status_code=400, detail=chart_result["error"])
            
        # 3. Store in ephemeral database
        chart_id = str(uuid.uuid4())
        
        # Construct agent payload
        full_chart_data = {
            "birth_details": {
                "name": request.name,
                "dob": request.dob,
                "tob": request.tob,
                "place": request.place,
                "lat": geo_result["lat"],
                "lng": geo_result["lng"],
                "timezone": geo_result["timezone"]
            },
            "chart": chart_result
        }
        
        CHART_STORE[chart_id] = full_chart_data
        
        return {
            "chart_id": chart_id,
            "chart_data": chart_result
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating chart: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/chat")
async def chat_endpoint(request: ChatRequest):
    """Main streaming endpoint for chat interactions."""
    try:
        chart_data = None
        birth_details = {}
        
        if request.chart_id and request.chart_id in CHART_STORE:
            stored = CHART_STORE[request.chart_id]
            chart_data = stored["chart"]
            birth_details = stored["birth_details"]
            
        # Initialize graph state with current user context and message payload.
        state: AstroAgentState = {
            "messages": [HumanMessage(content=request.message)],
            "birth_details": birth_details,
            "chart_data": chart_data,
            "intent": None,
            "conversation_id": request.conversation_id,
            "tool_calls_made": 0,
            "conversation_summary": "",  # empty on first message; grows over time
            "language": request.language,
        }
        
        return StreamingResponse(
            stream_agent(state, request.conversation_id),
            media_type="text/event-stream"
        )
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/transits")
async def get_transits(chart_id: str, date: Optional[str] = None):
    """Returns today's transits for a given chart."""
    if chart_id not in CHART_STORE:
        raise HTTPException(status_code=404, detail="Chart not found")
        
    stored = CHART_STORE[chart_id]
    chart_data = stored["chart"]
    
    try:
        transits = get_daily_transits.invoke({
            "natal_chart": chart_data,
            "date_str": date
        })
        
        if "error" in transits:
            raise HTTPException(status_code=400, detail=transits["error"])
            
        return transits
    except Exception as e:
        logger.error(f"Error computing transits: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
