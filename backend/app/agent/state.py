from typing import Annotated, TypedDict
from langgraph.graph.message import add_messages

class AstroAgentState(TypedDict):
    """
    State definition for the AstroAgent LangGraph.
    This acts as the single source of truth across all nodes.
    """
    messages: Annotated[list, add_messages]
    birth_details: dict          # {name, dob, tob, place, lat, lng, timezone}
    chart_data: dict | None      # computed natal chart JSON
    intent: str | None           # "chart_request" | "daily_horoscope" | "free_question"
    conversation_id: str
    tool_calls_made: int         # guard: raise error if > 8
