import os
import json
import sys

# Force UTF-8 output on Windows to prevent cp1252 encoding errors
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

def percentile(data: list, pct: float) -> float:
    """Returns the given percentile from a sorted list of values."""
    if not data:
        return 0.0
    sorted_data = sorted(data)
    index = (pct / 100) * (len(sorted_data) - 1)
    lower = int(index)
    upper = min(lower + 1, len(sorted_data) - 1)
    fraction = index - lower
    return sorted_data[lower] + fraction * (sorted_data[upper] - sorted_data[lower])

def print_scorecard(results_file: str):
    """Parses a results JSON file and prints a scorecard table."""
    with open(results_file, "r", encoding="utf-8") as f:
        results = json.load(f)
        
    if not results:
        print("No results to display.")
        return
        
    total_cases = len(results)
    passed_cases = sum(1 for r in results if r["passed"])
    failed_cases = total_cases - passed_cases
    failure_rate = (failed_cases / total_cases * 100) if total_cases > 0 else 0.0
    
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
        
    # Averages and percentiles
    avg_warmth = sum(r["judge_score"]["warmth"] for r in results) / total_cases if total_cases > 0 else 0
    avg_accuracy = sum(r["judge_score"]["accuracy"] for r in results) / total_cases if total_cases > 0 else 0
    avg_safety = sum(r["judge_score"]["safety"] for r in results) / total_cases if total_cases > 0 else 0
    
    all_latencies = [r["latency_ms"] for r in results]
    avg_latency = sum(all_latencies) / total_cases if total_cases > 0 else 0
    p50_latency = percentile(all_latencies, 50)
    p95_latency = percentile(all_latencies, 95)
    total_cost = sum(r["cost_estimate"] for r in results)
    avg_cost = total_cost / total_cases if total_cases > 0 else 0

    run_date = os.path.basename(results_file).split("_")[1] if "_" in results_file else "Unknown"
    
    # Print Table
    print(f"\nRun: {run_date}  Model: Groq  Cases: {total_cases}  Failure Rate: {failure_rate:.1f}%")
    print("-" * 72)
    print(f"{'Category':<20} {'Pass':<8} {'Fail':<8} {'Avg Latency':<14} {'Avg Cost'}")
    
    for cat, data in categories.items():
        pass_count = data["pass"]
        fail_count = data["fail"]
        total = pass_count + fail_count
        avg_lat = sum(data["latency"]) / total if total > 0 else 0
        avg_cst = sum(data["cost"]) / total if total > 0 else 0
        
        print(f"{cat:<20} {pass_count}/{total:<6} {fail_count}/{total:<6} {(avg_lat/1000):.1f}s          ${avg_cst:.4f}")
        
    print("-" * 72)
    pass_pct = (passed_cases / total_cases) * 100 if total_cases > 0 else 0
    print(f"{'OVERALL':<20} {passed_cases}/{total_cases:<6} {failed_cases}/{total_cases:<6} {(avg_latency/1000):.1f}s avg")
    print(f"{'Latency':<20} p50={p50_latency/1000:.1f}s   p95={p95_latency/1000:.1f}s   (target: p50<5s, p95<15s)")
    print(f"{'Pass Rate':<20} {pass_pct:.0f}%")
    print(f"{'Failure Rate':<20} {failure_rate:.1f}%")
    print(f"{'Total Cost':<20} ${total_cost:.4f}   Avg per case: ${avg_cost:.4f}")
    print(f"{'LLM Judge':<20} warmth={avg_warmth:.1f}/5  accuracy={avg_accuracy:.1f}/5  safety={avg_safety:.1f}/5")
    
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

