import './Home.css';
import React from 'react'

export const Header = () => {
  return (
    <>
      {/* ── NAV ─────────────────────────────────────────────── */}
      <nav className="nav">
        <a href="#" className="nav-logo">
          <span className="nav-logo-dot" />
          PrecisionLABS
        </a>
        <ul className="nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#how">How It Works</a></li>
          <li><a href="#disciplines">Disciplines</a></li>
          <li><a href="dashboard" className="nav-cta">Launch Demo</a></li>
        </ul>
      </nav></>
  )
}
