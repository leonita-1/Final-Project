
import { Link } from 'react-router-dom'
import './NotFound.css'

export default function NotFound() {
  return (
    <div className="notfound">
      <div className="notfound__glyph">◎</div>
      <h1 className="notfound__code">404</h1>
      <p className="notfound__msg">Lost in space. This page doesn't exist.</p>
      <Link to="/" className="notfound__btn">← Return to Earth</Link>
    </div>
  )
}
