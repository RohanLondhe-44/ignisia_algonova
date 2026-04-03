from flask import Flask, Response, jsonify
from flask_cors import CORS

from trackers.cpr_tracker import generate_frames, DEFAULT_CONFIG
import trackers.cpr_tracker as tracker

from groq import Groq
import threading
import time

app = Flask(__name__)
CORS(app)

# -------------------- GROQ SETUP --------------------
client = Groq()

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

# -------------------- MAIN --------------------

if __name__ == "__main__":
    # Start AI feedback in background
    threading.Thread(target=groq_feedback_loop, daemon=True).start()

    app.run(debug=True, threaded=True)