import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useFetch } from '../hooks/useFetch.js'
import './Home.css'

const NASA_KEY = 'SzL0Vn3PyyIcgjaEuRNgSU4ae130mwcuJYeg0Kpf'

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

export default function Home() {

  const [date, setDate] = useState(todayISO)


  const url = useMemo(
    () => `https://api.nasa.gov/planetary/apod?api_key=${NASA_KEY}&date=${date}`,
    [date]
  )

  const { data: apod, loading, error } = useFetch(url)


  useEffect(() => {
    document.title = apod?.title ? `${apod.title} — Space Explorer` : 'Space Explorer'
    return () => { document.title = 'Space Explorer' }
  }, [apod?.title])


  const handleDateChange = useCallback((e) => {
    setDate(e.target.value)
  }, [])


  const mediaRef = useRef(null)

  useEffect(() => {
    if (apod && mediaRef.current) {
      mediaRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [apod])

  return (
    <div className="page-wrapper">
      {/* ── Header ──────────────────────────── */}
      <header className="home-header fade-up">
        <span className="tag tag--accent">NASA APOD</span>
        <h1 className="home-title">Astronomy Picture<br />of the Day</h1>
        <p className="home-subtitle">
          Each day NASA features a different image or photograph of our universe,
          along with a brief explanation written by a professional astronomer.
        </p>
      </header>

      {/* ── Date picker ─────────────────────── */}
      <div className="date-row fade-up">
        <label className="date-label" htmlFor="apod-date">SELECT DATE</label>
        <input
            id="apod-date"
            type="text"
            className="date-input"
            value={date}
            placeholder="YYYY-MM-DD"
            onChange={handleDateChange}
        />
        <button
          className="btn-today"
          onClick={() => setDate(todayISO())}
        >
          Today
        </button>
      </div>

      {/* ── Content ─────────────────────────── */}
      {loading && <span className="spinner" />}
      {error   && <div className="error-box">⚠ {error}</div>}

      {apod && !loading && (
        <article className="apod-card fade-up" ref={mediaRef}>
          {apod.media_type === 'image' ? (
            <div className="apod-media">
              <img
                src={apod.url}
                alt={apod.title}
                className="apod-img"
                loading="lazy"
              />
              {apod.hdurl && (
                <a
                  href={apod.hdurl}
                  target="_blank"
                  rel="noreferrer"
                  className="apod-hd-link"
                >
                  View HD ↗
                </a>
              )}
            </div>
          ) : (
            <div className="apod-video-wrap">
              <iframe
                src={apod.url}
                title={apod.title}
                frameBorder="0"
                allowFullScreen
                className="apod-video"
              />
            </div>
          )}

          <div className="apod-body">
            <div className="apod-meta">
              <span className="tag tag--accent2">{apod.date}</span>
              {apod.copyright && (
                <span className="tag">© {apod.copyright.trim()}</span>
              )}
            </div>
            <h2 className="apod-title">{apod.title}</h2>
            <p className="apod-explanation">{apod.explanation}</p>
          </div>
        </article>
      )}
    </div>
  )
}
