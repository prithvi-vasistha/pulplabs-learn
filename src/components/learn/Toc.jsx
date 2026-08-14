'use client'

import { useEffect, useState } from 'react'

/**
 * Table of contents with a scroll spy.
 *
 * The observer tracks headings rather than scroll position, so the active item
 * is correct regardless of section length. Clicking is ordinary anchor
 * navigation — the browser handles it, including reduced-motion preferences.
 */
export default function Toc({ headings, label = 'On this page' }) {
  const [active, setActive] = useState(headings[0]?.id ?? null)

  useEffect(() => {
    if (headings.length === 0) return

    const elements = headings.map((h) => document.getElementById(h.id)).filter(Boolean)
    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-88px 0px -68% 0px', threshold: 0 }
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [headings])

  if (headings.length < 2) return null

  return (
    <nav className="toc" aria-label={label}>
      <p className="mono">{label}</p>
      <ul role="list">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              data-sub={heading.level === 3 ? '1' : '0'}
              aria-current={active === heading.id ? 'true' : undefined}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
