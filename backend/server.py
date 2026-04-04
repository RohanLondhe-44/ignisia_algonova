from flask import Flask, Response, jsonify
from flask_cors import CORS

from trackers.cpr_tracker import generate_frames, DEFAULT_CONFIG
import trackers.cpr_tracker as tracker
import os
from dotenv import load_dotenv
# GROQ SETUP
from groq import Groq
import threading
import time
import json
from flask import request
app = Flask(__name__)
CORS(app)

# -------------------- GROQ SETUP --------------------
load_dotenv()
client = Groq(api_key=os.getenv("API_KEY"))

def groq_feedback_loop():
    while True:
        try:
            metrics = tracker.LATEST_METRICS

            # Skip if no data yet
            if not metrics or metrics.get("depth") is None:
                time.sleep(2)
                continue

            prompt = f"""
            You are a CPR coach giving LIVE feedback.

            Metrics:
            Depth: {metrics.get('depth')}
            Rate: {metrics.get('rate')}
            Recoil: {metrics.get('recoil')}

            Give ONE short actionable sentence.
            Example: "Push deeper and maintain rhythm."
            """

            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}]
            )

            feedback = response.choices[0].message.content.strip()

            # Store in shared metrics
            tracker.LATEST_METRICS["ai_feedback"] = feedback

            print("AI:", feedback)

            time.sleep(3)

        except Exception as e:
            print("Groq Error:", e)
            time.sleep(5)

# -------------------- ROUTES --------------------

@app.route('/')
def home():
    return "Server Running"

@app.route('/video')
def video_feed():
    return Response(
        generate_frames(DEFAULT_CONFIG),
        mimetype='multipart/x-mixed-replace; boundary=frame'
    )

@app.route('/metrics')
def metrics():
    return jsonify(tracker.LATEST_METRICS)

@app.route('/cpr-log')
def get_log():
    with open("cpr_log.json") as f:
        data = json.load(f)
    return jsonify(data)

import json
import os

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

    # Save back
    with open(SESSIONS_FILE, "w") as f:
        json.dump(sessions, f, indent=2)

    return {"status": "saved"}

@app.route('/sessions')
def get_sessions():
    if os.path.exists("sessions.json"):
        with open("sessions.json", "r") as f:
            data = json.load(f)
        return jsonify(data)
    return jsonify([])


if __name__ == "__main__":
    # Start AI feedback in background
    threading.Thread(target=groq_feedback_loop, daemon=True).start()

    app.run(debug=True, threaded=True)