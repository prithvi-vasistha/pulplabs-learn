'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useScrolled } from '@/lib/motion'
import CommandPalette from '@/components/learn/CommandPalette'
import ThemeToggle from '@/components/void/ThemeToggle'

/* Same shell as the marketing site — same mark, same material, same sheet.
   Only the destinations differ.

   Four, not six. Technologies is a way of browsing what is in Learn rather
   than a sibling of it, and Builds/Docs were two names for the same four
   objects. A stranger reading this row should be able to tell which one owns
   the thing they came for without opening any of them. */
const LINKS = [
  { href: '/learn', label: 'Courses', hint: 'Sequences, lessons and subjects' },
  { href: '/practice', label: 'Practice', hint: 'A question a day, and full papers' },
  { href: '/projects', label: 'Projects', hint: 'Source and documentation' },
  { href: '/field', label: 'Field', hint: 'Case studies and interviews' },
]

export default function Nav() {
  const scrolled = useScrolled(10)
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  // /technologies is part of Learn now, so it should light Learn up.
  const current = (href) => {
    if (pathname === href || pathname.startsWith(`${href}/`)) return 'page'
    if (href === '/learn' && pathname.startsWith('/technologies')) return 'page'
    if (href === '/practice' && pathname.startsWith('/exams')) return 'page'
    return undefined
  }

  return (
    <header className="nv" data-scrolled={scrolled || undefined} data-open={open || undefined}>
      <nav className="nv-in" aria-label="Primary">
        <Link href="/" className="nv-brand" aria-label="PulpLabs Learn Lab home">
          {/* The mark is a stroke, not a picture. On black, geometry reads as
              engineered where an illustration reads as decoration. */}
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M2 14 L10 3 L18 14" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinejoin="round" />
            <path d="M6 17 L14 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <span>PulpLabs Learn</span>
        </Link>

        <ul className="nv-links">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} aria-current={current(l.href)}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="nv-end">
          <CommandPalette />
          <ThemeToggle />

          <Link href="/profile" className="btn nv-cta">
            Profile
          </Link>

          <button
            type="button"
            className="nv-toggle"
            aria-expanded={open}
            aria-controls="nv-sheet"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
      </nav>

      {/* The sheet has room the bar does not, so it says what each section is
          for. On a phone that hint is the difference between four guesses and
          one choice. */}
      <div className="nv-sheet" id="nv-sheet" hidden={!open}>
        <ul>
          {LINKS.map((l, i) => (
            <li key={l.href} style={{ '--i': i }}>
              <Link href={l.href} aria-current={current(l.href)}>
                {l.label}
                <span className="nv-hint mono">{l.hint}</span>
              </Link>
            </li>
          ))}
          <li style={{ '--i': LINKS.length }}>
            <Link href="/search">
              Search
              <span className="nv-hint mono">Everything, in one index</span>
            </Link>
          </li>
        </ul>
        <Link href="/profile" className="btn nv-sheet-cta">
          Profile
        </Link>
      </div>
    </header>
  )
}
