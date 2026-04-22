'use client'

import { useEffect, useState } from 'react'

export type GeolocationStatus = 'idle' | 'loading' | 'success' | 'denied' | 'unavailable'

export interface GeolocationCoords {
  lat: number
  lng: number
}

const STORAGE_KEY = 'michelin_user_location'

function readCached(): GeolocationCoords | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as GeolocationCoords
  } catch {
    return null
  }
}

function writeCache(coords: GeolocationCoords) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(coords))
  } catch {
    // localStorage unavailable
  }
}

export function useGeolocation() {
  const [status, setStatus] = useState<GeolocationStatus>('idle')
  const [coords, setCoords] = useState<GeolocationCoords | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus('unavailable')
      return
    }

    // Load cached position immediately so UI isn't blocked
    const cached = readCached()
    if (cached) {
      setCoords(cached)
      setStatus('success')
    } else {
      setStatus('loading')
    }

    // Always request a fresh position
    const timeoutId = setTimeout(() => {
      // If still loading after 10s, treat as denied
      setStatus((prev) => (prev === 'loading' ? 'denied' : prev))
    }, 10_000)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timeoutId)
        const fresh: GeolocationCoords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }
        writeCache(fresh)
        setCoords(fresh)
        setStatus('success')
      },
      (err) => {
        clearTimeout(timeoutId)
        if (err.code === GeolocationPositionError.PERMISSION_DENIED) {
          setStatus('denied')
        } else {
          setStatus('unavailable')
        }
      },
      { timeout: 10_000, maximumAge: 300_000 }
    )

    return () => clearTimeout(timeoutId)
  }, [])

  return { coords, status }
}
