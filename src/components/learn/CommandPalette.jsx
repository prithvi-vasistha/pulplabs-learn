'use client'

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from '@/components/void/Icons'
import { groupByType, rank, toTerms } from '@/lib/search'

/**
 * Search as navigation.
 *
 * The old surface was a "/" shortcut and a dedicated page, which meant a reader
 * had to already know the site's conventions to use the fastest route through
 * it. This is always visible in the nav, and it answers the question a stranger
 * actually has — "where is the thing about X" — without them first working out
 * which of the four sections owns it.
 *
 * The index is fetched once, on first open, and kept in module scope so a
 * second open is instant. Nothing is loaded for visitors who never search.
 */

let cachedIndex = null
let inFlight = null

function loadIndex() {
  if (cachedIndex) return Promise.resolve(cachedIndex)
  if (!inFlight) {
    inFlight = fetch('/api/search-index')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        cachedIndex = data
        inFlight = null
        return data
      })
      .catch(() => {
        inFlight = null
        return []
      })
  }
  return inFlight
}

/** Shown before a reader has typed: the four places they can go, with counts. */
const STARTERS = [
  { type: 'Article', label: 'Articles', href: '/articles', hint: 'Notes on the stack' },
  { type: 'Learning path', label: 'Courses', href: '/learn', hint: 'Sequenced, start to finish' },
  { type: 'Mock exam', label: 'Exams', href: '/practice', hint: 'Scored by topic' },
  { type: 'Project', label: 'Our software', href: '/projects', hint: 'Source and documentation' },
]

export default function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState([])
  const [active, setActive] = useState(0)

  const input = useRef(null)
  const panel = useRef(null)
  const listRef = useRef(null)
  const restore = useRef(null)
  const listId = useId()

  const close = useCallback(() => setOpen(false), [])

  /* --- opening: "/" and ⌘K from anywhere that is not a text field --------- */
  useEffect(() => {
    const onKey = (event) => {
      const el = document.activeElement
      const tag = el?.tagName
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el?.isContentEditable

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen((v) => !v)
        return
      }

      if (event.key === '/' && !typing && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault()
        setOpen(true)
      }
    }

    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  /* --- open/close side effects ------------------------------------------- */
  useEffect(() => {
    if (!open) return

    restore.current = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    loadIndex().then(setIndex)
    const focusTimer = setTimeout(() => input.current?.focus(), 0)

    /* Escape and Tab are handled at the document, not on the input. Between
       opening and the focus landing there is a frame where a key press would
       otherwise reach the page behind — and a modal that sometimes ignores
       Escape is worse than one that never had it. */
    const onDocKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        setOpen(false)
        return
      }
      if (event.key !== 'Tab') return
      // Nothing behind the dialog should be reachable while it is open.
      const focusables = panel.current?.querySelectorAll('input, button')
      if (!focusables?.length) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onDocKey, true)

    return () => {
      clearTimeout(focusTimer)
      document.removeEventListener('keydown', onDocKey, true)
      document.body.style.overflow = previousOverflow
      if (restore.current instanceof HTMLElement) restore.current.focus()
    }
  }, [open])

  useEffect(() => setActive(0), [query])

  const terms = useMemo(() => toTerms(query), [query])
  const results = useMemo(() => rank(index, terms, 24), [index, terms])
  const grouped = useMemo(() => groupByType(results), [results])

  // One flat list drives keyboard navigation, so arrow keys cross group
  // boundaries the way a reader expects rather than stopping at them.
  const flat = terms.length === 0 ? STARTERS : results

  const go = useCallback(
    (item) => {
      if (!item) return
      setOpen(false)
      setQuery('')
      router.push(item.href)
    },
    [router]
  )

  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      close()
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((i) => (flat.length === 0 ? 0 : (i + 1) % flat.length))
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((i) => (flat.length === 0 ? 0 : (i - 1 + flat.length) % flat.length))
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      go(flat[active])
    }
  }

  // Keep the highlighted row in view when arrowing past the fold.
  useEffect(() => {
    if (!open) return
    const el = listRef.current?.querySelector('[data-active="true"]')
    el?.scrollIntoView({ block: 'nearest' })
  }, [active, open])

  const optionId = (i) => `${listId}-opt-${i}`

  return (
    <>
      <button type="button" className="nv-find" onClick={() => setOpen(true)}>
        <Search size={15} />
        <span className="nv-find-t">Search</span>
        <span className="kbd" aria-hidden="true">
          /
        </span>
      </button>

      {open && (
        <div
          className="cmd-back"
          onMouseDown={(event) => event.target === event.currentTarget && close()}
        >
          <div
            className="cmd"
            role="dialog"
            aria-modal="true"
            aria-label="Search the Learn Lab"
            ref={panel}
          >
            <div className="cmd-field">
              <Search size={17} />
              <input
                ref={input}
                type="text"
                role="combobox"
                aria-expanded="true"
                aria-controls={listId}
                aria-autocomplete="list"
                aria-activedescendant={flat.length > 0 ? optionId(active) : undefined}
                aria-label="Search tracks, lessons, technologies, exams, projects, documentation and field entries"
                placeholder="Search everything — tool use, retrieval, evaluation…"
                className="cmd-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                autoComplete="off"
                spellCheck="false"
              />
              <button type="button" className="cmd-esc mono" onClick={close}>
                Esc
              </button>
            </div>

            <div className="cmd-body" ref={listRef}>
              {terms.length === 0 ? (
                <div className="cmd-group">
                  <p className="mono cmd-gh">Go to</p>
                  <ul role="listbox" id={listId} aria-label="Sections">
                    {STARTERS.map((item, i) => (
                      <li
                        key={item.href}
                        id={optionId(i)}
                        role="option"
                        aria-selected={active === i}
                        data-active={active === i}
                        className="cmd-row"
                        onMouseEnter={() => setActive(i)}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          go(item)
                        }}
                      >
                        <span className="res-type">{item.type}</span>
                        <span className="cmd-t">{item.label}</span>
                        <span className="cmd-m mono">{item.hint}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : results.length === 0 ? (
                <div className="cmd-empty">
                  <p className="h4">Nothing matches “{query.trim()}”.</p>
                  <p className="body">
                    Every word has to appear somewhere in an entry — try fewer of them.
                  </p>
                </div>
              ) : (
                <ul role="listbox" id={listId} aria-label="Search results">
                  {grouped.map(([type, entries]) => (
                    <li key={type} role="presentation" className="cmd-group">
                      <p className="mono cmd-gh" role="presentation">
                        {type}
                      </p>
                      <ul role="group" aria-label={type}>
                        {entries.map((entry) => {
                          const i = results.indexOf(entry)
                          return (
                            <li
                              key={entry.id}
                              id={optionId(i)}
                              role="option"
                              aria-selected={active === i}
                              data-active={active === i}
                              className="cmd-row"
                              onMouseEnter={() => setActive(i)}
                              onMouseDown={(e) => {
                                e.preventDefault()
                                go(entry)
                              }}
                            >
                              <span className="cmd-t">{entry.title}</span>
                              <span className="cmd-m mono">{entry.meta}</span>
                            </li>
                          )
                        })}
                      </ul>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="cmd-foot mono">
              <span>
                <kbd>↑</kbd>
                <kbd>↓</kbd> move
              </span>
              <span>
                <kbd>↵</kbd> open
              </span>
              <span>
                <kbd>esc</kbd> close
              </span>
              {terms.length > 0 && (
                <span className="cmd-foot-c tnum">
                  {results.length} {results.length === 1 ? 'result' : 'results'}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
