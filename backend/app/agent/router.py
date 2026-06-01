from app.agent.state import AstroAgentState
import logging

logger = logging.getLogger(__name__)

def should_continue(state: AstroAgentState) -> str:
    """
    Conditional edge function that determines what to do after the reasoner_node.
    Returns the name of the next node to execute.
    """
    messages = state.get("messages", [])
    tool_calls_made = state.get("tool_calls_made", 0)
    
    if not messages:
        return "END"
        
    last_message = messages[-1]
    
    # If the LLM makes a tool call, we must route to the tool_node
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        # Guard against infinite loops
        if tool_calls_made >= 8:
            logger.warning(f"Tool call limit reached ({tool_calls_made}). Ending graph execution.")
            return "END"
        return "tool_node"
        
    # Otherwise, the LLM is done responding
    return "END"
