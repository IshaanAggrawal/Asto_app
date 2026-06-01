import os
import json
import sys

def print_scorecard(results_file: str):
    """Parses a results JSON file and prints a scorecard table."""
    with open(results_file, "r", encoding="utf-8") as f:
        results = json.load(f)
        
    if not results:
        print("No results to display.")
        return
        
    total_cases = len(results)
    passed_cases = sum(1 for r in results if r["passed"])
    
    categories = {}
    for r in results:
        cat = r["category"]
        if cat not in categories:
            categories[cat] = {"pass": 0, "fail": 0, "latency": [], "cost": []}
        
        if r["passed"]:
            categories[cat]["pass"] += 1
        else:
            categories[cat]["fail"] += 1
            
        categories[cat]["latency"].append(r["latency_ms"])
        categories[cat]["cost"].append(r["cost_estimate"])
        
    # Averages
    avg_warmth = sum(r["judge_score"]["warmth"] for r in results) / total_cases if total_cases > 0 else 0
    avg_accuracy = sum(r["judge_score"]["accuracy"] for r in results) / total_cases if total_cases > 0 else 0
    avg_safety = sum(r["judge_score"]["safety"] for r in results) / total_cases if total_cases > 0 else 0
    
    all_latencies = [r["latency_ms"] for r in results]
    avg_latency = sum(all_latencies) / total_cases if total_cases > 0 else 0
    p50_latency = sorted(all_latencies)[len(all_latencies)//2] if all_latencies else 0
    total_cost = sum(r["cost_estimate"] for r in results)
    avg_cost = total_cost / total_cases if total_cases > 0 else 0

    run_date = os.path.basename(results_file).split("_")[1] if "_" in results_file else "Unknown"
    
    # Print Table
    print(f"\nRun: {run_date}  Model: Groq  Cases: {total_cases}")
    print("─────────────────────────────────────────────────────────")
    print(f"{'Category':<20} {'Pass':<6} {'Fail':<6} {'Avg Latency':<12} {'Avg Cost'}")
    
    for cat, data in categories.items():
        pass_count = data["pass"]
        fail_count = data["fail"]
        total = pass_count + fail_count
        avg_lat = sum(data["latency"]) / total if total > 0 else 0
        avg_cst = sum(data["cost"]) / total if total > 0 else 0
        
        print(f"{cat:<20} {pass_count}/{total:<4} {fail_count}/{total:<4} {(avg_lat/1000):.1f}s         ${avg_cst:.4f}")
        
    print("─────────────────────────────────────────────────────────")
    pass_pct = (passed_cases / total_cases) * 100 if total_cases > 0 else 0
    print(f"OVERALL              {passed_cases}/{total_cases}  {pass_pct:.0f}%  {(p50_latency/1000):.1f}s p50     ${avg_cost:.4f} avg")
    print(f"LLM Judge:  warmth={avg_warmth:.1f}  accuracy={avg_accuracy:.1f}  safety={avg_safety:.1f}")
    
    # Print failures
    if passed_cases < total_cases:
        print("\nFailures:")
        for r in results:
            if not r["passed"]:
                print(f"  - {r['id']} ({r['category']}): {r['fail_reason']}")

if __name__ == "__main__":
    # If run directly, read the most recent results file
    base_dir = os.path.dirname(os.path.dirname(__file__))
    results_dir = os.path.join(base_dir, "evals", "results")
    
    if os.path.exists(results_dir):
        files = [os.path.join(results_dir, f) for f in os.listdir(results_dir) if f.endswith(".json")]
        if files:
            latest_file = max(files, key=os.path.getmtime)
            print_scorecard(latest_file)
        else:
            print("No results found.")
    else:
        print("Results directory not found.")
