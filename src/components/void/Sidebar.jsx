'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import CommandPalette from '@/components/learn/CommandPalette'
import ThemeToggle from '@/components/void/ThemeToggle'
import { Book, Check, Clock, Flag, Search, Terminal } from '@/components/void/Icons'

/**
 * Primary navigation: a top bar that is always there, and a sidebar docked
 * under it.
 *
 * Plain words, in the order somebody would look for them. An earlier pass
 * grouped these under "Material" and "What we build", which described how we
 * think about the content rather than what a reader is looking for.
 */
const GROUPS = [
  {
    items: [
      { href: '/', label: 'Home', icon: HomeIcon, exact: true, match: ['/field'] },
      { href: '/articles', label: 'Articles', icon: Pencil },
    ],
  },
  {
    title: 'Learn',
    items: [
      { href: '/learn', label: 'Courses', icon: Book },
      { href: '/practice', label: 'Exams', icon: Check, match: ['/exams'] },
      { href: '/technologies', label: 'Topics', icon: Terminal },
    ],
  },
  {
    title: 'More',
    items: [
      { href: '/projects', label: 'Our software', icon: Terminal },
      { href: '/dashboard', label: 'My progress', icon: Clock },
    ],
  },
]

function HomeIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="M2 6.6 8 2l6 4.6V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6.6Z" strokeLinejoin="round" />
    </svg>
  )
}

function Pencil({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="M11.2 2.4a1.4 1.4 0 0 1 2 2L6 11.6l-2.7.7.7-2.7 7.2-7.2Z" strokeLinejoin="round" />
      <path d="M9.8 3.8 12.2 6.2" />
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
    if (item.exact && pathname === item.href) return true
    if (!item.exact && (pathname === item.href || pathname.startsWith(`${item.href}/`))) return true
    return (item.match ?? []).some((m) => pathname === m || pathname.startsWith(`${m}/`))
  }

  return (
    <>
      {/* One bar at every width. Search and the theme switch live at its right
          end, which is where people reach for them and — unlike the previous
          arrangement — is visible on a desktop. */}
      <header className="topbar">
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

        <Link href="/" className="topbar-mark" aria-label="PulpLabs Learn home">
          <Mark />
          <span>PulpLabs Learn</span>
        </Link>

        <div className="topbar-end">
          <CommandPalette />
          <ThemeToggle />
        </div>
      </header>

      {open && <button type="button" className="app-scrim" aria-label="Close navigation" onClick={() => setOpen(false)} />}

      <nav id="sidebar" className="side" aria-label="Primary" data-open={open || undefined}>
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

          <div className="side-group">
            <ul role="list">
              <li>
                <Link href="/search" data-current={pathname === '/search' || undefined} aria-current={pathname === '/search' ? 'page' : undefined}>
                  <Search size={15} />
                  Search
                </Link>
              </li>
            </ul>
          </div>
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
