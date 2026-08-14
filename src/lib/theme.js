/**
 * Theme resolution.
 *
 * Three states, not two. A two-state toggle silently ignores the operating
 * system preference of everyone who never touches it — which is most people,
 * and exactly the readers a light theme exists for.
 *
 *   'system'  no attribute on <html>; CSS prefers-color-scheme decides
 *   'light'   data-theme="light"
 *   'dark'    data-theme="dark"
 */

export const THEME_KEY = 'pl-theme'
export const MODES = ['system', 'light', 'dark']

/**
 * Runs before first paint, inlined in <head> ahead of any stylesheet.
 *
 * Without this the document renders with the CSS default and is then corrected
 * by React, so every light-preferring reader gets a black flash on every
 * navigation — worse than the dark theme they were trying to leave. Kept to
 * one statement with no dependencies because it blocks the first paint.
 */
export const THEME_SCRIPT = `(function(){try{var m=localStorage.getItem('${THEME_KEY}');if(m==='light'||m==='dark'){document.documentElement.setAttribute('data-theme',m)}}catch(e){}})()`

/** The theme actually being displayed, once 'system' is resolved. */
export function resolve(mode) {
  if (mode === 'light' || mode === 'dark') return mode
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export function readMode() {
  if (typeof window === 'undefined') return 'system'
  try {
    const stored = localStorage.getItem(THEME_KEY)
    return MODES.includes(stored) ? stored : 'system'
  } catch {
    return 'system'
  }
}

export function applyMode(mode) {
  const root = document.documentElement

  if (mode === 'system') {
    root.removeAttribute('data-theme')
    try {
      localStorage.removeItem(THEME_KEY)
    } catch {}
  } else {
    root.setAttribute('data-theme', mode)
    try {
      localStorage.setItem(THEME_KEY, mode)
    } catch {}
  }

  // Mobile browser chrome should match the page ground, not lag a theme behind.
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', resolve(mode) === 'light' ? '#f4f4f6' : '#000000')
}
