'use client'

import { useEffect, useRef, useState } from 'react'

const reduced = () =>
  typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)

/* --------------------------------------------------------------------------
   useReveal — one document-level observer for every [data-r] element.

   Reveal is one-way. Re-animating on scroll-up is nauseating and, worse,
   turns reading into a slideshow the user cannot control.
   -------------------------------------------------------------------------- */
export function useReveal() {
  useEffect(() => {
    const mark = (el) => el.setAttribute('data-r', '1')

    if (reduced()) {
      document.querySelectorAll('[data-r]').forEach(mark)
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          mark(e.target)
          io.unobserve(e.target)
        }
      },
      // Fire a little before the element is fully in view: by the time the
      // reader's eye arrives the motion has already resolved.
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
    )

    const scan = () => document.querySelectorAll('[data-r=""], [data-r]:not([data-r="1"])').forEach((el) => io.observe(el))
    scan()

    const mo = new MutationObserver(scan)
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [])
}

/* --------------------------------------------------------------------------
   useScrolled — true past `after` px. Drives the nav's material.
   rAF-throttled: scroll fires far more often than the compositor can paint.
   -------------------------------------------------------------------------- */
export function useScrolled(after = 12) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    let frame = null
    const read = () => {
      frame = null
      setScrolled(window.scrollY > after)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read)
    }
    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [after])

  return scrolled
}

/* --------------------------------------------------------------------------
   useScrollProgress — 0→1 as an element travels through the viewport.

   Writes the value to a CSS custom property on the node rather than into
   React state: state would re-render the subtree on every frame. CSS reads
   the variable and the compositor does the rest.
   -------------------------------------------------------------------------- */
export function useScrollProgress({ from = 'bottom', to = 'top' } = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    if (reduced()) {
      node.style.setProperty('--p', '1')
      return
    }

    let frame = null
    const read = () => {
      frame = null
      const r = node.getBoundingClientRect()
      const vh = window.innerHeight

      const start = from === 'bottom' ? vh : 0
      const end = to === 'top' ? -r.height : vh
      const p = (start - r.top) / (start - end || 1)

      node.style.setProperty('--p', String(Math.max(0, Math.min(1, p))))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read)
    }

    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [from, to])

  return ref
}

/* --------------------------------------------------------------------------
   usePressable — scale feedback on pointer-DOWN, released on up/cancel.

   :active alone is unreliable on touch (it can lag or stick), and the whole
   point is that the response lands on the press, not the click.
   -------------------------------------------------------------------------- */
export function usePressable(scale = 0.97) {
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node || reduced()) return

    const down = () => {
      node.style.transform = `scale(${scale})`
    }
    const up = () => {
      node.style.transform = ''
    }

    node.addEventListener('pointerdown', down)
    node.addEventListener('pointerup', up)
    node.addEventListener('pointercancel', up)
    // Dragging off a pressed control must release it — the press was abandoned.
    node.addEventListener('pointerleave', up)

    return () => {
      node.removeEventListener('pointerdown', down)
      node.removeEventListener('pointerup', up)
      node.removeEventListener('pointercancel', up)
      node.removeEventListener('pointerleave', up)
    }
  }, [scale])

  return ref
}
