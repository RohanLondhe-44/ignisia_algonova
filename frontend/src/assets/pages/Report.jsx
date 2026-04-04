import React, { useEffect, useState } from "react";
import "./report.css";
import { useRef } from "react";

/* ── helpers ── */
const sessionId = () =>
  "SES-" + Math.random().toString(36).slice(2, 8).toUpperCase();

const gradeOf = (score) => {
  if (score >= 90) return { label: "EXCELLENT", cls: "score-grade--ace" };
  if (score >= 70) return { label: "GOOD",      cls: "score-grade--pass" };
  if (score >= 50) return { label: "NEEDS WORK",cls: "score-grade--warn" };
  return           { label: "CRITICAL",         cls: "score-grade--fail" };
};

/* Clamp a CPM value (0–180) to a 0–100% position on the range bar */
const cpmToPercent = (cpm) => Math.min(Math.max((cpm / 180) * 100, 0), 100);

/* ── arc SVG for overall score ── */
const ScoreArc = ({ score }) => {
  const r = 48, cx = 60, cy = 60;
  const circ = 2 * Math.PI * r;
  const dash  = (score / 100) * circ;
  const color =
    score >= 90 ? "#00e5ff" :
    score >= 70 ? "#00e676" :
    score >= 50 ? "#ffc107" : "#ff4d4d";

  return (
    <svg width="120" height="80" viewBox="0 0 120 100" className="score-arc">
      {/* track */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6"
        strokeDasharray={`${circ * 0.75} ${circ * 0.25}`}
        strokeDashoffset={circ * 0.875}
        strokeLinecap="round"
      />
      {/* fill */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={`${dash * 0.75} ${circ}`}
        strokeDashoffset={circ * 0.875}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.16,1,0.3,1)" }}
      />
    </svg>
  );
};

/* ── metric card ── */
const MetricCard = ({ mod, icon, val, unit, label, pct }) => (
  <div className={`metric-card metric-card--${mod}`}>
    <div className="metric-icon">{icon}</div>
    <div className="metric-val">
      {val}<span>{unit}</span>
    </div>
    <div className="metric-label">{label}</div>
    <div className="metric-bar">
      <div className="metric-bar-fill" style={{ width: `${pct}%` }} />
    </div>
  </div>
);

/* ── CPM range bar ── */
const CPMRangeBar = ({ cpm }) => {
  const needle = cpmToPercent(cpm);
  // 100–120 CPM is "the zone": 55.5%–66.7% of 180
  return (
    <div className="cpm-range-indicator">
      <div className="cpm-range-bar">
        <div className="cpm-range-zone" style={{ left: "55.5%", width: "11.2%" }} />
        <div className="cpm-range-needle" style={{ left: `${needle}%` }} />
      </div>
      <div className="cpm-range-labels">
        <span>0</span><span>60</span><span>100</span><span>120</span><span>180</span>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════ */

const saveSession = async (data) => {
  try {
    await fetch("http://localhost:5000/save-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  } catch (err) {
    console.error("Error saving session:", err);
  }
};

const Report = () => {
  const [report, setReport] = useState(null);
  const [sid]   = useState(sessionId);
  const hasSavedRef = useRef(false);

  useEffect(() => {
    fetch("http://localhost:5000/cpr-log")
      .then((res) => res.json())
      .then((data) => analyze(data))
      .catch((err) => {
        console.error("Error loading CPR log:", err);
        setReport({ error: "Could not connect to session server." });
      });
  }, []);

  const analyze = (log) => {
    if (!log || log.length === 0) {
      setReport({ error: "No CPR activity detected in session." });
      return;
    }

    const active = log.filter((e) => e.cpm > 0);
    if (active.length === 0) {
      setReport({ error: "No active compressions found." });
      return;
    }

    let totalCPM = 0, cpmOk = 0, depthOk = 0, elbowOk = 0, handsOk = 0;
    let minDepth = Infinity, maxDepth = -Infinity;

    active.forEach((e) => {
      totalCPM += e.cpm;
      if (e.cpm_ok)        cpmOk++;
      if (e.depth_ok)      depthOk++;
      if (e.elbow_ok)      elbowOk++;
      if (e.both_hands_ok) handsOk++;
      minDepth = Math.min(minDepth, e.depth);
      maxDepth = Math.max(maxDepth, e.depth);
    });

    const n = active.length;
    const avgCPM     = totalCPM / n;
    const cpmScore   = (cpmOk   / n) * 100;
    const depthScore = (depthOk / n) * 100;
    const elbowScore = (elbowOk / n) * 100;
    const handsScore = (handsOk / n) * 100;
    const overall    = 0.4*cpmScore + 0.3*depthScore + 0.2*elbowScore + 0.1*handsScore;

    const feedback = [];
    if (cpmScore   < 60) feedback.push("Maintain a steady compression rhythm (100–120 CPM)");
    if (depthScore < 60) feedback.push("Improve compression depth consistency");
    if (elbowScore < 60) feedback.push("Keep your elbows locked during compressions");
    if (handsScore < 60) feedback.push("Ensure both hands are correctly placed");
    if (feedback.length === 0) feedback.push("Excellent CPR performance! All metrics within range.");

    setReport({
      avgCPM: avgCPM.toFixed(1),
      cpmScore:   cpmScore.toFixed(1),
      depthScore: depthScore.toFixed(1),
      elbowScore: elbowScore.toFixed(1),
      handsScore: handsScore.toFixed(1),
      minDepth: minDepth.toFixed(3),
      maxDepth: maxDepth.toFixed(3),
      overall: overall.toFixed(1),
      feedback,
    });
    const sessionData = {
  timestamp: Date.now(),

  overall: overall,
  avgCPM: avgCPM,

  cpmScore: cpmScore,
  depthScore: depthScore,
  elbowScore: elbowScore,
  handsScore: handsScore,

  minDepth: minDepth,
  maxDepth: maxDepth
};

if (!hasSavedRef.current) {
  saveSession(sessionData);
  hasSavedRef.current = true;
}
  };

  /* ── nav ── */
  const Nav = () => (
    <nav className="nav">
      <a href="/" className="nav-logo">
        <div className="nav-logo-dot" />
        PrecisionLABS
      </a>
      <div className="nav-actions">
        <span className="nav-badge">Session Report</span>
        <button className="nav-btn" onClick={() => window.print()}>
          ↓ Export PDF
        </button>
      </div>
    </nav>
  );

  if (!report) return (
    <>
      <Nav />
      <div className="report-page">
        <div className="report-loading">
          <div className="report-loading-spinner" />
          <div className="report-loading-text">Analyzing session data…</div>
        </div>
      </div>
    </>
  );

  if (report.error) return (
    <>
      <Nav />
      <div className="report-page">
        <div className="report-error">
          <div className="report-error-icon">⚠</div>
          <div className="report-error-msg">{report.error}</div>
        </div>
      </div>
    </>
  );

  const { overall, avgCPM, cpmScore, depthScore, elbowScore, handsScore,
          minDepth, maxDepth, feedback } = report;
  const grade = gradeOf(parseFloat(overall));
  const isSuccess = feedback[0].startsWith("Excellent");

  return (
    <>
      <Nav />
      <main className="report-page">

        {/* ── Header ── */}
        <div className="report-header">
          <div className="report-header-left">
            <div className="report-eyebrow">
              <span className="report-label">CPR Assessment</span>
              <span className="report-session-id">{sid}</span>
            </div>
            <h1 className="report-title">Performance<br />Report</h1>
            <p className="report-subtitle">
              PrecisionLABS · Procedural Training Intelligence
            </p>
          </div>

          <div className="score-block">
            <ScoreArc score={parseFloat(overall)} />
            <div className="score-value">
              {overall}<span className="score-denom">/100</span>
            </div>
            <div className="score-label-text">Overall Score</div>
            <div className={`score-grade ${grade.cls}`}>{grade.label}</div>
          </div>
        </div>

        {/* ── Avg CPM banner ── */}
        <div className="cpm-display">
          <div>
            <div className="cpm-unit" style={{ marginBottom: 4, fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>
              Avg Compression Rate
            </div>
            <span className="cpm-val">{avgCPM}</span>
            {" "}<span className="cpm-unit">CPM</span>
          </div>
          <div className="cpm-divider" />
          <div className="cpm-context">
            <span className="cpm-context-label">Target Range</span>
            <span className="cpm-context-val">100 – 120 CPM</span>
          </div>
          <div className="cpm-context">
            <span className="cpm-context-label">AHA Guideline</span>
            <span className="cpm-context-val">Hard &amp; Fast</span>
          </div>
          <CPMRangeBar cpm={parseFloat(avgCPM)} />
        </div>

        {/* ── 4 Metric Cards ── */}
        <div className="metrics-section">
          <span className="section-eyebrow">Accuracy Breakdown</span>
          <div className="section-title">Performance Metrics</div>
          <div className="metrics-grid">
            <MetricCard
              mod="cpm" icon="♻" val={cpmScore} unit="%" label="CPM Accuracy"
              pct={parseFloat(cpmScore)}
            />
            <MetricCard
              mod="depth" icon="↕" val={depthScore} unit="%" label="Depth Accuracy"
              pct={parseFloat(depthScore)}
            />
            <MetricCard
              mod="elbow" icon="💪" val={elbowScore} unit="%" label="Elbow Position"
              pct={parseFloat(elbowScore)}
            />
            <MetricCard
              mod="hands" icon="🤲" val={handsScore} unit="%" label="Hand Placement"
              pct={parseFloat(handsScore)}
            />
          </div>
        </div>

        {/* ── Depth range ── */}
        <div className="depth-section">
          <span className="section-eyebrow">Compression Depth</span>
          <div className="section-title">Depth Range</div>
          <div className="depth-row">
            <div className="depth-card">
              <div className="depth-card-left">
                <div className="depth-card-label">Minimum Depth</div>
                <div className="depth-card-val">
                  {minDepth}<span>m</span>
                </div>
                <div className="depth-target">
                  <div className="depth-target-dot" style={{ background: "var(--yellow)" }} />
                  Target: ≥ 0.05 m (2 in)
                </div>
              </div>
              <div className="depth-card-icon">⬇</div>
            </div>
            <div className="depth-card">
              <div className="depth-card-left">
                <div className="depth-card-label">Maximum Depth</div>
                <div className="depth-card-val">
                  {maxDepth}<span>m</span>
                </div>
                <div className="depth-target">
                  <div className="depth-target-dot" style={{ background: "var(--accent)" }} />
                  Target: ≤ 0.06 m (2.4 in)
                </div>
              </div>
              <div className="depth-card-icon">⬆</div>
            </div>
          </div>
        </div>

        {/* ── Feedback ── */}
        <div className="feedback-section">
          <span className="section-eyebrow">Coaching Insights</span>
          <div className="section-title">Feedback</div>
          <div className="feedback-list">
            {feedback.map((f, i) => (
              <div
                key={i}
                className={`feedback-item ${isSuccess ? "feedback-item--success" : "feedback-item--warn"}`}
                style={{ animationDelay: `${0.05 * i}s` }}
              >
                <span className="feedback-icon">
                  {isSuccess ? "✓" : "⚠"}
                </span>
                <span className="feedback-text">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="report-divider" />

        {/* ── Footer ── */}
        <footer className="report-footer">
          <div className="report-footer-brand">
            <span>Precision</span>LABS · Procedural Training Intelligence
          </div>
          <div className="report-footer-meta">
            {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            &nbsp;·&nbsp;{sid}
          </div>
        </footer>

      </main>
    </>
  );
};

export default Report;