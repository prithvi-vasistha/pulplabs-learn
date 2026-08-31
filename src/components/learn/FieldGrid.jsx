'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Cover from '@/components/void/Cover'
import Logo from '@/components/void/Logo'
import Chevron from '@/components/void/Icons'
import { Badge, StateBlock } from '@/components/learn/ui'
import { formatDate, formatMinutes, padIndex } from '@/lib/format'

/**
 * The field index. Filtering is client-side over a list the server already
 * sent — there are a handful of entries, so a round trip per chip would be
 * worse in every respect.
 */
export default function FieldGrid({ entries, kinds }) {
  const [kind, setKind] = useState('All')

  const available = useMemo(
    () => ['All', ...kinds.filter((k) => entries.some((e) => e.kind === k))],
    [kinds, entries]
  )

  const results = useMemo(
    () => (kind === 'All' ? entries : entries.filter((e) => e.kind === kind)),
    [entries, kind]
  )

  return (
    <>
      <div className="filters">
        <div className="filters-g" role="group" aria-label="Filter by kind">
          {available.map((item) => (
            <button
              key={item}
              type="button"
              className="chip"
              aria-pressed={kind === item}
              onClick={() => setKind(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="filters-r">
          <span className="count" role="status">
            {results.length} {results.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>
      </div>

      {results.length === 0 ? (
        <StateBlock
          eyebrow="Nothing here yet"
          title={`No ${kind.toLowerCase()} published.`}
          body="Entries appear here as work is published. Try another kind, or read the engagement write-ups."
          actions={
            <button type="button" className="btn btn-ghost" onClick={() => setKind('All')}>
              Show everything
            </button>
          }
        />
      ) : (
        <ul className="tiles" role="list">
          {results.map((entry, i) => (
            <li key={entry.slug}>
              <article className="tile" data-r style={{ '--rd': `${Math.min(i, 5) * 65}ms` }}>
                <div className="tile-media">
                  <Cover seed={entry.slug} ratio="16 / 9" />
                  {entry.client && (
                    <span className={`tile-logo${entry.logo ? ' tile-logo-real' : ''}`}>
                      {/* The client's name is printed again below the cover, so
                          the mark here is decorative and carries no alt text. */}
                      <Logo
                        name={entry.client}
                        src={entry.logo}
                        ground={entry.logoGround}
                        shape={entry.logoShape}
                        size="sm"
                        decorative
                      />
                    </span>
                  )}
                  <span className="tile-n">{padIndex(i + 1)}</span>
                  <span className="tile-badge">
                    <Badge quiet={entry.kind !== 'Interview'} pip={entry.kind === 'Interview'}>
                      {entry.kind}
                    </Badge>
                  </span>
                </div>

                <div className="tile-in">
                  <p className="mono">{entry.client ?? entry.sector}</p>

                  <h2 className="h4">
                    <Link href={`/field/${entry.slug}`} className="stretch-l">
                      {entry.title}
                    </Link>
                  </h2>

                  <p className="body trunc-3">{entry.summary}</p>

                  <div className="tile-foot">
                    <span className="mono tnum">
                      {entry.published ? formatDate(entry.published) : 'Unpublished'} ·{' '}
                      {formatMinutes(entry.minutes)}
                    </span>
                    <span className="link">
                      Read <Chevron />
                    </span>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
