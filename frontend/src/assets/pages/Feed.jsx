import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./Feed.css";
import { useNavigate, useLocation } from "react-router-dom";

const Feed = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ⏱️ duration from dashboard (in seconds)
  const duration = location.state?.duration;

  const [streaming, setStreaming] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [timeLeft, setTimeLeft] = useState(duration || 0);

  const lastSpokenRef = useRef("");

  // 🎤 TEXT TO SPEECH
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

  // ▶️ START CAMERA
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

  // ⛔ STOP CAMERA
  const stopCamera = async () => {
    try {
      await axios.get("http://localhost:5000/stop");

      setStreaming(false);
      setMetrics(null);

      speechSynthesis.cancel();

      if (window._metricsInterval) {
        clearInterval(window._metricsInterval);
      }

      // 🔥 break video stream
      const img = document.querySelector(".webcam");
      if (img) img.src = "";

    } catch (err) {
      console.error("Error stopping camera:", err);
    }
  };

  // ⏳ AUTO STOP TIMER
  useEffect(() => {
    if (!streaming || !duration) return;

    setTimeLeft(duration);

    const timer = setTimeout(async () => {
      await stopCamera();
      navigate("/report");
    }, duration * 1000);

    const countdown = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(countdown);
    };
  }, [streaming, duration]);

  // 🔘 MANUAL STOP
  const handleStopAndNavigate = async () => {
    await stopCamera();
    navigate("/report");
  };

  return (
    <div className="camera-container">
      <h1 className="title">Real-Time Skill Coach</h1>

      {/* ⏱️ TIMER DISPLAY */}
      {streaming && duration && (
        <div style={{ marginBottom: "10px", fontSize: "18px" }}>
          Time Left: {timeLeft}s
        </div>
      )}

      <div className="feed-layout">
        {/* CAMERA */}
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

        {/* METRICS */}
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

            {/* AI */}
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