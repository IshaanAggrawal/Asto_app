from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode
from langgraph.checkpoint.sqlite import SqliteSaver
from app.agent.state import AstroAgentState
from app.agent.nodes import router_node, reasoner_node, tools, editor_node
from app.agent.router import should_continue
import os
import sqlite3

def build_graph():
    """Builds and compiles the AstroAgent LangGraph."""
    
    builder = StateGraph(AstroAgentState)
    
    # Add nodes
    builder.add_node("router_node", router_node)
    builder.add_node("reasoner_node", reasoner_node)
    builder.add_node("editor_node", editor_node)
    
    # Use LangGraph's built-in ToolNode for the tools
    tool_node = ToolNode(tools)
    builder.add_node("tool_node", tool_node)
    
    # Define edges
    builder.add_edge(START, "router_node")
    
    # router_node just sets intent and passes through to reasoner unconditionally
    builder.add_edge("router_node", "reasoner_node")
    
    # reasoner_node leads to a conditional edge
    builder.add_conditional_edges(
        "reasoner_node",
        should_continue,
        {
            "tool_node": "tool_node",
            "END": "editor_node"
        }
    )
    
    builder.add_edge("editor_node", END)
    
    # After tools run, loop back to the reasoner
    builder.add_edge("tool_node", "reasoner_node")
    
    # Compile the graph with memory
    db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "checkpoints.sqlite")
    
    # Ensure data directory exists
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    
    conn = sqlite3.connect(db_path, check_same_thread=False)
    memory = SqliteSaver(conn)
    return builder.compile(checkpointer=memory)

# Provide a ready-to-use graph instance
graph = build_graph()
