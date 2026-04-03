import React from 'react'

const Header = () => {
  return (
    <div>
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
    </div>
  )
}

export default Header
