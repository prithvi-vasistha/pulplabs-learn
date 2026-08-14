/**
 * Theme resolution.
 *
 * Two states, and dark is the default. The operating system preference is
 * deliberately not consulted: this product is dark by default for everyone,
 * and light is something a reader opts into and we then remember.
 *
 *   'dark'   no attribute on <html> — the CSS default
 *   'light'  data-theme="light"
 */

export const THEME_KEY = 'pl-theme'
export const MODES = ['dark', 'light']
export const DEFAULT_MODE = 'dark'

/**
 * Runs before first paint, inlined in <head> ahead of any stylesheet.
 *
 * Only 'light' needs stamping, because dark is what the stylesheet already
 * does. Anything later — an effect, a provider — renders one frame of the
 * wrong ground on every navigation.
 */
export const THEME_SCRIPT = `(function(){try{if(localStorage.getItem('${THEME_KEY}')==='light'){document.documentElement.setAttribute('data-theme','light')}}catch(e){}})()`

/** Kept for call sites that ask what is actually on screen. */
export function resolve(mode) {
  return mode === 'light' ? 'light' : 'dark'
}

export function readMode() {
  if (typeof window === 'undefined') return DEFAULT_MODE
  try {
    return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : DEFAULT_MODE
  } catch {
    return DEFAULT_MODE
  }
}

export function applyMode(mode) {
  const root = document.documentElement

  if (mode === 'light') {
    root.setAttribute('data-theme', 'light')
    try {
      localStorage.setItem(THEME_KEY, 'light')
    } catch {}
  } else {
    root.removeAttribute('data-theme')
    try {
      localStorage.removeItem(THEME_KEY)
    } catch {}
  }

  // Mobile browser chrome should match the page ground, not lag a theme behind.
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', mode === 'light' ? '#f4f4f6' : '#000000')
}
