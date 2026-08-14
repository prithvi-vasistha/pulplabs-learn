'use client'

import { useEffect, useState } from 'react'
import { MODES, applyMode, readMode, resolve } from '@/lib/theme'

const LABEL = { system: 'System', light: 'Light', dark: 'Dark' }

function Icon({ shown }) {
  // Sun and moon as strokes, like the brand mark — geometry, not pictures.
  if (shown === 'light') {
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
 * Cycles System → Light → Dark. The accessible name always states where you
 * are and where one more press will take you, because a cycling control that
 * only shows an icon leaves a screen-reader user guessing at both.
 */
export default function ThemeToggle() {
  const [mode, setMode] = useState('system')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setMode(readMode())
    setReady(true)
  }, [])

  // Following the system means following it as it changes, not just at load.
  useEffect(() => {
    if (mode !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const onChange = () => applyMode('system')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [mode])

  const next = MODES[(MODES.indexOf(mode) + 1) % MODES.length]

  const change = () => {
    setMode(next)
    applyMode(next)
  }

  // Before hydration the stored mode is unknown, so render the frame without
  // committing to an icon rather than guessing and flipping.
  const shown = ready ? resolve(mode) : 'dark'

  return (
    <button
      type="button"
      className="nv-theme"
      onClick={change}
      aria-label={`Theme: ${LABEL[mode]}. Switch to ${LABEL[next]}.`}
      title={`Theme: ${LABEL[mode]}`}
      data-ready={ready || undefined}
    >
      <Icon shown={shown} />
      <span className="nv-theme-t mono">{LABEL[mode]}</span>
    </button>
  )
}
