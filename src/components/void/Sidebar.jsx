'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import CommandPalette from '@/components/learn/CommandPalette'
import ThemeToggle from '@/components/void/ThemeToggle'
import { Book, Check, Clock, External, Flag, Search, Terminal } from '@/components/void/Icons'

/**
 * The portal's primary navigation.
 *
 * A sidebar rather than a top bar, because this is a place people work in
 * rather than a site they pass through. Every destination is visible at once,
 * the current one is obvious, and the grouping says what kind of thing each
 * destination is — which a row of five words across the top cannot do.
 *
 * The groups also carry the positioning. "Material" and "What we build" are
 * not a product menu; they are the two halves of what a consultancy has to
 * show a team it is bringing up to speed.
 */

const GROUPS = [
  {
    items: [{ href: '/', label: 'Home', icon: Home, exact: true }],
  },
  {
    title: 'Material',
    items: [
      { href: '/learn', label: 'Courses', icon: Book },
      { href: '/technologies', label: 'Subjects', icon: Terminal },
      { href: '/practice', label: 'Practice', icon: Check, match: ['/exams'] },
    ],
  },
  {
    title: 'What we build',
    items: [
      { href: '/projects', label: 'Open source', icon: Terminal },
      { href: '/field', label: 'Field notes', icon: Flag },
    ],
  },
  {
    title: 'You',
    items: [
      { href: '/dashboard', label: 'Your progress', icon: Clock },
      { href: '/search', label: 'Search', icon: Search },
    ],
  },
]

function Home({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="M2 6.6 8 2l6 4.6V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6.6Z" strokeLinejoin="round" />
    </svg>
  )
}

export default function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const isCurrent = (item) => {
    if (item.exact) return pathname === item.href
    if (pathname === item.href || pathname.startsWith(`${item.href}/`)) return true
    return (item.match ?? []).some((m) => pathname === m || pathname.startsWith(`${m}/`))
  }

  return (
    <>
      {/* The bar only exists below the breakpoint where the sidebar is docked. */}
      <div className="app-bar">
        <button
          type="button"
          className="app-burger"
          aria-expanded={open}
          aria-controls="sidebar"
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
        </button>

        <Link href="/" className="app-mark" aria-label="PulpLabs Learn home">
          <Mark />
          <span>PulpLabs Learn</span>
        </Link>

        <div className="app-bar-end">
          <CommandPalette />
          <ThemeToggle />
        </div>
      </div>

      {open && <button type="button" className="app-scrim" aria-label="Close navigation" onClick={() => setOpen(false)} />}

      <nav id="sidebar" className="side" aria-label="Primary" data-open={open || undefined}>
        <Link href="/" className="side-mark" aria-label="PulpLabs Learn home">
          <Mark />
          <span>PulpLabs Learn</span>
        </Link>

        <div className="side-scroll">
          {GROUPS.map((group, i) => (
            <div className="side-group" key={group.title ?? i}>
              {group.title && <p className="side-h mono">{group.title}</p>}
              <ul role="list">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const current = isCurrent(item)
                  return (
                    <li key={item.href}>
                      <Link href={item.href} aria-current={current ? 'page' : undefined} data-current={current || undefined}>
                        <Icon size={15} />
                        {item.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Who runs this, and where the actual business is. The portal is a
            thing PulpLabs does, not the thing PulpLabs is. */}
        <div className="side-foot">
          <a href="https://pulplabs.ai" target="_blank" rel="noreferrer" className="side-org">
            <span className="mono">An enablement portal by</span>
            <span className="side-org-n">
              PulpLabs <External size={11} />
            </span>
          </a>
        </div>
      </nav>
    </>
  )
}

function Mark() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M2 14 L10 3 L18 14" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinejoin="round" />
      <path d="M6 17 L14 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
