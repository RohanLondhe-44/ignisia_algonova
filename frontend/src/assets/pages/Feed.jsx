import React, { useState } from "react";
import axios from "axios";
import "./Feed.css";

const Feed = () => {
  const [streaming, setStreaming] = useState(false);
  const [metrics, setMetrics] = useState(null);

  const startCamera = async () => {
    try {
      await axios.get("http://localhost:5000/video"); // backend start endpoint
      setStreaming(true);

      // poll metrics every 1 second
      const interval = setInterval(async () => {
        try {
          const res = await axios.get("http://localhost:5000/metrics");
          setMetrics(res.data);
        } catch (err) {
          console.error("Error fetching metrics:", err);
        }
      }, 1000);

      // store interval so we can clear later
      window._metricsInterval = interval;
    } catch (err) {
      console.error("Error starting camera:", err);
    }
  };

  const stopCamera = async () => {
    try {
      await axios.get("http://localhost:5000/stop");
      setStreaming(false);
      setMetrics(null);

      if (window._metricsInterval) {
        clearInterval(window._metricsInterval);
      }
    } catch (err) {
      console.error("Error stopping camera:", err);
    }
  };

  return (
    <div className="camera-container">
      <h1 className="title">Real-Time Skill Coach</h1>

      <div className="feed-layout">
        {/* CAMERA VIEW */}
        <div className="camera-card">
          {streaming ? (
            <img
              src="http://localhost:5000/video"
              alt="Live Feed"
              className="webcam"
            />
          ) : (
            <div className="placeholder">
              Click "Start" to begin camera feed
            </div>
          )}
        </div>

        {/* METRICS PANEL */}
        {streaming && metrics && (
          <div className="metrics-panel">
            <div className="metrics-title">Live Metrics</div>

            <div className="metric">
              <span className="metric-label">CPM</span>
              <span className="metric-value">{metrics.cpm}</span>
            </div>

            <div className="metric">
              <span className="metric-label">Depth</span>
              <span className="metric-value">{metrics.depth} cm</span>
            </div>

            <div className="metric">
              <span className="metric-label">Depth Status</span>
              <span
                className={`metric-value ${
                  metrics.depth_ok ? "ok" : "bad"
                }`}
              >
                {metrics.depth_ok ? "OK" : "BAD"}
              </span>
            </div>

            <div className="metric">
              <span className="metric-label">Center</span>
              <span
                className={`metric-value ${
                  metrics.center_ok ? "ok" : "bad"
                }`}
              >
                {metrics.center_ok ? "OK" : "BAD"}
              </span>
            </div>

            <div className="metric">
              <span className="metric-label">Elbow Position</span>
              <span
                className={`metric-value ${
                  metrics.elbow_ok ? "ok" : "bad"
                }`}
              >
                {metrics.elbow_ok ? "OK" : "BAD"}
              </span>
            </div>

            <div className="metric">
              <span className="metric-label">Hand Position</span>
              <span
                className={`metric-value ${
                  metrics.hands_ok ? "ok" : "bad"
                }`}
              >
                {metrics.hands_ok ? "OK" : "BAD"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* CONTROLS */}
      <div className="controls">
        <button onClick={startCamera}>Start</button>
        <button onClick={stopCamera}>Stop</button>
      </div>
    </div>
  );
};

export default Feed;