from flask import Flask, Response, jsonify, request
from flask_cors import CORS

from trackers.cpr_tracker import generate_frames, DEFAULT_CONFIG
import trackers.cpr_tracker as tracker

import os
from dotenv import load_dotenv
from groq import Groq

import threading
import time
import json

app = Flask(__name__)
CORS(app)

#  GLOBAL CONTROL FLAG
RUNNING = False

# -------------------- GROQ SETUP --------------------
load_dotenv()
client = Groq(api_key=os.getenv("API_KEY"))

# -------------------- AI FEEDBACK LOOP --------------------
def groq_feedback_loop():
    global RUNNING

    print("Groq thread started")

    last_feedback_time = 0
    COOLDOWN = 7  # seconds

    while True:
        try:
            if not RUNNING:
                time.sleep(1)
                continue

            # enforce cooldown
            now = time.time()
            if now - last_feedback_time < COOLDOWN:
                time.sleep(0.5)
                continue

            metrics = tracker.LATEST_METRICS

            # Skip if no usable data
            if not metrics or metrics.get("depth") is None:
                time.sleep(2)
                continue

            prompt = f"""
You are a CPR coach giving LIVE feedback.

Metrics:
Compression Rate (CPM): {metrics.get('cpm')}
Depth: {metrics.get('depth')} cm
Depth OK: {metrics.get('depth_ok')}
Elbow Position OK: {metrics.get('elbow_ok')}
Hand Position OK: {metrics.get('hands_ok')}

Give ONE short actionable sentence.
Sentences should be shorter like just an order of what clearly to do yet easy to understand for people
"""

            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}]
            )

            feedback = response.choices[0].message.content.strip()

            if isinstance(tracker.LATEST_METRICS, dict):
                tracker.LATEST_METRICS.update({
                    "ai_feedback": feedback
                })

            print("AI:", feedback)

            #  update last feedback time
            last_feedback_time = time.time()

        except Exception as e:
            print("Groq Error:", e)
            time.sleep(5)

# -------------------- ROUTES --------------------

@app.route('/')
def home():
    return "Server Running"


# ▶️ START SESSION
@app.route("/start", methods=["POST"])
def start():
    global RUNNING
    RUNNING = True
    print(" Session Started")
    return {"status": "started"}


#  STOP SESSION
@app.route("/stop", methods=["GET"])
def stop():
    global RUNNING
    RUNNING = False

    # optional cleanup
    tracker.LATEST_METRICS.clear()

    print(" Session Stopped")

    return {"status": "stopped"}



@app.route('/video')
def video_feed():
    return Response(
        generate_frames(DEFAULT_CONFIG, lambda: RUNNING),
        mimetype='multipart/x-mixed-replace; boundary=frame'
    )


#  METRICS
@app.route('/metrics')
def metrics():
    return jsonify(tracker.LATEST_METRICS)


#
@app.route('/cpr-log')
def get_log():
    with open("cpr_log.json") as f:
        data = json.load(f)
    return jsonify(data)



SESSIONS_FILE = "sessions.json"

@app.route("/save-session", methods=["POST"])
def save_session():
    data = request.get_json()

    if os.path.exists(SESSIONS_FILE):
        with open(SESSIONS_FILE, "r") as f:
            sessions = json.load(f)
    else:
        sessions = []

    sessions.append(data)

    with open(SESSIONS_FILE, "w") as f:
        json.dump(sessions, f, indent=2)

    return {"status": "saved"}



@app.route('/sessions')
def get_sessions():
    if os.path.exists(SESSIONS_FILE):
        with open(SESSIONS_FILE, "r") as f:
            data = json.load(f)
        return jsonify(data)
    return jsonify([])


# -------------------- MAIN --------------------
if __name__ == "__main__":
    threading.Thread(target=groq_feedback_loop, daemon=True).start()
    app.run(debug=True, threaded=True)