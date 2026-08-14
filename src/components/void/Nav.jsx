'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useScrolled } from '@/lib/motion'
import { Search } from '@/components/void/Icons'

/* Same shell as the marketing site — same mark, same material, same sheet.
   Only the destinations differ. Adding a top-level route means adding one
   entry here. */
const LINKS = [
  { href: '/learn', label: 'Learn' },
  { href: '/technologies', label: 'Technologies' },
  { href: '/exams', label: 'Exams' },
  { href: '/field', label: 'Field' },
  { href: '/builds', label: 'Builds' },
  { href: '/docs', label: 'Docs' },
]

export default function Nav() {
  const scrolled = useScrolled(10)
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

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

  // "/" jumps to search from anywhere that is not a text field.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return
      const el = document.activeElement
      const tag = el?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el?.isContentEditable) return
      e.preventDefault()
      router.push('/search')
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [router])

  const current = (href) => (pathname === href || pathname.startsWith(`${href}/`) ? 'page' : undefined)

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
          <Link href="/search" className="nv-search" aria-label="Search the Learn Lab">
            <Search />
            <span className="kbd" aria-hidden="true">
              /
            </span>
          </Link>

          <Link href="/dashboard" className="btn nv-cta">
            Dashboard
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

      <div className="nv-sheet" id="nv-sheet" hidden={!open}>
        <ul>
          {LINKS.map((l, i) => (
            <li key={l.href} style={{ '--i': i }}>
              <Link href={l.href} aria-current={current(l.href)}>
                {l.label}
              </Link>
            </li>
          ))}
          <li style={{ '--i': LINKS.length }}>
            <Link href="/search">Search</Link>
          </li>
        </ul>
        <Link href="/dashboard" className="btn nv-sheet-cta">
          Dashboard
        </Link>
      </div>
    </header>
  )
}
