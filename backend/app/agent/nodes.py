import os
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langchain_groq import ChatGroq
from app.agent.state import AstroAgentState
from app.tools.geocode_place import geocode_place
from app.tools.compute_birth_chart import compute_birth_chart
from app.tools.get_daily_transits import get_daily_transits
from app.tools.knowledge_lookup import knowledge_lookup
from dotenv import load_dotenv

load_dotenv()

# ── Models ────────────────────────────────────────────────────────────────────
# Small fast model for routing and summarization
router_model = ChatGroq(
    model=os.getenv("ROUTER_MODEL", "llama3-8b-8192"),
    temperature=0
)

# Capable model for main reasoning
reasoner_model = ChatGroq(
    model=os.getenv("LLM_MODEL", "llama3-70b-8192"),
    temperature=0.7
)

# ── Tools ─────────────────────────────────────────────────────────────────────
tools = [geocode_place, compute_birth_chart, get_daily_transits, knowledge_lookup]
reasoner_with_tools = reasoner_model.bind_tools(tools)

# ── Constants ──────────────────────────────────────────────────────────────────
# Number of most-recent message pairs to keep verbatim.
# Everything older is compressed into conversation_summary.
RECENT_MESSAGES_TO_KEEP = 6   # ~3 human+AI turns


def _summarize_messages(messages: list, existing_summary: str) -> str:
    """
    Uses the fast router model to summarize older messages into a compact string.
    The existing summary is prepended so context accumulates correctly.
    """
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

    prompt = f"""{prefix}{transcript}

Summarize the above conversation in 3–5 bullet points. Focus on:
- The user's birth details if mentioned (name, DOB, birth place, birth time)
- Topics discussed (chart reading, transits, specific planets/signs)
- Any important insights or conclusions reached
- Any preferences or context the user shared

Be concise. This summary will be used as context for future responses."""

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
    """
    Implements the hybrid context strategy:
    - If total messages <= RECENT_MESSAGES_TO_KEEP: use all messages as-is
    - Otherwise: summarize the older ones, keep only the last N verbatim

    Returns:
        (recent_messages, updated_summary)
    """
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

    prompt = f"""Classify the following user message into exactly ONE of these categories:
- chart_request (user wants to calculate or know about their birth chart)
- daily_horoscope (user wants to know about their daily transits or today's energy)
- free_question (general astrology questions, meanings, or anything else)

User message: "{latest_message}"

Reply with ONLY the category label."""

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
    """
    The main LLM node. Applies hybrid context management before calling the LLM:
    - Keeps only the last RECENT_MESSAGES_TO_KEEP messages verbatim
    - Summarizes older messages into conversation_summary (stored in state)
    This prevents Groq token-limit errors in long conversations.
    """
    messages = state.get("messages", [])
    chart_data = state.get("chart_data")
    intent = state.get("intent", "free_question")
    tool_calls_made = state.get("tool_calls_made", 0)
    existing_summary = state.get("conversation_summary", "")

    # ── Hybrid context: compress old messages ─────────────────────────────────
    recent_messages, updated_summary = _prepare_messages_for_llm(
        messages, existing_summary
    )

    # ── Build system prompt ───────────────────────────────────────────────────
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

    system_prompt = f"""You are Aradhana, a warm and thoughtful astrology companion. You interpret birth charts and planetary transits with care and nuance.
You MUST reply to the user primarily in the following language/style: {language_pref}.

Today's Date: {today_str}

{birth_context}

{chart_context}
{summary_section}
HARD RULES — never break these:
- Never give medical diagnoses or health predictions.
- Never give financial or investment advice.
- Never give legal advice.
- Never claim readings are certainties — always frame as tendencies and invitations for reflection.
- If asked for certainty ("will I definitely get the job?"), gently redirect: "Astrology reveals tendencies, not fixed outcomes..."
- FORMATTING: If you generate a table, you MUST use strict Markdown table syntax with pipes `|` and a header separator row (e.g., `| Header 1 | Header 2 |` followed by `|---|---|`). Do NOT use tabs for alignment.

The user's intent was classified as: {intent}.
If they ask for their birth chart or transits and we don't have their birth details, ASK THE USER for their birth date (YYYY-MM-DD), birth time, and birth place. Do NOT call geocode_place or compute_birth_chart with fake or placeholder data.
If we DO have their birth details but no chart data, use geocode_place and compute_birth_chart to get it.
If they ask for daily transits and we have their chart, use the get_daily_transits tool.
If they ask about meanings of astrological concepts, use the knowledge_lookup tool."""

    sys_msg = SystemMessage(content=system_prompt)
    full_messages = [sys_msg] + recent_messages

    response = reasoner_with_tools.invoke(full_messages)

    return {
        "messages": [response],
        "tool_calls_made": tool_calls_made + 1 if response.tool_calls else tool_calls_made,
        # Persist the updated summary back to state
        "conversation_summary": updated_summary,
    }
