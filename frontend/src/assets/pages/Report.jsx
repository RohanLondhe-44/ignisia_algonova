import React, { useState } from 'react';
import {
  HeartPulse,
  Syringe,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Calendar,
  Download,
  Printer,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
  BarChart2,
  ShieldCheck,
  Zap,
  Activity,
} from 'lucide-react';
import './Report.css';

// ─── Sample report data (replace with real session data) ────────
const REPORT = {
  id: 'RPT-20250612-001',
  procedure: 'CPR',
  procedureIcon: HeartPulse,
  subtitle: 'Cardiopulmonary Resuscitation',
  difficulty: 'Intermediate',
  practiceStart: 'Jun 12, 2025 — 09:14 AM',
  practiceEnd:   'Jun 12, 2025 — 09:19 AM',
  durationMinutes: 5,
  overallScore: 94,
  previousScore: 78,
  status: 'passed',      // passed | review | failed
  trainee: 'Student Name',
  institution: 'PrecisionLABS Training',

  metrics: [
    { label: 'Grip Accuracy',     value: 96, unit: '%',  icon: ShieldCheck },
    { label: 'Rhythm Consistency',value: 91, unit: '%',  icon: Activity },
    { label: 'Avg Response Time', value: 82, unit: 'ms', icon: Zap },
    { label: 'Steps Completed',   value: '6/6', unit: '',icon: BarChart2 },
  ],

  steps: [
    { id: 1, label: 'Scene safety check',          status: 'done',    time: '00:08' },
    { id: 2, label: 'Check responsiveness',         status: 'done',    time: '00:14' },
    { id: 3, label: 'Call for help / AED',          status: 'done',    time: '00:22' },
    { id: 4, label: 'Chest compressions — 30x',     status: 'done',    time: '00:55' },
    { id: 5, label: 'Rescue breaths — 2x',          status: 'warning', time: '01:10' },
    { id: 6, label: 'Continue CPR cycle',           status: 'done',    time: '04:58' },
  ],

  alerts: [
    { time: '00:52', type: 'warning', message: 'Compression depth slightly shallow — press deeper by ~1 cm' },
    { time: '01:08', type: 'error',   message: 'Rescue breath angle incorrect — tilt head further back' },
  ],

  fatigueDetected: false,
  fatigueTimestamp: null,
};

// ─── Helpers ────────────────────────────────────────────────────
function ScoreDelta({ current, previous }) {
  const diff = current - previous;
  if (diff > 0) return (
    <span className="rpt-delta rpt-delta-up">
      <TrendingUp size={13} strokeWidth={2.5} /> +{diff} vs last
    </span>
  );
  if (diff < 0) return (
    <span className="rpt-delta rpt-delta-down">
      <TrendingDown size={13} strokeWidth={2.5} /> {diff} vs last
    </span>
  );
  return (
    <span className="rpt-delta rpt-delta-flat">
      <Minus size={13} strokeWidth={2.5} /> No change
    </span>
  );
}

function ScoreArc({ score }) {
  const r = 52;
  const circ = Math.PI * r; // half circle
  const fill = (score / 100) * circ;
  const color = score >= 85 ? '#16a34a' : score >= 65 ? '#d97706' : '#dc2626';
  return (
    <svg width="140" height="80" viewBox="0 0 140 80" className="score-arc-svg">
      {/* track */}
      <path
        d="M 14 74 A 56 56 0 0 1 126 74"
        fill="none" stroke="#e5e7eb" strokeWidth="8" strokeLinecap="round"
      />
      {/* fill */}
      <path
        d="M 14 74 A 56 56 0 0 1 126 74"
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${(score / 100) * 175.9} 175.9`}
        style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1)' }}
      />
      <text x="70" y="68" textAnchor="middle" fontSize="26" fontWeight="800"
        fontFamily="Syne, sans-serif" fill={color}>{score}</text>
      <text x="70" y="80" textAnchor="middle" fontSize="9" fontWeight="600"
        fontFamily="DM Sans, sans-serif" fill="#9ca3af" letterSpacing="2">SCORE</text>
    </svg>
  );
}

// ─── Component ─────────────────────────────────────────────────
const Report = () => {
  const [alertsOpen, setAlertsOpen] = useState(true);
  const r = REPORT;
  const ProcIcon = r.procedureIcon;

  const statusMap = {
    passed: { label: 'PASSED',       bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' },
    review: { label: 'NEEDS REVIEW', bg: '#fef9c3', color: '#a16207', border: '#fde68a' },
    failed: { label: 'FAILED',       bg: '#fee2e2', color: '#b91c1c', border: '#fecaca' },
  };
  const st = statusMap[r.status];

  return (
    <div className="rpt-page">

      {/* ── Dark top bar (matches dashboard) ── */}
      <div className="rpt-topbar">
        <div className="rpt-topbar-inner">
          <a href="/dashboard" className="rpt-back">
            <span className="rpt-back-dot" />
            PrecisionLABS
          </a>
          <div className="rpt-topbar-actions">
            <button className="rpt-btn-ghost" onClick={() => window.print()}>
              <Printer size={15} strokeWidth={2} /> Print
            </button>
            <button className="rpt-btn-accent">
              <Download size={15} strokeWidth={2} /> Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* ── White report body ── */}
      <div className="rpt-wrap">
        <div className="rpt-paper" id="report-print">

          {/* ════ REPORT HEADER ════ */}
          <div className="rpt-header">
            <div className="rpt-header-left">
              <div className="rpt-id-row">
                <span className="rpt-id">{r.id}</span>
                <span
                  className="rpt-status-badge"
                  style={{ background: st.bg, color: st.color, borderColor: st.border }}
                >
                  {st.label}
                </span>
              </div>
              <h1 className="rpt-title">Practice Session Report</h1>
              <p className="rpt-institution">{r.institution} · {r.trainee}</p>
            </div>

            {/* score arc */}
            <div className="rpt-score-block">
              <ScoreArc score={r.overallScore} />
              <ScoreDelta current={r.overallScore} previous={r.previousScore} />
            </div>
          </div>

          {/* ════ PRACTICE PERIOD ════ */}
          <div className="rpt-period-band">
            <div className="rpt-period-item">
              <div className="rpt-period-icon"><ProcIcon size={16} strokeWidth={1.8} /></div>
              <div>
                <p className="rpt-period-key">Procedure</p>
                <p className="rpt-period-val">{r.procedure} <span className="rpt-period-sub">— {r.subtitle}</span></p>
              </div>
            </div>
            <div className="rpt-period-divider" />
            <div className="rpt-period-item">
              <div className="rpt-period-icon"><Calendar size={16} strokeWidth={1.8} /></div>
              <div>
                <p className="rpt-period-key">Practice Start</p>
                <p className="rpt-period-val">{r.practiceStart}</p>
              </div>
            </div>
            <div className="rpt-period-divider" />
            <div className="rpt-period-item">
              <div className="rpt-period-icon"><Calendar size={16} strokeWidth={1.8} /></div>
              <div>
                <p className="rpt-period-key">Practice End</p>
                <p className="rpt-period-val">{r.practiceEnd}</p>
              </div>
            </div>
            <div className="rpt-period-divider" />
            <div className="rpt-period-item">
              <div className="rpt-period-icon"><Clock size={16} strokeWidth={1.8} /></div>
              <div>
                <p className="rpt-period-key">Total Duration</p>
                <p className="rpt-period-val">{r.durationMinutes} minutes</p>
              </div>
            </div>
          </div>

          {/* ════ METRICS GRID ════ */}
          <div className="rpt-section">
            <h2 className="rpt-section-title">Performance Metrics</h2>
            <div className="rpt-metrics-grid">
              {r.metrics.map((m) => {
                const MIcon = m.icon;
                return (
                  <div className="rpt-metric-card" key={m.label}>
                    <div className="rpt-metric-icon"><MIcon size={16} strokeWidth={1.8} /></div>
                    <p className="rpt-metric-val">{m.value}<span className="rpt-metric-unit">{m.unit}</span></p>
                    <p className="rpt-metric-label">{m.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ════ STEP CHECKLIST ════ */}
          <div className="rpt-section">
            <h2 className="rpt-section-title">Step Completion</h2>
            <div className="rpt-steps">
              {r.steps.map((s, i) => (
                <div
                  className={`rpt-step rpt-step-${s.status}`}
                  key={s.id}
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <div className="rpt-step-icon">
                    {s.status === 'done'    && <CheckCircle2  size={18} strokeWidth={2} />}
                    {s.status === 'warning' && <AlertTriangle size={18} strokeWidth={2} />}
                    {s.status === 'failed'  && <XCircle       size={18} strokeWidth={2} />}
                  </div>
                  <span className="rpt-step-num">Step {s.id}</span>
                  <span className="rpt-step-label">{s.label}</span>
                  <span className="rpt-step-time">{s.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ════ ALERT LOG ════ */}
          <div className="rpt-section">
            <button
              className="rpt-section-title rpt-collapsible"
              onClick={() => setAlertsOpen(o => !o)}
            >
              Corrective Alerts
              <span className="rpt-alert-count">{r.alerts.length}</span>
              {alertsOpen ? <ChevronUp size={16} strokeWidth={2} /> : <ChevronDown size={16} strokeWidth={2} />}
            </button>

            {alertsOpen && (
              <div className="rpt-alerts">
                {r.alerts.length === 0 ? (
                  <div className="rpt-alerts-empty">
                    <CheckCircle2 size={18} strokeWidth={2} style={{ color: '#15803d' }} />
                    No corrective alerts — perfect session!
                  </div>
                ) : r.alerts.map((a, i) => (
                  <div className={`rpt-alert rpt-alert-${a.type}`} key={i}>
                    <span className="rpt-alert-time">{a.time}</span>
                    <div className="rpt-alert-icon">
                      {a.type === 'warning'
                        ? <AlertTriangle size={14} strokeWidth={2.5} />
                        : <XCircle size={14} strokeWidth={2.5} />}
                    </div>
                    <p className="rpt-alert-msg">{a.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ════ FATIGUE ════ */}
          <div className="rpt-section rpt-section-last">
            <h2 className="rpt-section-title">Fatigue Analysis</h2>
            <div className={`rpt-fatigue-banner ${r.fatigueDetected ? 'rpt-fatigue-yes' : 'rpt-fatigue-no'}`}>
              {r.fatigueDetected
                ? <><AlertTriangle size={16} strokeWidth={2} /> Hand fatigue detected at {r.fatigueTimestamp} — mandatory rest was enforced.</>
                : <><CheckCircle2  size={16} strokeWidth={2} /> No hand fatigue detected during this session. Tremor levels within normal range.</>
              }
            </div>
          </div>

          {/* ════ PRINT FOOTER ════ */}
          <div className="rpt-print-footer">
            <span>{r.institution}</span>
            <span>{r.id}</span>
            <span>Generated by PrecisionLABS</span>
          </div>

        </div>{/* /rpt-paper */}
      </div>
    </div>
  );
};
export default Report;