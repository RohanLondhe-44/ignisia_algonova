import React, { useState ,useEffect} from 'react';
import {
  HeartPulse,
  Scissors,
  Syringe,
  Play,
  Clock,
  History,
  CheckCircle2,
  Circle,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import './Dashboard.css';
import {useNavigate} from "react-router-dom";

const PROCEDURES = [
  {
    id: 'cpr',
    Icon: HeartPulse,
    title: 'CPR',
    subtitle: 'Cardiopulmonary Resuscitation',
    desc: 'Chest compression rhythm, hand placement, depth, and rate accuracy.',
    steps: 6,
  },
  {
    id: 'scalpel',
    Icon: Scissors,
    title: 'Scalpel Operation',
    subtitle: 'Surgical Incision Technique',
    desc: 'Grip angle, incision depth zone transitions, and dwell checkpoints.',
    steps: 8,
  },
  {
    id: 'syringe',
    Icon: Syringe,
    title: 'Syringe Injection',
    subtitle: 'Intramuscular / IV Injection',
    desc: 'Approach angle, insertion depth, aspiration sequence, and withdrawal.',
    steps: 5,
  },
];

const TIMER_PRESETS = [3, 5, 10, 15, 20];

export const Dashboard = () => {
  const [selected, setSelected] = useState(null);
  const [minutes, setMinutes] = useState(5);
  const [customMin, setCustomMin] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [launched, setLaunched] = useState(false);
  const [prediction, setPrediction] = useState(null);
  
  useEffect(() => {
  // fetch sessions
  fetch("http://localhost:5000/sessions")
    .then(res => res.json())
    .then(data => {
      setSessions(data.reverse());
    })
    .catch(err => console.error("Error fetching sessions:", err));

  
  fetch("http://localhost:5000/prediction")
    .then(res => res.json())
    .then(data => {
      if (data.status === "success") {
        setPrediction(data.data);
      }
    })
    .catch(err => console.error("Prediction error:", err));

}, []);

  const effectiveMinutes = useCustom && customMin ? parseInt(customMin) : minutes;

  const handleStart = () => {
    if (!selected) return;
    setLaunched(true);
    setTimeout(() => setLaunched(false), 2000);
  };
const [sessions, setSessions] = useState([]);
  const selectedProc = PROCEDURES.find(p => p.id === selected);
  
  const navigate = useNavigate()

  const navtofeed = () => {
  if (!selected) return;

  navigate("/feed", {
    state: {
      duration: effectiveMinutes * 60 // convert minutes → seconds
    }
  });
};

  return (
    <div className="dash-root">
      <main className="dash-main">


        <header className="dash-header">
          <div>
            <p className="dash-header-label">PrecisionLABS</p>
            <h1 className="dash-header-title">Start a New Session</h1>
          </div>
        </header>


        <section className="dash-section" style={{ animationDelay: '0.05s' }}>
          <div className="dash-section-head">
            <span className="dash-step-num">01</span>
            <div>
              <h2 className="dash-section-title">Select Procedure</h2>
              <p className="dash-section-sub">Choose the skill you want to practice today</p>
            </div>
          </div>

          <div className="procedure-grid">
            {PROCEDURES.map((p) => {
              const ProcIcon = p.Icon;
              return (
                <button
                  key={p.id}
                  className={`procedure-card ${selected === p.id ? 'procedure-selected' : ''}`}
                  onClick={() => setSelected(p.id)}
                >
                  <div className="proc-top">
                    <span className="proc-icon-wrap">
                      <ProcIcon size={22} strokeWidth={1.8} />
                    </span>
                  </div>
                  <h3 className="proc-title">{p.title}</h3>
                  <p className="proc-subtitle">{p.subtitle}</p>
                  <p className="proc-desc">{p.desc}</p>
                  <div className="proc-footer">
                    <span className="proc-steps">{p.steps} steps</span>
                    {selected === p.id
                      ? <span className="proc-selected-badge"><CheckCircle2 size={12} strokeWidth={2.5} /> Selected</span>
                      : <span className="proc-select-hint">Select <ChevronRight size={11} /></span>
                    }
                  </div>
                </button>
              );
            })}
          </div>
        </section>


        <section
          className={`dash-section ${!selected ? 'dash-section-dim' : ''}`}
          style={{ animationDelay: '0.1s' }}
        >
          <div className="dash-section-head">
            <span className="dash-step-num">02</span>
            <div>
              <h2 className="dash-section-title">Set Duration</h2>
              <p className="dash-section-sub">How long do you want to practice?</p>
            </div>
          </div>

          <div className="timer-row">
            {TIMER_PRESETS.map((m) => (
              <button
                key={m}
                className={`timer-chip ${!useCustom && minutes === m ? 'timer-chip-active' : ''}`}
                onClick={() => { setMinutes(m); setUseCustom(false); }}
              >
                {m}<span className="timer-chip-unit">m</span>
              </button>
            ))}
            <div className={`timer-custom ${useCustom ? 'timer-custom-active' : ''}`}>
              <Clock size={14} strokeWidth={2} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input
                type="number"
                min="1" max="60"
                placeholder="—"
                value={customMin}
                onChange={(e) => { setCustomMin(e.target.value); setUseCustom(true); }}
                onFocus={() => setUseCustom(true)}
                className="timer-input"
              />
              <span className="timer-chip-unit">min</span>
            </div>
          </div>

          <div className="timer-preview">
            <span className="timer-preview-label">Session length</span>
            <div className="timer-bar-track">
              <div
                className="timer-bar-fill"
                style={{ width: `${Math.min((effectiveMinutes / 20) * 100, 100)}%` }}
              />
            </div>
            <span className="timer-preview-val">{effectiveMinutes} min</span>
          </div>
        </section>


        <section
          className={`dash-section ${!selected ? 'dash-section-dim' : ''}`}
          style={{ animationDelay: '0.15s' }}
        >
          <div className="dash-section-head">
            <span className="dash-step-num">03</span>
            <div>
              <h2 className="dash-section-title">Launch Session</h2>
              <p className="dash-section-sub">Camera access will be requested on start</p>
            </div>
          </div>

          <div className="launch-row">
            <div className="launch-summary">
              {selectedProc ? (
                <>
                  <span className="launch-summary-icon-wrap">
                    <selectedProc.Icon size={20} strokeWidth={1.8} />
                  </span>
                  <div>
                    <p className="launch-summary-proc">{selectedProc.title}</p>
                    <p className="launch-summary-dur">{effectiveMinutes} min session</p>
                  </div>
                  <ArrowRight size={16} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
                </>
              ) : (
                <p className="launch-summary-empty">No procedure selected yet</p>
              )}
            </div>

            <button
              className={`btn-launch ${!selected ? 'btn-launch-disabled' : ''} ${launched ? 'btn-launch-go' : ''}`}
              onClick={navtofeed}
              disabled={!selected}
            >
              <Play size={16} strokeWidth={2.5} fill="currentColor" />
              {launched ? 'Launching…' : 'Start Session'}
            </button>
          </div>
        </section>

       <section className="dash-section dash-section-history" style={{ animationDelay: '0.2s' }}>
  <div className="dash-section-head">
    <span className="dash-step-num dash-step-purple">
      <History size={16} strokeWidth={2} />
    </span>
    <div>
      <h2 className="dash-section-title">Session History</h2>
      <p className="dash-section-sub">Your previous performance timeline</p>
    </div>
  </div>

  {sessions.length === 0 ? (
    <div className="history-empty">
      <div className="history-empty-icon">
        <Circle size={40} strokeWidth={1} />
      </div>
      <p className="history-empty-title">No sessions yet</p>
      <p className="history-empty-sub">Complete your first session above.</p>
    </div>
  ) : (
    <div className="history-timeline">
      {sessions.map((s, i) => {
        const date = new Date(s.timestamp);

        return (
          <div key={i} className="history-item">


            <div className="history-line">
              <div className="history-dot" />
              {i !== sessions.length - 1 && <div className="history-connector" />}
            </div>

            {/* CARD */}
            <div className="history-card-pro">
              
              <div className="history-card-top">
                <div>
                  <p className="history-date">
                    {date.toLocaleDateString()} · {date.toLocaleTimeString()}
                  </p>
                  <p className="history-score">
                    {s.overall.toFixed(1)}<span>/100</span>
                  </p>
                </div>

                <div className="history-badge">
                  {s.overall >= 90 ? "EXCELLENT" :
                   s.overall >= 70 ? "GOOD" :
                   s.overall >= 50 ? "WORK" : "LOW"}
                </div>
              </div>

              <div className="history-metrics-row">
                <div>
                  <span>CPM</span>
                  <strong>{s.avgCPM.toFixed(0)}</strong>
                </div>
                <div>
                  <span>Depth</span>
                  <strong>{s.depthScore.toFixed(0)}%</strong>
                </div>
                <div>
                  <span>Hands</span>
                  <strong>{s.handsScore.toFixed(0)}%</strong>
                </div>
                <div>
                  <span>Elbow</span>
                  <strong>{s.elbowScore.toFixed(0)}%</strong>
                </div>
              </div>

            </div>
          </div>
        );
      })}
    </div>
  )}

  <br/>
<section className="dash-section dash-section-prediction" style={{ animationDelay: '0.18s' }}>
  <div className="dash-section-head">
    <span className="dash-step-num dash-step-purple">04</span>
    <div>
      <h2 className="dash-section-title">Skill Retention</h2>
      <p className="dash-section-sub">AI-based decay prediction</p>
    </div>
  </div>

  {!prediction ? (
    <div className="history-empty">
      <p className="history-empty-title">Not enough data</p>
      <p className="history-empty-sub">Complete at least 2 sessions.</p>
    </div>
  ) : (
    <div className="prediction-card">
      
      <div className="prediction-main">
        <div>
          <p className="prediction-label">Current Skill</p>
          <h2 className="prediction-value">
            {(prediction.current_skill * 100).toFixed(0)}%
          </h2>
        </div>

        <div>
          <p className="prediction-label">Decay Time</p>
          <h2 className="prediction-value">
            {prediction.decay_days} days
          </h2>
        </div>
      </div>

      <div className="prediction-bar-track">
        <div
          className="prediction-bar-fill"
          style={{ width: `${prediction.current_skill * 100}%` }}
        />
      </div>

      <div className="prediction-reco">
        {prediction.recommendation}
      </div>

    </div>
  )}
</section>
</section>

      </main>
    </div>
  );
};