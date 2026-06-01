from pydantic import BaseModel
from typing import Optional

class ChartRequest(BaseModel):
    name: str
    dob: str
    tob: str
    place: str

class ChatRequest(BaseModel):
    message: str
    chart_id: Optional[str] = None
    conversation_id: str
    language: Optional[str] = "English"
