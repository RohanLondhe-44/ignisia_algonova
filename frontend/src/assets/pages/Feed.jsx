import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./Feed.css";
import { useNavigate } from "react-router-dom";

const Feed = () => {
  const navigate = useNavigate();
  const [streaming, setStreaming] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const lastSpokenRef = useRef("");
  const videoRef = useRef(null); // 👈 ref to the img tag

  const speak = (text) => {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (metrics?.ai_feedback) {
      if (metrics.ai_feedback !== lastSpokenRef.current) {
        speak(metrics.ai_feedback);
        lastSpokenRef.current = metrics.ai_feedback;
      }
    }
  }, [metrics]);

  const startCamera = async () => {
    try {
      setStreaming(true);

      const interval = setInterval(async () => {
        try {
          const res = await axios.get("http://localhost:5000/metrics");
          setMetrics(res.data);
        } catch (err) {
          console.error("Error fetching metrics:", err);
        }
      }, 1000);

      window._metricsInterval = interval;
    } catch (err) {
      console.error("Error starting camera:", err);
    }
  };

  const killStream = () => {
    // 👇 Force browser to drop the MJPEG connection immediately
    if (videoRef.current) {
      videoRef.current.src = "";
    }

    // Stop polling
    if (window._metricsInterval) {
      clearInterval(window._metricsInterval);
      window._metricsInterval = null;
    }

    // Stop speech
    speechSynthesis.cancel();

    // Update state
    setStreaming(false);
    setMetrics(null);
  };

  const stopCamera = async () => {
    killStream();
    try {
      await axios.get("http://localhost:5000/stop");
    } catch (err) {
      console.error("Error stopping camera:", err);
    }
  };

  const handleStopAndNavigate = async () => {
    killStream();
    axios.get("http://localhost:5000/stop").catch(() => {});
    await new Promise((r) => setTimeout(r, 150));
    navigate("/report");
  };

  return (
    <div className="camera-container">
      <h1 className="title">Real-Time Skill Coach</h1>

      <div className="feed-layout">
        {/* CAMERA VIEW */}
        <div className="camera-card">
          {streaming ? (
            <img
              ref={videoRef} // 👈 attach ref
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
              <span className="metric-value">
                {metrics.depth ? `${metrics.depth} cm` : "--"}
              </span>
            </div>

            <div className="metric">
              <span className="metric-label">Depth Status</span>
              <span className={`metric-value ${metrics.depth_ok ? "ok" : "bad"}`}>
                {metrics.depth_ok ? "OK" : "BAD"}
              </span>
            </div>

            <div className="metric">
              <span className="metric-label">Center</span>
              <span className={`metric-value ${metrics.center_ok ? "ok" : "bad"}`}>
                {metrics.center_ok ? "OK" : "BAD"}
              </span>
            </div>

            <div className="metric">
              <span className="metric-label">Elbow Position</span>
              <span className={`metric-value ${metrics.elbow_ok ? "ok" : "bad"}`}>
                {metrics.elbow_ok ? "OK" : "BAD"}
              </span>
            </div>

            <div className="metric">
              <span className="metric-label">Hand Position</span>
              <span className={`metric-value ${metrics.hands_ok ? "ok" : "bad"}`}>
                {metrics.hands_ok ? "OK" : "BAD"}
              </span>
            </div>

            <div className="metric feedback-box">
              <span className="metric-label">AI Coach</span>
              <span className="metric-value feedback-text">
                {metrics.ai_feedback || "Analyzing..."}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* CONTROLS */}
      <div className="controls">
        <button onClick={startCamera}>Start</button>
        <button onClick={handleStopAndNavigate}>Stop</button>
      </div>
    </div>
  );
};

export default Feed;