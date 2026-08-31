'use client'

import { useId, useMemo, useState } from 'react'
import Link from 'next/link'
import { Search } from '@/components/void/Icons'

/**
 * Documentation sidebar with an in-set filter.
 *
 * The filter narrows this set only — global search is a separate destination,
 * and the empty state says so rather than leaving the reader stuck.
 */
export default function DocsNav({ set, currentSlug }) {
  const [query, setQuery] = useState('')
  // The nav renders twice — sidebar and mobile disclosure — so the field id
  // has to be unique per instance.
  const fieldId = useId()

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return set.groups

    return set.groups
      .map((group) => ({
        ...group,
        pages: group.pages.filter((page) =>
          `${page.title} ${page.summary ?? ''}`.toLowerCase().includes(q)
        ),
      }))
      .filter((group) => group.pages.length > 0)
  }, [set.groups, query])

  const matches = groups.reduce((total, group) => total + group.pages.length, 0)

  return (
    <>
      <div className="docs-proj">
        <p className="mono">Documentation</p>
        <p className="h4">
          <Link href={`/projects/${set.slug}`} className="link-quiet">
            {set.name}
          </Link>
        </p>
        <p className="mono">{set.version}</p>
      </div>

      <div className="search-field">
        <Search size={13} />
        <label className="sr-only" htmlFor={fieldId}>
          Filter {set.name} documentation
        </label>
        <input
          id={fieldId}
          type="search"
          className="f-input"
          placeholder="Filter pages"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          style={{ paddingLeft: 38, paddingBlock: 9, fontSize: '0.8125rem' }}
        />
      </div>

      {query && (
        <p className="mono" role="status">
          {matches} {matches === 1 ? 'page' : 'pages'}
        </p>
      )}

      {matches === 0 ? (
        <div>
          <p className="body">
            Nothing in {set.name} matches that.
          </p>
          <p className="body" style={{ marginTop: 10 }}>
            <Link href="/search" className="link-quiet">
              Search everything →
            </Link>
          </p>
        </div>
      ) : (
        <nav className="outline" aria-label={`${set.name} documentation`}>
          {groups.map((group) => (
            <div className="outline-g" key={group.title}>
              <p className="mono">{group.title}</p>
              <ul className="outline-flat" role="list">
                {group.pages.map((page) => (
                  <li key={page.slug}>
                    <Link
                      href={`/projects/${set.slug}/${page.slug}`}
                      aria-current={page.slug === currentSlug ? 'page' : undefined}
                    >
                      <span>{page.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      )}
    </>
  )
}
