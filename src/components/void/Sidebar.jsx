'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import CommandPalette from '@/components/learn/CommandPalette'
import ThemeToggle from '@/components/void/ThemeToggle'
import { Book, Check, Lock, Person, Play, Terminal } from '@/components/void/Icons'

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
      // The only section that needs an account, and it says so rather than
      // letting somebody find out by clicking.
      { href: '/playground', label: 'Playground', icon: Play, account: true },
    ],
  },
  {
    title: 'More',
    items: [
      { href: '/projects', label: 'Our software', icon: Terminal },
      { href: '/profile', label: 'Profile', icon: Person, match: ['/dashboard'] },
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

/** Initials, for an account with no Google picture. */
function initials(user) {
  const source = user?.name || user?.email || '?'
  const parts = source.replace(/@.*/, '').split(/[\s._-]+/).filter(Boolean)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || source[0].toUpperCase()
}

export default function Sidebar({ user = null }) {
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
          {user ? (
            <Link href="/profile" className="topbar-me" title={user.email ?? 'Your profile'}>
              {user.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar} alt="" width={26} height={26} referrerPolicy="no-referrer" />
              ) : (
                <span aria-hidden="true">{initials(user)}</span>
              )}
              <span className="sr-only">Your profile</span>
            </Link>
          ) : (
            <Link href="/login" className="topbar-in">
              Sign in
            </Link>
          )}
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
                  const locked = item.account && !user
                  return (
                    <li key={item.href}>
                      <Link href={item.href} aria-current={current ? 'page' : undefined} data-current={current || undefined}>
                        <Icon size={15} />
                        {item.label}
                        {locked && (
                          <span className="side-lock" title="Needs an account">
                            <Lock size={11} />
                            <span className="sr-only"> (requires an account)</span>
                          </span>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* A suggestion, not a wall. Everything above this except the
            playground works perfectly well signed out. */}
        {!user && (
          <div className="side-cta">
            <p className="mono">Not signed in</p>
            <p>Sign in to run the playground demos and keep your progress on more than one machine.</p>
            <Link href={`/login?next=${encodeURIComponent(pathname || '/')}`} className="btn btn-sm">
              Sign in
            </Link>
          </div>
        )}
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
