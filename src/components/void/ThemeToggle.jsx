'use client'

import { useEffect, useState } from 'react'
import { applyMode, readMode } from '@/lib/theme'

function Icon({ mode }) {
  // Sun and moon as strokes, like the brand mark — geometry, not pictures.
  if (mode === 'light') {
    return (
      <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.3">
        <circle cx="8" cy="8" r="3.1" />
        <path d="M8 1v1.6M8 13.4V15M1 8h1.6M13.4 8H15M3 3l1.15 1.15M11.85 11.85 13 13M13 3l-1.15 1.15M4.15 11.85 3 13" strokeLinecap="round" />
      </svg>
    )
  }
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M13.4 9.6A5.8 5.8 0 0 1 6.4 2.6a5.9 5.9 0 1 0 7 7Z" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * Dark and light, nothing else. The accessible name says where you are and
 * where one press will take you, because an icon-only switch leaves a
 * screen-reader user guessing at both.
 */
export default function ThemeToggle() {
  const [mode, setMode] = useState('dark')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setMode(readMode())
    setReady(true)
  }, [])

  const next = mode === 'light' ? 'dark' : 'light'

  return (
    <button
      type="button"
      className="nv-theme"
      onClick={() => {
        setMode(next)
        applyMode(next)
      }}
      aria-label={`Theme: ${mode === 'light' ? 'Light' : 'Dark'}. Switch to ${next === 'light' ? 'light' : 'dark'}.`}
      aria-pressed={mode === 'light'}
      title={mode === 'light' ? 'Light theme' : 'Dark theme'}
      data-ready={ready || undefined}
    >
      <Icon mode={mode} />
      <span className="nv-theme-t mono">{mode === 'light' ? 'Light' : 'Dark'}</span>
    </button>
  )
}
