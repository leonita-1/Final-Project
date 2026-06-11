import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useFetch } from '../hooks/useFetch.js'
import './Asteroids.css'

const NASA_KEY = 'SzL0Vn3PyyIcgjaEuRNgSU4ae130mwcuJYeg0Kpf'

function formatDate(d) {
  return d.toISOString().split('T')[0]
}

function kmToMiles(km) {
  return (parseFloat(km) * 0.621371).toFixed(0)
}

export default function Asteroids() {

  const [url, setUrl] = useState(null)

  useEffect(() => {
    const start = new Date()
    const end   = new Date(start)
    end.setDate(end.getDate() + 7)
    setUrl(
      `https://api.nasa.gov/neo/rest/v1/feed?start_date=${formatDate(start)}&end_date=${formatDate(end)}&api_key=${NASA_KEY}`
    )
    document.title = 'Near-Earth Asteroids — Space Explorer'
    return () => { document.title = 'Space Explorer' }
  }, [])

  const { data, loading, error } = useFetch(url)


  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('miss_km')


  const asteroids = useMemo(() => {
    if (!data?.near_earth_objects) return []

    const flat = Object.values(data.near_earth_objects).flat()

    const filtered = search.trim()
      ? flat.filter(a =>
          a.name.toLowerCase().includes(search.toLowerCase())
        )
      : flat

    return filtered.sort((a, b) => {
      const ca = a.close_approach_data[0]
      const cb = b.close_approach_data[0]
      if (sortKey === 'miss_km') {
        return parseFloat(ca.miss_distance.kilometers) - parseFloat(cb.miss_distance.kilometers)
      }
      if (sortKey === 'diameter') {
        const da = a.estimated_diameter.kilometers.estimated_diameter_max
        const db = b.estimated_diameter.kilometers.estimated_diameter_max
        return db - da
      }
      if (sortKey === 'velocity') {
        return (
          parseFloat(cb.relative_velocity.kilometers_per_second) -
          parseFloat(ca.relative_velocity.kilometers_per_second)
        )
      }
      return 0
    })
  }, [data, search, sortKey])


  const handleSearch = useCallback((e) => {
    setSearch(e.target.value)
  }, [])


  const handleSort = useCallback((key) => {
    setSortKey(key)
  }, [])


  const tableRef = useRef(null)
  useEffect(() => {
    if (asteroids.length && tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [asteroids])

  const hazardCount = useMemo(
    () => asteroids.filter(a => a.is_potentially_hazardous_asteroid).length,
    [asteroids]
  )

  return (
    <div className="page-wrapper">

      <header className="ast-header fade-up">
        <span className="tag tag--accent2">NASA NeoWs</span>
        <h1 className="ast-title">Near-Earth<br />Asteroid Tracker</h1>
        <p className="ast-subtitle">
          Real-time data from NASA's Near Earth Object Web Service. Showing
          all asteroids making a close approach to Earth in the next 7 days.
        </p>
      </header>


      {!loading && asteroids.length > 0 && (
        <div className="ast-stats fade-up">
          <div className="stat-card">
            <span className="stat-value">{asteroids.length}</span>
            <span className="stat-label">Total Objects</span>
          </div>
          <div className="stat-card stat-card--danger">
            <span className="stat-value">{hazardCount}</span>
            <span className="stat-label">Potentially Hazardous</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">
              {data?.element_count ?? '—'}
            </span>
            <span className="stat-label">Total in Dataset</span>
          </div>
        </div>
      )}


      {!loading && asteroids.length > 0 && (
        <div className="ast-controls fade-up">
          <input
            type="text"
            className="ast-search"
            placeholder="Search by name…"
            value={search}
            onChange={handleSearch}
          />
          <div className="sort-buttons">
            <span className="sort-label">SORT BY</span>
            {[
              { key: 'miss_km',   label: 'Closest' },
              { key: 'diameter',  label: 'Largest' },
              { key: 'velocity',  label: 'Fastest' },
            ].map(({ key, label }) => (
              <button
                key={key}
                className={`sort-btn${sortKey === key ? ' sort-btn--active' : ''}`}
                onClick={() => handleSort(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && <span className="spinner" />}
      {error   && <div className="error-box">⚠ {error}</div>}


      {!loading && asteroids.length > 0 && (
        <div className="ast-table-wrap fade-up" ref={tableRef}>
          <table className="ast-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Diameter (km)</th>
                <th>Miss Distance (km)</th>
                <th>Velocity (km/s)</th>
                <th>Date</th>
                <th>Hazard</th>
              </tr>
            </thead>
            <tbody>
              {asteroids.map((a) => {
                const ca       = a.close_approach_data[0]
                const dMax     = a.estimated_diameter.kilometers.estimated_diameter_max
                const dMin     = a.estimated_diameter.kilometers.estimated_diameter_min
                const miss     = parseFloat(ca.miss_distance.kilometers)
                const vel      = parseFloat(ca.relative_velocity.kilometers_per_second)
                const hazard   = a.is_potentially_hazardous_asteroid
                const closeMoon = miss < 384400   // inside lunar orbit

                return (
                  <tr
                    key={a.id}
                    className={hazard ? 'row--hazard' : closeMoon ? 'row--close' : ''}
                  >
                    <td className="cell-name">
                      <a
                        href={a.nasa_jpl_url}
                        target="_blank"
                        rel="noreferrer"
                        className="ast-link"
                      >
                        {a.name.replace(/[()]/g, '')}
                      </a>
                    </td>
                    <td>{dMin.toFixed(3)} – {dMax.toFixed(3)}</td>
                    <td>
                      <span className={closeMoon ? 'cell-close' : ''}>
                        {miss.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                      <span className="cell-sub">
                        {kmToMiles(miss)} mi
                      </span>
                    </td>
                    <td>{vel.toFixed(2)}</td>
                    <td className="cell-date">{ca.close_approach_date}</td>
                    <td>
                      {hazard
                        ? <span className="badge badge--danger">YES</span>
                        : <span className="badge">NO</span>
                      }
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && search && asteroids.length === 0 && (
        <div className="error-box" style={{ color: 'var(--muted)' }}>
          No asteroids match "{search}". Try a different search.
        </div>
      )}
    </div>
  )
}
