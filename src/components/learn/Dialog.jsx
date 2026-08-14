'use client'

import { useEffect, useRef } from 'react'

/**
 * A modal dialog.
 *
 * Focus moves in on open and returns to whatever had it on close; Tab cycles
 * inside; Escape and a backdrop click both dismiss. Body scroll is locked while
 * it is open (§11 accessibility contract).
 */
export default function Dialog({ open, onClose, labelledBy, describedBy, children }) {
  const panel = useRef(null)
  const restore = useRef(null)

  useEffect(() => {
    if (!open) return

    restore.current = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusables = () =>
      panel.current
        ? [...panel.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
            .filter((el) => !el.hasAttribute('disabled'))
        : []

    focusables()[0]?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
        return
      }

      if (event.key !== 'Tab') return

      const items = focusables()
      if (items.length === 0) return

      const first = items[0]
      const last = items[items.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown, true)

    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      document.body.style.overflow = previousOverflow
      if (restore.current instanceof HTMLElement) restore.current.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="dlg-back" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div
        className="dlg"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        ref={panel}
      >
        {children}
      </div>
    </div>
  )
}
