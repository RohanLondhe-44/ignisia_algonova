import time
import json
from groq import Groq
import trackers.cpr_tracker as tracker
import os
from dotenv import load_dotenv
load_dotenv()
client = Groq(api_key=os.getenv("API_KEY"))

LOG_FILE = "cpr_log.json"

# Helper function to read latest metrics from log file
def get_latest_metrics():
    try:
        with open(LOG_FILE, "r") as f:
            data = json.load(f)

            if not data:
                return None

            # Get latest entry
            return data[-1]

    except Exception as e:
        print("Error reading log:", e)
        return None


def run_listener():
    while True:
        try:
            # Wait 5 seconds before reading latest snapshot
            time.sleep(5)

            metrics = get_latest_metrics()

            if not metrics or metrics.get("depth") is None:
                continue

            prompt = f"""
You are a real-time CPR coach guiding a trainee.

Ideal CPR:
- Depth: 5 to 6 cm
- Rate: 100 to 120 compressions per minute
- Full chest recoil required

Current performance:
- Depth: {metrics.get('depth')}
- Rate: {metrics.get('rate')}
- Recoil: {metrics.get('recoil')}

Previous feedback:
{tracker.LATEST_METRICS.get("ai_feedback", "")}

Instructions:
- Give ONE short spoken feedback (max 6 words)
- Be natural and human-like
- Prioritize the MOST critical issue
- Avoid repeating previous feedback
- If everything is correct, encourage

Respond only with the sentence.
"""

            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}]
            )

            feedback = response.choices[0].message.content.strip()

            # Push feedback to live system
            tracker.LATEST_METRICS["ai_feedback"] = feedback

            print("AI:", feedback)

        except Exception as e:
            print("Error:", e)
            time.sleep(5)


if __name__ == "__main__":
    run_listener()