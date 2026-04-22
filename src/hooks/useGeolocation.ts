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

    const cached = readCached()
    if (cached) {
      setCoords(cached)
      setStatus('success')
    } else {
      setStatus('loading')
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const fresh: GeolocationCoords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }
        writeCache(fresh)
        setCoords(fresh)
        setStatus('success')
      },
      (err) => {
        if (err.code === 1) {
          setStatus('denied')
        } else {
          setStatus('unavailable')
        }
      },
      { timeout: 10_000, maximumAge: 0 }
    )
  }, [])

  return { coords, status }
}
