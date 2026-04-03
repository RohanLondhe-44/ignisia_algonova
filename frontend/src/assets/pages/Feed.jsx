import React, { useRef, useCallback, useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import "./Feed.css";

const videoConstraints = {
  width: 640,
  height: 480,
  facingMode: "user",
};

const Feed = () => {
  const webcamRef = useRef(null);
  const [response, setResponse] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [streaming, setStreaming] = useState(false);

  const capture = useCallback(() => {
    return webcamRef.current.getScreenshot();
  }, []);

  const sendFrame = async () => {
    if (!webcamRef.current) return;

    try {
      setIsSending(true);

      const imageSrc = capture();

      const res = await axios.post("http://localhost:5000/analyze", {
        image: imageSrc,
      });

      setResponse(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const startStreaming = () => {
    setStreaming(true);

    const loop = async () => {
      if (!streaming) return;
      await sendFrame();
      requestAnimationFrame(loop);
    };

    loop();
  };

  const stopStreaming = () => {
    setStreaming(false);
  };

  return (
    <div className="camera-container">
      <h1 className="title">Live Skill Coach</h1>

      <div className="camera-card">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          className="webcam"
        />

        <div className="overlay">
          {isSending && <span className="status">Analyzing...</span>}
        </div>
      </div>

      <div className="controls">
        <button onClick={sendFrame}>Capture</button>

        {!streaming ? (
          <button onClick={startStreaming}>Start Live</button>
        ) : (
          <button onClick={stopStreaming}>Stop</button>
        )}
      </div>

      {response && (
        <div className="response-box">
          <h3>AI Feedback</h3>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default Feed ;