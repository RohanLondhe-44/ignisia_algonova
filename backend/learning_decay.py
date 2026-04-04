import json
import os
import math
import numpy as np
import time

SESSION_FILE = "sessions.json"
THRESHOLD = 0.7  # 70 skill threshold


def load_sessions():
    if os.path.exists(SESSION_FILE):
        with open(SESSION_FILE, "r") as f:
            return json.load(f)
    return []


def compute_effective_skill(sessions):
    scores = np.array([s["overall"] / 100 for s in sessions])
    times  = np.array([s["timestamp"] for s in sessions])

    now = time.time() * 1000  # REAL CURRENT TIME (ms)

    days_ago = (now - times) / (1000 * 86400)

    weights = np.exp(-0.3 * days_ago)  # smoother decay

    return np.sum(weights * scores) / np.sum(weights)


def compute_stability(sessions):
    scores = np.array([s["overall"] / 100 for s in sessions])
    std = np.std(scores)

    return min(std * 2, 1)


def compute_quality(sessions):
    last = sessions[-1]

    return (
        0.4 * min(last.get("avgCPM", 0) / 120, 1) +  
        0.3 * (last.get("depthScore", 0) / 100) +
        0.2 * (last.get("elbowScore", 0) / 100) +
        0.1 * (last.get("handsScore", 0) / 100)
    )


def compute_lambda(sessions):
    stability = compute_stability(sessions)
    quality   = compute_quality(sessions)

    base_decay = 0.12  # slightly slower decay

    lam = base_decay * (1 + stability) * (1.1 - quality)

    return max(lam, 0.01)


def predict_decay_days():
    sessions = load_sessions()

    if len(sessions) < 2:
        return None

    S_eff = compute_effective_skill(sessions)
    lam   = compute_lambda(sessions)

    # If already below threshold → no prediction, just 0
    if S_eff <= THRESHOLD:
        return 0

    t = math.log(THRESHOLD / S_eff) / (-lam)

    return round(max(t, 0), 1)


def recommend_refresher():
    sessions = load_sessions()

    if len(sessions) < 2:
        return "No session data yet"

    S_eff = compute_effective_skill(sessions)
    days  = predict_decay_days()

   
    if S_eff < 0.5:
        return " Immediate practice required"

    if S_eff < 0.7:
        return " Practice soon to improve consistency"

    if days is None:
        return "No prediction available"

    if days <= 2:
        return " Practice within 1–2 days"

    if days <= 7:
        return f" Practice within {int(days)} days"

    return f" Next refresher in {int(days * 0.7)} days"


def get_prediction():
    sessions = load_sessions()

    if len(sessions) < 2:
        return None

    S_eff = compute_effective_skill(sessions)
    lam   = compute_lambda(sessions)
    days  = predict_decay_days()

    return {
        "current_skill": round(S_eff, 2),
        "decay_days": days,
        "lambda": round(lam, 3),
        "recommendation": recommend_refresher()
    }


if __name__ == "__main__":
    result = get_prediction()

    print("\n--- SKILL DECAY PREDICTION ---")
    print(result)