'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from '@/components/void/Icons'
import { StateBlock } from '@/components/learn/ui'

const TYPES = ['All', 'Learning path', 'Lesson', 'Technology', 'Mock exam', 'Field', 'Builds', 'Documentation']

/** Rank one entry against the query terms. Title matches dominate. */
function score(entry, terms) {
  const title = entry.title.toLowerCase()
  const description = (entry.description ?? '').toLowerCase()
  const keywords = (entry.keywords ?? '').toLowerCase()

  let total = 0

  for (const term of terms) {
    let hit = 0
    if (title.startsWith(term)) hit += 14
    if (title.includes(term)) hit += 10
    if (description.includes(term)) hit += 4
    if (keywords.includes(term)) hit += 2
    if (hit === 0) return 0 // every term must appear somewhere
    total += hit
  }

  return total
}

function Highlight({ text, terms }) {
  if (terms.length === 0 || !text) return text

  const pattern = new RegExp(`(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'ig')
  const parts = String(text).split(pattern)

  return parts.map((part, i) =>
    terms.includes(part.toLowerCase()) ? <mark key={i}>{part}</mark> : <span key={i}>{part}</span>
  )
}

export default function SearchPanel({ index }) {
  const router = useRouter()
  const params = useSearchParams()
  const initial = params.get('q') ?? ''

  const [query, setQuery] = useState(initial)
  const [type, setType] = useState('All')
  const input = useRef(null)

  useEffect(() => {
    input.current?.focus()
  }, [])

  // Keep the URL shareable without pushing a history entry per keystroke.
  useEffect(() => {
    const id = setTimeout(() => {
      const next = query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : '/search'
      router.replace(next, { scroll: false })
    }, 300)
    return () => clearTimeout(id)
  }, [query, router])

  const terms = useMemo(
    () =>
      query
        .toLowerCase()
        .split(/\s+/)
        .map((t) => t.trim())
        .filter(Boolean),
    [query]
  )

  const results = useMemo(() => {
    const pool = type === 'All' ? index : index.filter((entry) => entry.type === type)
    if (terms.length === 0) return []

    return pool
      .map((entry) => ({ entry, rank: score(entry, terms) }))
      .filter((row) => row.rank > 0)
      .sort((a, b) => b.rank - a.rank || a.entry.title.localeCompare(b.entry.title))
      .map((row) => row.entry)
  }, [index, terms, type])

  const counts = useMemo(() => {
    const map = { All: index.length }
    for (const entry of index) map[entry.type] = (map[entry.type] ?? 0) + 1
    return map
  }, [index])

  const browse = useMemo(() => {
    const grouped = new Map()
    for (const entry of index) {
      if (!grouped.has(entry.type)) grouped.set(entry.type, [])
      grouped.get(entry.type).push(entry)
    }
    return [...grouped.entries()]
  }, [index])

  return (
    <>
      <div className="search-box">
        <div className="search-field">
          <Search size={17} />
          <label className="sr-only" htmlFor="q">
            Search learning paths, lessons, technologies, exams, projects and documentation
          </label>
          <input
            id="q"
            ref={input}
            type="search"
            className="f-input"
            placeholder="Indexes, useEffect, delivery guarantees, isolation levels…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="off"
          />
        </div>

        <div className="filters" style={{ borderTop: 0, marginBottom: 0 }}>
          <div className="filters-g" role="group" aria-label="Filter by content type">
            {TYPES.map((item) => (
              <button
                key={item}
                type="button"
                className="chip"
                aria-pressed={type === item}
                onClick={() => setType(item)}
              >
                {item}
                {counts[item] ? <span className="tnum"> · {counts[item]}</span> : null}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="count" role="status" style={{ display: 'block', marginTop: 20 }}>
        {terms.length === 0
          ? `${index.length} entries indexed`
          : `${results.length} ${results.length === 1 ? 'result' : 'results'} for “${query.trim()}”`}
      </p>

      {terms.length === 0 ? (
        <div className="search-browse">
          {browse.map(([groupType, entries]) => (
            <section key={groupType} aria-labelledby={`browse-${groupType.replace(/\s+/g, '-')}`}>
              <p className="mono" id={`browse-${groupType.replace(/\s+/g, '-')}`}>
                {groupType}
              </p>
              <ul className="tags" role="list">
                {entries.slice(0, 8).map((entry) => (
                  <li key={entry.id}>
                    <Link href={entry.href}>{entry.title}</Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div style={{ marginTop: 28 }}>
          <StateBlock
            eyebrow="No results"
            title="Nothing matches that."
            body={`No path, lesson, technology, exam, project or documentation page matches “${query.trim()}”${
              type !== 'All' ? ` in ${type}` : ''
            }. Every word has to appear somewhere in an entry — try fewer of them.`}
            actions={
              <>
                {type !== 'All' && (
                  <button type="button" className="btn btn-ghost" onClick={() => setType('All')}>
                    Search all types
                  </button>
                )}
                <Link href="/learn" className="btn btn-ghost">
                  Browse learning paths
                </Link>
                <Link href="/technologies" className="btn btn-ghost">
                  Browse technologies
                </Link>
              </>
            }
          />
        </div>
      ) : (
        <ul className="index index-search" role="list" style={{ marginTop: 8 }}>
          {results.map((entry) => (
            <li key={entry.id}>
              <Link href={entry.href} className="index-row">
                <span className="index-n res-type">{entry.type}</span>
                <span className="index-b">
                  <span className="h4" style={{ display: 'block' }}>
                    <Highlight text={entry.title} terms={terms} />
                  </span>
                  <span className="body" style={{ display: 'block' }}>
                    <Highlight text={entry.description} terms={terms} />
                  </span>
                </span>
                <span className="index-m">
                  <span className="mono">{entry.meta}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
