from flask import Flask, Response,jsonify
from flask_cors import CORS


from trackers.cpr_tracker import generate_frames, DEFAULT_CONFIG
import trackers.cpr_tracker as tracker

app = Flask(__name__)
CORS(app)

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
    print(tracker.LATEST_METRICS)
    return jsonify(tracker.LATEST_METRICS)

if __name__ == "__main__":
    app.run(debug=True, threaded=True)