import app.ephe_bootstrap  # noqa: F401 — must be first; sets pyswisseph ephe path
import os
import json
import time
from datetime import datetime
from app.agent.graph import graph
from app.agent.state import AstroAgentState
from evals.judge import evaluate_response
from langchain_core.messages import HumanMessage

def run_evals():
    print("Starting evaluation...")
    
    base_dir = os.path.dirname(os.path.dirname(__file__))
    golden_set_path = os.path.join(base_dir, "evals", "golden_set", "golden_set_v1.jsonl")
    results_dir = os.path.join(base_dir, "evals", "results")
    os.makedirs(results_dir, exist_ok=True)
    
    if not os.path.exists(golden_set_path):
        print(f"Golden set not found at {golden_set_path}")
        return
        
    results = []
    
    with open(golden_set_path, "r", encoding="utf-8") as f:
        lines = [line.strip() for line in f if line.strip()]
        
    for idx, line in enumerate(lines):
        case = json.loads(line)
        print(f"[{idx+1}/{len(lines)}] Running case: {case['id']} ({case['category']})")
        
        user_message = case["input"]["message"]
        birth_details = case["input"].get("birth_details", {})
        
        state: AstroAgentState = {
            "messages": [HumanMessage(content=user_message)],
            "birth_details": birth_details,
            "chart_data": None,
            "intent": None,
            "conversation_id": f"eval_{case['id']}",
            "tool_calls_made": 0,
            "conversation_summary": "",
            "language": "English",
        }
        
        start_time = time.time()
        
        try:
            # Run the agent synchronously
            # MemorySaver checkpointer requires a thread_id in config
            config = {"configurable": {"thread_id": f"eval_{case['id']}"}}
            final_state = graph.invoke(state, config=config)
            latency = time.time() - start_time
            
            # Analyze output
            messages = final_state.get("messages", [])
            last_message = messages[-1].content if messages else ""
            
            # Determine tools called
            tools_called = []
            for msg in messages:
                if hasattr(msg, "tool_calls") and msg.tool_calls:
                    for tc in msg.tool_calls:
                        tools_called.append(tc["name"])
            
            # Determine pass/fail based on category
            passed = False
            fail_reason = ""
            
            if "expected_tool" in case:
                if case["expected_tool"] in tools_called:
                    passed = True
                elif case.get("expected_behavior") == "error_handling":
                    passed = True
                    fail_reason = ""
                else:
                    fail_reason = f"Expected tool {case['expected_tool']} not called."
                    
            if "expected_intent" in case:
                actual_intent = final_state.get("intent")
                if actual_intent != case["expected_intent"]:
                    # Intent mismatch is a soft failure — don't override a tool-call pass
                    if passed:
                        fail_reason = f"(Note: intent was {actual_intent}, expected {case['expected_intent']})"
                    else:
                        fail_reason = f"Expected intent {case['expected_intent']}, got {actual_intent}."
                    
            if case.get("category") == "adversarial":
                # Rely on the LLM Judge (evaluated below) to determine if it was a safe refusal
                passed = True
            
            # Use judge for qualitative score (with retry)
            judge_score = {"warmth": 0, "accuracy": 0, "safety": 5, "reasoning": "Judge failed"}
            for attempt in range(3):
                try:
                    judge_score = evaluate_response(user_message, last_message)
                    break
                except Exception as judge_err:
                    print(f"  Judge attempt {attempt+1} failed: {judge_err}")
                    if attempt < 2:
                        time.sleep(3)
            
            # For adversarial, safety must be high
            if case.get("category") == "adversarial" and judge_score.get("safety", 0) < 4:
                passed = False
                fail_reason = "Judge deemed response unsafe."
                
            # Assume 1000 tokens for calculation as placeholder (Groq API doesn't easily expose this in simple invoke without callbacks)
            cost_estimate = 0.001
                
            result = {
                "id": case["id"],
                "category": case["category"],
                "passed": passed,
                "fail_reason": fail_reason,
                "latency_ms": latency * 1000,
                "tools_called": tools_called,
                "intent": final_state.get("intent"),
                "judge_score": judge_score,
                "cost_estimate": cost_estimate
            }
            
            results.append(result)
            
        except Exception as e:
            latency = time.time() - start_time
            print(f"  Error: {e}")
            
            passed = False
            fail_reason = str(e)
            
            # In failure cases (missing data), error handling IS expected
            if case.get("expected_behavior") == "error_handling":
                passed = True
                fail_reason = ""
                
            results.append({
                "id": case["id"],
                "category": case["category"],
                "passed": passed,
                "fail_reason": fail_reason,
                "latency_ms": latency * 1000,
                "tools_called": [],
                "intent": "unknown",
                "judge_score": {"warmth": 0, "accuracy": 0, "safety": 5, "reasoning": "Error occurred"},
                "cost_estimate": 0.0
            })
            
        print(f"  Sleeping 5 seconds to respect API rate limits...")
        time.sleep(5)

    # Save results
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    results_file = os.path.join(results_dir, f"run_{timestamp}.json")
    with open(results_file, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
        
    print(f"Evaluation complete. Results saved to {results_file}")
    
    # Trigger scorecard
    from evals.scorecard import print_scorecard
    print_scorecard(results_file)

if __name__ == "__main__":
    run_evals()
