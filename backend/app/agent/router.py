from app.agent.state import AstroAgentState
import logging

logger = logging.getLogger(__name__)

def should_continue(state: AstroAgentState) -> str:
    messages = state.get("messages", [])
    tool_calls_made = state.get("tool_calls_made", 0)
    
    if not messages:
        return "END"
        
    last_message = messages[-1]
    
    # Route to tools node if LLM requests actions.
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        # Enforce execution limits to prevent infinite loops.
        if tool_calls_made >= 8:
            logger.warning(f"Tool call limit reached ({tool_calls_made}). Ending graph execution.")
            return "END"
        return "tool_node"
        
    # Terminate graph execution when LLM completes its response.
    return "END"
