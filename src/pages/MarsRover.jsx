import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useFetch } from '../hooks/useFetch.js'
import './MarsRover.css'

const NASA_KEY = 'SzL0Vn3PyyIcgjaEuRNgSU4ae130mwcuJYeg0Kpf'
const MAX_SOL  = 3800

const CAMERAS = [
  { id: 'ALL',  label: 'All Cameras' },
  { id: 'FHAZ', label: 'Front Hazard' },
  { id: 'RHAZ', label: 'Rear Hazard' },
  { id: 'MAST', label: 'Mastcam' },
  { id: 'CHEMCAM', label: 'ChemCam' },
  { id: 'NAVCAM', label: 'NavCam' },
]

export default function MarsRover() {

  const [sol, setSol]             = useState(1000)
  const [inputSol, setInputSol]   = useState('1000')
  const [camera, setCamera]       = useState('ALL')
  const [lightbox, setLightbox]   = useState(null)   // url | null


  const url = useMemo(
    () =>
      `https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=${sol}&api_key=${NASA_KEY}&page=1`,
    [sol]
  )

  const { data, loading, error } = useFetch(url)


  const photos = useMemo(() => {
    if (!data?.photos) return []
    if (camera === 'ALL') return data.photos.slice(0, 40)
    return data.photos.filter(p => p.camera.name === camera).slice(0, 40)
  }, [data, camera])


  useEffect(() => {
    document.title = `Sol ${sol} — Mars Rover — Space Explorer`
    return () => { document.title = 'Space Explorer' }
  }, [sol])


  const galleryRef = useRef(null)
  useEffect(() => {
    if (photos.length && galleryRef.current) {
      galleryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [photos])


  const handleSolSubmit = useCallback((e) => {
    e.preventDefault()
    const val = Math.max(0, Math.min(MAX_SOL, parseInt(inputSol, 10) || 0))
    setSol(val)
    setInputSol(String(val))
    setCamera('ALL')
  }, [inputSol])


  const handleCameraChange = useCallback((id) => {
    setCamera(id)
  }, [])


  const openLightbox  = useCallback((url) => setLightbox(url), [])
  const closeLightbox = useCallback(() => setLightbox(null), [])

  return (
    <div className="page-wrapper">
      <header className="mars-header fade-up">
        <span className="tag tag--accent3">NASA MARS ROVER</span>
        <h1 className="mars-title">Curiosity<br />Rover Photos</h1>
        <p className="mars-subtitle">
          Browse tens of thousands of raw photos taken by NASA's Curiosity rover.
          Each sol (Martian day) contains imagery from multiple onboard cameras.
        </p>
      </header>


      <form className="sol-row fade-up" onSubmit={handleSolSubmit}>
        <label className="sol-label" htmlFor="sol-input">SOL (MARTIAN DAY)</label>
        <input
          id="sol-input"
          type="number"
          className="sol-input"
          value={inputSol}
          min="0"
          max={MAX_SOL}
          onChange={e => setInputSol(e.target.value)}
        />
        <button type="submit" className="btn-go">Go →</button>
        <button
          type="button"
          className="btn-random"
          onClick={() => {
            const r = Math.floor(Math.random() * MAX_SOL)
            setSol(r)
            setInputSol(String(r))
            setCamera('ALL')
          }}
        >
          Random Sol
        </button>
      </form>


      {data?.photos?.length > 0 && (
        <div className="camera-filter fade-up">
          {CAMERAS.map(({ id, label }) => {
            const count = id === 'ALL'
              ? data.photos.length
              : data.photos.filter(p => p.camera.name === id).length
            return (
              <button
                key={id}
                className={`camera-btn${camera === id ? ' camera-btn--active' : ''}${count === 0 ? ' camera-btn--empty' : ''}`}
                onClick={() => handleCameraChange(id)}
                disabled={id !== 'ALL' && count === 0}
              >
                {label}
                <span className="camera-count">{count}</span>
              </button>
            )
          })}
        </div>
      )}


      {loading && <span className="spinner" />}
      {error   && <div className="error-box">⚠ {error}</div>}
      {!loading && data && photos.length === 0 && (
        <div className="error-box" style={{ color: 'var(--muted)' }}>
          No photos found for Sol {sol} with the selected camera.
          Try a different sol or camera.
        </div>
      )}


      {!loading && photos.length > 0 && (
        <div>
          <div className="gallery-info fade-up">
            <span className="tag tag--accent3">SOL {sol}</span>
            <span className="gallery-count">
              Showing {photos.length} of {data.photos.length} photos
            </span>
            <span className="tag">{data.photos[0]?.earth_date}</span>
          </div>

          <div className="gallery-grid fade-up" ref={galleryRef}>
            {photos.map((photo) => (
              <button
                key={photo.id}
                className="photo-tile"
                onClick={() => openLightbox(photo.img_src)}
                aria-label={`View photo ${photo.id} from ${photo.camera.full_name}`}
              >
                <img
                  src={photo.img_src}
                  alt={photo.camera.full_name}
                  loading="lazy"
                  className="photo-img"
                />
                <div className="photo-overlay">
                  <span>{photo.camera.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}


      {lightbox && (
        <div className="lightbox" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox}>✕</button>
          <img
            src={lightbox}
            alt="Mars rover photo"
            className="lightbox-img"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
