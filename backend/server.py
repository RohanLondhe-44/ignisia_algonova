from flask import Flask, Response
from flask_cors import CORS


from trackers.cpr_tracker import generate_frames, DEFAULT_CONFIG

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

if __name__ == "__main__":
    app.run(debug=True, threaded=True)