import React from 'react';
import './Home.css';
import HandImage from '../Hand.png';

// ── Replace this with your actual image path ──────────────────
const HERO_IMAGE = '/assets/hero.jpg';
// ── This is the large right-side feature image ────────────────
const FEATURE_IMAGE = HandImage;

const features = [
  {
    num: '01',
    title: 'Real-Time Hand Landmark Tracking',
    description:
      'Extracts (x, y, z) coordinates for all 21 finger joints per frame from a standard smartphone or webcam — no special hardware required.',
    tag: 'Computer Vision',
  },
  {
    num: '02',
    title: 'JSON Procedure Schema Engine',
    description:
      'Encode any multi-step skill as spatial checkpoints with grip angle tolerances, zone transitions, and dwell-time requirements — fully configurable.',
    tag: 'State Machine',
  },
  {
    num: '03',
    title: 'Instant Corrective Alerts',
    description:
      'The error engine classifies every deviation by type and fires a specific corrective message in under 100 ms — telling the student exactly what to fix.',
    tag: 'Real-Time Feedback',
  },
  {
    num: '04',
    title: 'Fatigue Detection Module',
    description:
      'Analyses micro-tremor patterns (coordinate jitter) over extended sessions to detect hand fatigue and enforce mandatory rest breaks.',
    tag: 'Biosignal Analysis',
  },
];

const steps = [
  {
    num: '01',
    title: 'Point Your Camera',
    description: 'Open the web app on any device. Grant camera access. No installation needed.',
  },
  {
    num: '02',
    title: 'Select a Procedure',
    description: 'Choose your skill from the schema library — nursing, dental, culinary, electrical.',
  },
  {
    num: '03',
    title: 'Practice with Live Overlay',
    description: 'A joint skeleton appears on-screen in real time as you perform the procedure.',
  },
  {
    num: '04',
    title: 'Receive Instant Coaching',
    description: 'Corrective alerts fire the moment a deviation is detected. Checklist turns green step by step.',
  },
];

const disciplines = [
  { emoji: '🩺', name: 'Nursing' },
  { emoji: '🦷', name: 'Dentistry' },
  { emoji: '⚡', name: 'Electrical' },
  { emoji: '🍳', name: 'Culinary Arts' },
  { emoji: '🔧', name: 'Mechanical' },
  { emoji: '💉', name: 'Surgical' },
];

export const Home = () => {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg">
          <img src={HERO_IMAGE} alt="Procedural skill training" />
        </div>
        <div className="hero-glow" />
        <div className="hero-glow2" />

        {/* Two-column grid */}
        <div className="hero-inner">

          {/* ── LEFT: centered text ── */}
          <div className="hero-text-col">
            <h1 className="hero-title">
              Precision<em>LABS</em>
            </h1>

            <p className="hero-sub">Practice. Precision. Perfect.</p>

            <p className="hero-desc">
              Real-Time Procedural Skill Coach Using Hand-Tracking &amp; Spatial Analysis.
            </p>

            <div className="hero-actions">
              <a href="dashboard" className="btn-primary">▶ &nbsp;Launch Live Demo</a>
              <a href="#features" className="btn-secondary">Explore Features →</a>
            </div>
          </div>

          {/* ── RIGHT: large feature image ── */}
          <div className="hero-image-col">
            <div className="hero-image-wrapper">
              {/* Decorative corner accents */}
              <span className="img-corner img-corner--tl" />
              <span className="img-corner img-corner--tr" />
              <span className="img-corner img-corner--bl" />
              <span className="img-corner img-corner--br" />


              <img
                src={FEATURE_IMAGE}
                alt="Hand tracking in action"
                className="hero-feature-img"
              />

            </div>
          </div>

        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section className="features-section" id="features">
        <p className="section-label">Core Capabilities</p>
        <h2 className="section-title">Everything the system does.</h2>
        <p className="section-sub">
          Four tightly integrated modules that together turn a standard webcam
          into an objective, tireless skill assessor.
        </p>
        <div className="features-grid">
          {features.map((f) => (
            <div className="feature-card" key={f.num}>
              <span className="feature-num">{f.num}</span>
              <h3>{f.title}</h3>
              <p>{f.description}</p>
              <span className="feature-tag">{f.tag}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="how-section" id="how">
        <p className="section-label">Workflow</p>
        <h2 className="section-title">From camera to coaching in four steps.</h2>
        <div className="steps-row">
          {steps.map((s) => (
            <div className="step-item" key={s.num}>
              <div className="step-num">{s.num}</div>
              <h4>{s.title}</h4>
              <p>{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── DISCIPLINES ──────────────────────────────────────── */}
      <section className="disciplines-section" id="disciplines">
        <p className="section-label">Use Cases</p>
        <h2 className="section-title">Built for every hands-on discipline.</h2>
        <p className="section-sub">
          Any skill that can be encoded as a sequence of spatial checkpoints
          can be coached by ED02.
        </p>
        <div className="disciplines-grid">
          {disciplines.map((d) => (
            <div className="discipline-pill" key={d.name}>
              <span className="discipline-emoji">{d.emoji}</span>
              <span className="discipline-name">{d.name}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};
