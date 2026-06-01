import os
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_groq import ChatGroq
from app.agent.state import AstroAgentState
from app.tools.geocode_place import geocode_place
from app.tools.compute_birth_chart import compute_birth_chart
from app.tools.get_daily_transits import get_daily_transits
from app.tools.knowledge_lookup import knowledge_lookup
from dotenv import load_dotenv

load_dotenv()

# We use ChatGroq instead of ChatAnthropic
# Router can be a smaller/faster model
router_model = ChatGroq(
    model=os.getenv("ROUTER_MODEL", "llama3-8b-8192"),
    temperature=0
)

# Main reasoner should be more capable
reasoner_model = ChatGroq(
    model=os.getenv("LLM_MODEL", "llama3-70b-8192"),
    temperature=0.7
)

# Bind tools to the reasoner
tools = [geocode_place, compute_birth_chart, get_daily_transits, knowledge_lookup]
reasoner_with_tools = reasoner_model.bind_tools(tools)

def router_node(state: AstroAgentState):
    """Classifies the intent of the user's latest message."""
    messages = state.get("messages", [])
    if not messages:
        return {"intent": "free_question"}
        
    latest_message = messages[-1].content
    
    prompt = f"""Classify the following user message into exactly ONE of these categories:
- chart_request (user wants to calculate or know about their birth chart)
- daily_horoscope (user wants to know about their daily transits or today's energy)
- free_question (general astrology questions, meanings, or anything else)

User message: "{latest_message}"

Reply with ONLY the category label."""

    response = router_model.invoke([HumanMessage(content=prompt)])
    
    intent = response.content.strip().lower()
    if intent not in ["chart_request", "daily_horoscope", "free_question"]:
        intent = "free_question" # Fallback
        
    return {"intent": intent}

def reasoner_node(state: AstroAgentState):
    """The main LLM node that decides which tools to call and generates the response."""
    messages = state.get("messages", [])
    chart_data = state.get("chart_data")
    intent = state.get("intent", "free_question")
    
    # Increment tool calls counter
    tool_calls_made = state.get("tool_calls_made", 0)
    
    # Format the birth chart data if available
    birth_details = state.get("birth_details")
    birth_context = "No birth details provided."
    if birth_details:
        birth_context = f"User's Birth Details:\nName: {birth_details.get('name')}\nDOB: {birth_details.get('dob')}\nTime: {birth_details.get('tob')}\nPlace: {birth_details.get('place')}"

    chart_context = "No birth chart data available for the user."
    if chart_data and "error" not in chart_data:
        import json
        # Provide the full chart data as a formatted JSON string so the LLM can see all planets and houses
        chart_context = f"User's Birth Chart:\n{json.dumps(chart_data, indent=2)}"
    
    from datetime import datetime
    today_str = datetime.now().strftime("%Y-%m-%d")
    
    system_prompt = f"""You are Aradhana, a warm and thoughtful astrology companion. You interpret birth charts and planetary transits with care and nuance.

Today's Date: {today_str}

{birth_context}

{chart_context}

HARD RULES — never break these:
- Never give medical diagnoses or health predictions.
- Never give financial or investment advice.
- Never give legal advice.
- Never claim readings are certainties — always frame as tendencies and invitations for reflection.
- If asked for certainty ("will I definitely get the job?"), gently redirect: "Astrology reveals tendencies, not fixed outcomes..."

The user's intent was classified as: {intent}.
If they ask for their birth chart or transits and we don't have their birth details, ASK THE USER for their birth date (YYYY-MM-DD), birth time, and birth place. Do NOT call geocode_place or compute_birth_chart with fake or placeholder data.
If we DO have their birth details but no chart data, use geocode_place and compute_birth_chart to get it.
If they ask for daily transits and we have their chart, use the get_daily_transits tool.
If they ask about meanings of astrological concepts, use the knowledge_lookup tool to search your knowledge base."""

    # Prepend the system message to the message history
    sys_msg = SystemMessage(content=system_prompt)
    full_messages = [sys_msg] + messages
    
    response = reasoner_with_tools.invoke(full_messages)
    
    return {
        "messages": [response],
        "tool_calls_made": tool_calls_made + 1 if response.tool_calls else tool_calls_made
    }
