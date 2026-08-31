'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search } from '@/components/void/Icons'
import { StateBlock } from '@/components/learn/ui'
import { formatCount } from '@/lib/format'

/**
 * Filterable technology list.
 *
 * Filtering is client-side over a list the server already sent — there are
 * fifteen technologies, so a round trip per keystroke would be worse in every
 * respect. The result count is announced politely for screen readers.
 */
export default function TechExplorer({ technologies, categories }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')

  const available = useMemo(
    () => ['All', ...categories.filter((c) => technologies.some((t) => t.category === c))],
    [categories, technologies]
  )

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return technologies.filter((tech) => {
      if (category !== 'All' && tech.category !== category) return false
      if (!q) return true
      return `${tech.name} ${tech.tagline} ${tech.category}`.toLowerCase().includes(q)
    })
  }, [technologies, query, category])

  return (
    <>
      <div className="filters">
        <div className="filters-g" role="group" aria-label="Filter by category">
          {available.map((item) => (
            <button
              key={item}
              type="button"
              className="chip"
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="filters-r">
          <div className="search-field" style={{ flex: 1, minWidth: 200 }}>
            <Search />
            <label className="sr-only" htmlFor="tech-filter">
              Filter technologies by name
            </label>
            <input
              id="tech-filter"
              type="search"
              className="f-input"
              placeholder="React, Postgres, retrieval…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>
      </div>

      <p className="count" role="status">
        {formatCount(results.length, 'technology', 'technologies')}
        {category !== 'All' ? ` in ${category}` : ''}
      </p>

      {results.length === 0 ? (
        <div style={{ marginTop: 24 }}>
          <StateBlock
            eyebrow="No matches"
            title="Nothing matches that filter."
            body={`No technology matches “${query.trim()}”${
              category !== 'All' ? ` in ${category}` : ''
            }. Try a broader category, or search everything instead.`}
            actions={
              <>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setQuery('')
                    setCategory('All')
                  }}
                >
                  Clear filters
                </button>
                <Link href="/search" className="btn btn-ghost">
                  Search everything
                </Link>
              </>
            }
          />
        </div>
      ) : (
        <ul className="grid-h grid-h-3 grid-h-sm" role="list" style={{ marginTop: 24 }}>
          {results.map((tech) => (
            <li key={tech.slug} className="lift stretch">
              <div className="card-top">
                <p className="mono">{tech.category}</p>
                <span className="mono">{tech.level}</span>
              </div>

              <h2 className="h4">
                <Link href={`/technologies/${tech.slug}`} className="stretch-l">
                  {tech.name}
                </Link>
              </h2>

              <p className="body">{tech.tagline}</p>

              <p className="mono tnum" style={{ marginTop: 4 }}>
                {tech.pathCount > 0 ? `${formatCount(tech.pathCount, 'path')}` : 'Overview only'}
                {tech.examCount > 0 ? ` · ${formatCount(tech.examCount, 'exam')}` : ''}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
