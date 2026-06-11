
import { useState, useEffect, useCallback, useRef } from 'react'

export function useFetch(url) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)


  const abortRef = useRef(null)


  const fetchData = useCallback(async (fetchUrl) => {
    if (!fetchUrl) return


    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(fetchUrl, { signal: abortRef.current.signal })
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      const json = await res.json()
      setData(json)
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }, [])


  useEffect(() => {
    fetchData(url)
    return () => {
      if (abortRef.current) abortRef.current.abort()
    }
  }, [url, fetchData])


  const refetch = useCallback(() => fetchData(url), [url, fetchData])

  return { data, loading, error, refetch }
}
