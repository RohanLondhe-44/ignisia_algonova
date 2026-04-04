import json
import statistics

def generate_report_from_log(filepath="cpr_log.json"):
    with open(filepath, "r") as f:
        data = json.load(f)

    if not data:
        return {}

    depths = [d["depth"] for d in data if d.get("depth") is not None]
    rates = [d["rate"] for d in data if d.get("rate") is not None]
    recoils = [d["recoil"] for d in data if d.get("recoil") is not None]

    total_time = len(data)

    # Averages
    avg_depth = sum(depths) / len(depths)
    avg_rate = sum(rates) / len(rates)
    avg_recoil = sum(recoils) / len(recoils)

    #  Accuracy scoring
    def score_range(values, min_val, max_val):
        correct = [v for v in values if min_val <= v <= max_val]
        return (len(correct) / len(values)) * 100 if values else 0

    depth_score = score_range(depths, 5.0, 6.0)       # cm
    rate_score = score_range(rates, 100, 120)         # bpm
    recoil_score = score_range(recoils, 0.9, 1.1)

    # Consistency (std deviation)
    depth_consistency = 100 - (statistics.stdev(depths) if len(depths) > 1 else 0)
    rate_consistency = 100 - (statistics.stdev(rates) if len(rates) > 1 else 0)

    # Overall score
    overall = (depth_score + rate_score + recoil_score) / 3

    return {
        "duration": total_time,
        "avg_depth": round(avg_depth, 2),
        "avg_rate": round(avg_rate, 2),
        "avg_recoil": round(avg_recoil, 2),
        "depth_score": round(depth_score, 1),
        "rate_score": round(rate_score, 1),
        "recoil_score": round(recoil_score, 1),
        "consistency": round((depth_consistency + rate_consistency) / 2, 1),
        "overall_score": round(overall, 1)
    }