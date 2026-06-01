from typing import Annotated, TypedDict
from langgraph.graph.message import add_messages

class AstroAgentState(TypedDict):
    """Global state representation for the AstroAgent LangGraph execution."""
    messages: Annotated[list, add_messages]
    birth_details: dict          # {name, dob, tob, place, lat, lng, timezone}
    chart_data: dict | None      # Computed natal chart JSON
    intent: str | None           # Detected user intent
    conversation_id: str
    tool_calls_made: int         # Execution safeguard counter
    conversation_summary: str    # Rolling context summary
    language: str                # User language preference
