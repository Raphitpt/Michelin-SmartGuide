'use client'

import { Trait } from './restaurantAnalyzer'
import { useEffect, useMemo, useRef, useState } from 'react'

type Props = {
  label: string
  options?: Trait[]
  selected?: Trait[]
  onChange: (val: Trait[]) => void
  max: number
}

export default function TagSelector({
  label,
  options = [],
  selected = [],
  onChange,
  max,
}: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // =====================
  // SAFE STATE
  // =====================
  const safeSelected = useMemo(
    () => selected.slice(0, max),
    [selected, max]
  )

  const availableOptions = useMemo(
    () =>
      options.filter(
        (opt) => !safeSelected.some((sel) => sel.id === opt.id)
      ),
    [options, safeSelected]
  )

  const isMaxReached = safeSelected.length >= max

  // =====================
  // OUTSIDE CLICK CLOSE
  // =====================
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () =>
      document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // =====================
  // ESC CLOSE
  // =====================
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('keydown', handleEsc)
    return () =>
      document.removeEventListener('keydown', handleEsc)
  }, [])

  // =====================
  // ACTIONS
  // =====================
  const addTag = (tag: Trait) => {
    if (isMaxReached) return setOpen(false)

    const next = [...safeSelected, tag].slice(0, max)
    onChange(next)
    setOpen(false)
  }

  const removeTag = (id: string) => {
    onChange(safeSelected.filter((t) => t.id !== id))
  }

  // =====================
  // UI
  // =====================
  return (
    <div>
      {/* HEADER */}
      <div className="flex justify-between mb-2">
        <label className="text-sm font-semibold">{label}</label>
        <span className="text-xs text-gray-500">
          {safeSelected.length}/{max}
        </span>
      </div>

      {/* DROPDOWN */}
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          disabled={isMaxReached}
          className={`w-full border px-3 py-2 rounded-md text-left transition
            ${
              isMaxReached
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white hover:border-gray-400'
            }`}
        >
          {isMaxReached ? 'Maximum de tags sélectionné' : 'Ajouter un tag'}
        </button>

        {open && !isMaxReached && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow max-h-60 overflow-auto">
            {availableOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-400">
                Aucun tag disponible
              </div>
            ) : (
              availableOptions.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => addTag(tag)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100"
                >
                  {tag.label}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* SELECTED TAGS */}
      <div className="flex flex-wrap gap-2 mt-3">
        {safeSelected.map((tag) => (
          <span
            key={tag.id}
            className="flex items-center gap-1 px-2 py-1 text-xs text-indigo-700 bg-indigo-100 rounded"
          >
            {tag.label}
            <button
              type="button"
              onClick={() => removeTag(tag.id)}
              className="text-indigo-500 hover:text-indigo-700"
            >
              ✕
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}