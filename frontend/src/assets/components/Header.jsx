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
          <li><a href="/">Home</a></li>
          <li><a href="/dashboard">Dashboard</a></li>
          <li><a href="dashboard" className="nav-cta">Launch Demo</a></li>
        </ul>
      </nav></>
  )
}
