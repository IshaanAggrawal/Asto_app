import os
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langgraph.graph.message import AnyMessage
from app.agent.state import AstroAgentState
from app.tools.geocode_place import geocode_place
from app.tools.compute_birth_chart import compute_birth_chart
from app.tools.get_daily_transits import get_daily_transits
from app.tools.knowledge_lookup import knowledge_lookup
from app.agent.prompts import get_summarize_prompt, get_router_prompt, get_reasoner_system_prompt
from langchain_groq import ChatGroq
from dotenv import load_dotenv

load_dotenv()

# Instantiates the LLMs for fast routing and deep reasoning.
router_model = ChatGroq(
    model=os.getenv("ROUTER_MODEL", "llama3-8b-8192"),
    temperature=0
)

reasoner_model = ChatGroq(
    model=os.getenv("LLM_MODEL", "llama3-70b-8192"),
    temperature=0.7
)

# Binds astrology tools to the reasoning engine.
tools = [geocode_place, compute_birth_chart, get_daily_transits, knowledge_lookup]
reasoner_with_tools = reasoner_model.bind_tools(tools)

# Keeps the last 6 messages in context for LLM memory limit management.
RECENT_MESSAGES_TO_KEEP = 6


def _summarize_messages(messages: list, existing_summary: str) -> str:
    """Summarizes older conversation history to save tokens."""
    if not messages:
        return existing_summary

    # Build a plain-text transcript from the messages to summarize
    transcript_lines = []
    for msg in messages:
        if isinstance(msg, HumanMessage):
            transcript_lines.append(f"User: {msg.content}")
        elif isinstance(msg, AIMessage):
            # Only include text content, skip tool call blobs
            content = msg.content if isinstance(msg.content, str) else ""
            if content:
                transcript_lines.append(f"Aradhana: {content}")

    if not transcript_lines:
        return existing_summary

    transcript = "\n".join(transcript_lines)

    prefix = ""
    if existing_summary:
        prefix = f"Previous summary:\n{existing_summary}\n\nNew messages to add:\n"
    else:
        prefix = "Conversation so far:\n"

    prompt = get_summarize_prompt(prefix, transcript)

    try:
        result = router_model.invoke([HumanMessage(content=prompt)])
        return result.content.strip()
    except Exception:
        # If summarization fails, just return the existing summary unchanged
        return existing_summary


def _prepare_messages_for_llm(
    messages: list,
    conversation_summary: str
) -> tuple[list, str]:
    """Compresses old messages into a rolling summary while preserving recent chat history."""
    if len(messages) <= RECENT_MESSAGES_TO_KEEP:
        return messages, conversation_summary

    # Split: old messages to summarize, recent messages to keep verbatim
    old_messages = messages[:-RECENT_MESSAGES_TO_KEEP]
    recent_messages = messages[-RECENT_MESSAGES_TO_KEEP:]

    # Update the rolling summary with the old messages
    updated_summary = _summarize_messages(old_messages, conversation_summary)

    return recent_messages, updated_summary


def router_node(state: AstroAgentState):
    """Classifies the intent of the user's latest message."""
    messages = state.get("messages", [])
    if not messages:
        return {"intent": "free_question"}

    latest_message = messages[-1].content

    prompt = get_router_prompt(latest_message)

    response = router_model.invoke([HumanMessage(content=prompt)])

    intent = response.content.strip().lower()
    if "chart_request" in intent:
        intent = "chart_request"
    elif "daily_horoscope" in intent:
        intent = "daily_horoscope"
    else:
        intent = "free_question"  # Fallback

    return {"intent": intent}


def reasoner_node(state: AstroAgentState):
    """Core reasoning engine that manages context limits before invoking the primary LLM."""
    messages = state.get("messages", [])
    chart_data = state.get("chart_data")
    intent = state.get("intent", "free_question")
    tool_calls_made = state.get("tool_calls_made", 0)
    existing_summary = state.get("conversation_summary", "")

    # Generate dynamic context variables
    recent_messages, updated_summary = _prepare_messages_for_llm(
        messages, existing_summary
    )


    birth_details = state.get("birth_details")
    birth_context = "No birth details provided."
    if birth_details:
        birth_context = (
            f"User's Birth Details:\n"
            f"  Name: {birth_details.get('name')}\n"
            f"  DOB:  {birth_details.get('dob')}\n"
            f"  Time: {birth_details.get('tob')}\n"
            f"  Place: {birth_details.get('place')}"
        )

    chart_context = "No birth chart data available for the user."
    if chart_data and "error" not in chart_data:
        import json
        chart_context = f"User's Birth Chart:\n{json.dumps(chart_data, indent=2)}"

    # Inject summary of older messages if present
    summary_section = ""
    if updated_summary:
        summary_section = f"\nEarlier in this conversation (summarized):\n{updated_summary}\n"

    from datetime import datetime
    today_str = datetime.now().strftime("%Y-%m-%d")

    language_pref = state.get("language", "English")

    system_prompt = get_reasoner_system_prompt(
        language_pref=language_pref,
        today_str=today_str,
        birth_context=birth_context,
        chart_context=chart_context,
        summary_section=summary_section,
        intent=intent
    )

    sys_msg = SystemMessage(content=system_prompt)
    full_messages = [sys_msg] + recent_messages

    response = reasoner_with_tools.invoke(full_messages)

    return {
        "messages": [response],
        "tool_calls_made": tool_calls_made + 1 if response.tool_calls else tool_calls_made,
        # Persist the updated summary back to state
        "conversation_summary": updated_summary,
    }
