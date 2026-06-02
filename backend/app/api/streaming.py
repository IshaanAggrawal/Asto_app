import json
from app.agent.state import AstroAgentState
from app.agent.graph import graph
import logging

logger = logging.getLogger(__name__)

def stream_agent(state: AstroAgentState, thread_id: str):
    """Synchronous generator orchestrating LangGraph execution and emitting Server-Sent Events (SSE) for real-time clients."""
    try:
        config = {"configurable": {"thread_id": thread_id}}

        for mode, chunk in graph.stream(
            state,
            config=config,
            stream_mode=["messages", "updates"]
        ):
            if mode == "messages":
                message_chunk, metadata = chunk
                node = metadata.get("langgraph_node")
                
                if node == "reasoner_node":
                    from langchain_core.messages import AIMessageChunk
                    if isinstance(message_chunk, AIMessageChunk) and message_chunk.content:
                        if isinstance(message_chunk.content, str):
                            event = {"type": "text", "content": message_chunk.content}
                            yield f"data: {json.dumps(event)}\n\n"
                        elif isinstance(message_chunk.content, list):
                            for block in message_chunk.content:
                                if isinstance(block, dict) and block.get("type") == "text":
                                    event = {"type": "text", "content": block.get("text", "")}
                                    yield f"data: {json.dumps(event)}\n\n"
            
            elif mode == "updates":
                node_name = list(chunk.keys())[0] if chunk else "unknown"
                if node_name == "tool_node":
                    # Emit completion event for active tool invocation
                    messages = chunk.get("tool_node", {}).get("messages", [])
                    for msg in messages:
                        if hasattr(msg, "name"):
                            event = {"type": "tool_call", "node": msg.name, "status": "done"}
                            yield f"data: {json.dumps(event)}\n\n"
                elif node_name == "reasoner_node":
                    # Parse reasoner output to intercept requested tool executions
                    messages = chunk.get(node_name, {}).get("messages", [])
                    if messages:
                        last_message = messages[-1]
                        if hasattr(last_message, "tool_calls") and last_message.tool_calls:
                            for tc in last_message.tool_calls:
                                event = {
                                    "type": "tool_call", 
                                    "tool": tc.get("name"), 
                                    "status": "running"
                                }
                                yield f"data: {json.dumps(event)}\n\n"
        
        # Transmit terminal signal to close client SSE connection
        yield f"data: {json.dumps({'type': 'done'})}\n\n"
        
    except Exception as e:
        logger.error(f"Error in streaming agent: {e}")
        error_event = {"type": "error", "content": "An internal error occurred."}
        yield f"data: {json.dumps(error_event)}\n\n"
        yield f"data: {json.dumps({'type': 'done'})}\n\n"
