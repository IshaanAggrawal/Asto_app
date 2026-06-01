from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode
from langgraph.checkpoint.memory import MemorySaver
from app.agent.state import AstroAgentState
from app.agent.nodes import router_node, reasoner_node, tools
from app.agent.router import should_continue

def build_graph():
    """Builds and compiles the AstroAgent LangGraph."""
    
    builder = StateGraph(AstroAgentState)
    
    # Add nodes
    builder.add_node("router_node", router_node)
    builder.add_node("reasoner_node", reasoner_node)
    
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
            "END": END
        }
    )
    
    # After tools run, loop back to the reasoner
    builder.add_edge("tool_node", "reasoner_node")
    
    # Compile the graph with memory
    memory = MemorySaver()
    return builder.compile(checkpointer=memory)

# Provide a ready-to-use graph instance
graph = build_graph()
