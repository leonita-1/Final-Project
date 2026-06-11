
import { NavLink } from 'react-router-dom'
import './Navbar.css'

const NAV_ITEMS = [
  { to: '/',          label: 'APOD',       symbol: '✦' },
  { to: '/mars',      label: 'MARS',       symbol: '⬡' },
  { to: '/asteroids', label: 'ASTEROIDS',  symbol: '◈' },
]

export default function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar__brand">
        <span className="navbar__logo">◎</span>
        <span className="navbar__brand-text">SPACE<em>EXPLORER</em></span>
      </NavLink>

      <ul className="navbar__links">
        {NAV_ITEMS.map(({ to, label, symbol }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `navbar__link${isActive ? ' navbar__link--active' : ''}`
              }
            >
              <span className="navbar__symbol">{symbol}</span>
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
