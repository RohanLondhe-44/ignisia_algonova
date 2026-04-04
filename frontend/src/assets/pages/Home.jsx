import React from 'react';
import './Home.css';
import HandImage from '../Hand.png';


const HERO_IMAGE = '/assets/hero.jpg';

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
    title: 'Report Generation',
    description:
      'Instant performance report is generated after session completion, showing compression rate, depth accuracy, hand placement, fatigue detection, and overall score with actionable feedback.',
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


export const Home = () => {
  return (
    <>

      <section className="hero">
        <div className="hero-bg">
          <img src={HERO_IMAGE} alt="Procedural skill training" />
        </div>
        <div className="hero-glow" />
        <div className="hero-glow2" />


        <div className="hero-inner">


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


          <div className="hero-image-col">
            <div className="hero-image-wrapper">

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
    </>
  );
};
