import React from 'react';
import './Home.css';

// ── Replace this import with your hero image ──────────────────
// import HeroImage from './assets/hero.jpg';
// Then use: <img src={HeroImage} alt="Hero" />
// For now we use a placeholder path string.
const HERO_IMAGE = '/assets/hero.jpg'; // ← swap with your image

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

// ─── Skeleton SVG (decorative hand-joint preview) ─────────────
const SkeletonPreview = () => (
  <svg className="card-skeleton-svg" viewBox="0 0 80 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* palm */}
    <circle cx="40" cy="90" r="5" fill="#00e5ff" opacity="0.9"/>
    {/* thumb */}
    <line x1="35" y1="88" x2="18" y2="72" stroke="#00e5ff" strokeWidth="1.5" opacity="0.6"/>
    <circle cx="18" cy="72" r="3" fill="#00e5ff" opacity="0.8"/>
    <line x1="18" y1="72" x2="10" y2="60" stroke="#00e5ff" strokeWidth="1.5" opacity="0.5"/>
    <circle cx="10" cy="60" r="2.5" fill="#7b5ea7" opacity="0.9"/>
    {/* index */}
    <line x1="38" y1="85" x2="34" y2="60" stroke="#00e5ff" strokeWidth="1.5" opacity="0.6"/>
    <circle cx="34" cy="60" r="3" fill="#00e5ff" opacity="0.8"/>
    <line x1="34" y1="60" x2="32" y2="42" stroke="#00e5ff" strokeWidth="1.5" opacity="0.5"/>
    <circle cx="32" cy="42" r="2.5" fill="#00e5ff" opacity="0.9"/>
    <line x1="32" y1="42" x2="31" y2="28" stroke="#00e5ff" strokeWidth="1.5" opacity="0.4"/>
    <circle cx="31" cy="28" r="2" fill="#00e676" opacity="1"/>
    {/* middle */}
    <line x1="40" y1="85" x2="40" y2="58" stroke="#00e5ff" strokeWidth="1.5" opacity="0.6"/>
    <circle cx="40" cy="58" r="3" fill="#00e5ff" opacity="0.8"/>
    <line x1="40" y1="58" x2="40" y2="38" stroke="#00e5ff" strokeWidth="1.5" opacity="0.5"/>
    <circle cx="40" cy="38" r="2.5" fill="#00e5ff" opacity="0.9"/>
    <line x1="40" y1="38" x2="40" y2="22" stroke="#00e5ff" strokeWidth="1.5" opacity="0.4"/>
    <circle cx="40" cy="22" r="2" fill="#00e676" opacity="1"/>
    {/* ring */}
    <line x1="43" y1="85" x2="46" y2="60" stroke="#00e5ff" strokeWidth="1.5" opacity="0.6"/>
    <circle cx="46" cy="60" r="3" fill="#00e5ff" opacity="0.8"/>
    <line x1="46" y1="60" x2="48" y2="42" stroke="#00e5ff" strokeWidth="1.5" opacity="0.5"/>
    <circle cx="48" cy="42" r="2.5" fill="#00e5ff" opacity="0.9"/>
    <line x1="48" y1="42" x2="49" y2="28" stroke="#00e5ff" strokeWidth="1.5" opacity="0.4"/>
    <circle cx="49" cy="28" r="2" fill="#00e676" opacity="1"/>
    {/* pinky */}
    <line x1="44" y1="87" x2="56" y2="65" stroke="#00e5ff" strokeWidth="1.5" opacity="0.6"/>
    <circle cx="56" cy="65" r="3" fill="#00e5ff" opacity="0.8"/>
    <line x1="56" y1="65" x2="60" y2="50" stroke="#00e5ff" strokeWidth="1.5" opacity="0.5"/>
    <circle cx="60" cy="50" r="2.5" fill="#7b5ea7" opacity="0.9"/>
    <line x1="60" y1="50" x2="62" y2="38" stroke="#00e5ff" strokeWidth="1.5" opacity="0.4"/>
    <circle cx="62" cy="38" r="2" fill="#00e676" opacity="1"/>
    {/* wrist */}
    <line x1="40" y1="90" x2="40" y2="108" stroke="#00e5ff" strokeWidth="1.5" opacity="0.4"/>
    <circle cx="34" cy="108" r="3" fill="#00e5ff" opacity="0.5"/>
    <circle cx="46" cy="108" r="3" fill="#00e5ff" opacity="0.5"/>
    <line x1="34" y1="108" x2="46" y2="108" stroke="#00e5ff" strokeWidth="1.5" opacity="0.3"/>
  </svg>
);

// ─── Component ────────────────────────────────────────────────
export const Home = () => {
  return (
    <>
      {/* ── NAV ─────────────────────────────────────────────── */}
      <nav className="nav">
        <a href="#" className="nav-logo">
          <span className="nav-logo-dot" />
          PrecisionLABS <span style={{ fontWeight: 400, opacity: 0.5 }}></span>
        </a>
        <ul className="nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#how">How It Works</a></li>
          <li><a href="#disciplines">Disciplines</a></li>
          <li><a href="#cta" className="nav-cta">Launch Demo</a></li>
        </ul>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="hero">
        {/* ── Hero Image — swap src to your image ─────────────
            Import your image at the top of the file and use it here.
            The overlay gradient + noise will blend it automatically. */}
        <div className="hero-bg">
          <img src={HERO_IMAGE} alt="Procedural skill training" />
        </div>

        <div className="hero-glow" />
        <div className="hero-glow2" />

        <div className="hero-content">
            {/* Floating preview card */}
        <div className="hero-card">
          <div className="card-header">
            <span className="card-title">Skeleton Overlay</span>
            <span className="card-live"><span className="live-dot" />Live</span>
          </div>
          <div className="card-skeleton">
            <SkeletonPreview />
          </div>
          <div className="checklist">
            <div className="check-item">
              <span className="check-icon check-done">✓</span>
              <span className="check-done-text">Grip angle — correct</span>
            </div>
            <div className="check-item">
              <span className="check-icon check-done">✓</span>
              <span className="check-done-text">Zone A → Zone B transition</span>
            </div>
            <div className="check-item">
              <span className="check-icon check-active">→</span>
              <span className="check-active-text">Dwell at checkpoint 3…</span>
            </div>
            <div className="check-item">
              <span className="check-icon check-pending">○</span>
              <span>Final release sequence</span>
            </div>
          </div>
        </div>
          <h1 className="hero-title">
            Precision<em>LABS</em><br />
          </h1>

          <p className="hero-sub">
            Practice. Precision. Perfect.
          </p>

          <p>Real-Time Procedural Skill Coach Using Hand-Tracking & Spatial Analysis.</p><br/>  
        
          <div className="hero-actions">
            <a href="#cta" className="btn-primary">
              ▶ &nbsp;Launch Live Demo
            </a>
            <a href="#features" className="btn-secondary">
              Explore Features →
            </a>
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

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="footer">
        <span className="footer-copy">© 2025 ED02 SkillCoach · Procedural Training Intelligence</span>
        <ul className="footer-links">
          <li><a href="#">Docs</a></li>
          <li><a href="#">Schema API</a></li>
          <li><a href="#">Privacy</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
      </footer>
    </>
  );
}

// export const Home = () => {
//   return (
//     <div>PrLabs</div>
//   )
// }
