'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Chevron, { Search } from '@/components/void/Icons'
import { useProgress } from '@/components/learn/ProgressProvider'
import { Badge, Difficulty, Meter, StateBlock } from '@/components/learn/ui'
import { formatCount, formatMinutes, padIndex } from '@/lib/format'

const LEVELS = ['All levels', 'Beginner', 'Intermediate', 'Advanced']

/**
 * The course catalogue.
 *
 * One search box filters both tracks and individual lessons, because those are
 * the two things people arrive looking for — a course to work through, or the
 * one page that answers today's question. Progress comes from the local store,
 * so a track the reader has started reads differently from one they have not.
 */
export default function CourseCatalogue({ paths, catalogue }) {
  const [query, setQuery] = useState('')
  const [level, setLevel] = useState('All levels')

  const { ready, pathProgress } = useProgress()
  const lessonsBySlug = Object.fromEntries(catalogue.map((c) => [c.slug, c.lessons]))

  const terms = query.trim().toLowerCase()

  const tracks = useMemo(() => {
    return paths.filter((path) => {
      if (level !== 'All levels' && path.level !== level) return false
      if (!terms) return true
      return `${path.title} ${path.summary} ${path.eyebrow} ${path.skills.join(' ')}`
        .toLowerCase()
        .includes(terms)
    })
  }, [paths, level, terms])

  // Every lesson in the Lab, flattened, so a specific question finds its page.
  const lessons = useMemo(() => {
    const flat = catalogue.flatMap((path) =>
      path.lessons.map((lesson) => ({ ...lesson, pathSlug: path.slug, pathTitle: path.title, level: path.level }))
    )
    if (!terms) return flat
    return flat.filter((lesson) =>
      `${lesson.title} ${lesson.module ?? ''} ${lesson.pathTitle}`.toLowerCase().includes(terms)
    )
  }, [catalogue, terms])

  const nothing = tracks.length === 0 && lessons.length === 0

  return (
    <>
      <div className="filters">
        <div className="filters-g" role="group" aria-label="Filter by level">
          {LEVELS.map((item) => (
            <button
              key={item}
              type="button"
              className="chip"
              aria-pressed={level === item}
              onClick={() => setLevel(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="filters-r">
          <div className="search-field" style={{ flex: 1, minWidth: 220 }}>
            <Search />
            <label className="sr-only" htmlFor="catalogue-search">
              Search tracks and lessons
            </label>
            <input
              id="catalogue-search"
              type="search"
              className="f-input"
              placeholder="Tool use, chunking, evaluation…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>
      </div>

      {nothing ? (
        <StateBlock
          eyebrow="No matches"
          title="Nothing matches that."
          body={`No track or lesson matches “${query.trim()}”${
            level !== 'All levels' ? ` at ${level.toLowerCase()} level` : ''
          }. Try a broader term, or search the whole Learn Lab.`}
          actions={
            <>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setQuery('')
                  setLevel('All levels')
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
      ) : (
        <>
          {tracks.length > 0 && (
            <>
              <p className="count" role="status" style={{ display: 'block', marginBottom: 20 }}>
                {formatCount(tracks.length, 'track')}
              </p>

              <ul className="tiles tiles-2" role="list">
                {tracks.map((path, i) => {
                  const lessonList = lessonsBySlug[path.slug] ?? []
                  const progress = ready ? pathProgress(path.slug, lessonList.map((l) => l.slug)) : null
                  const started = progress?.started
                  const finished = progress?.finished

                  return (
                    <li key={path.slug}>
                      <article className="tile" data-r style={{ '--rd': `${i * 65}ms` }}>
                        <div className="tile-media">
                          <img src={`/void/${path.plate}.webp`} alt="" loading="lazy" decoding="async" />
                          <span className="tile-n">{padIndex(i + 1)}</span>
                          {started && (
                            <span className="tile-badge">
                              <Badge solid={!finished}>{finished ? 'Completed' : 'In progress'}</Badge>
                            </span>
                          )}
                        </div>

                        <div className="tile-in">
                          <div className="card-top">
                            <p className="mono">{path.eyebrow}</p>
                            <Difficulty level={path.level} />
                          </div>

                          <h2 className="d3">
                            <Link href={`/learn/${path.slug}`} className="stretch-l">
                              {path.title}
                            </Link>
                          </h2>

                          <p className="body trunc-3">{path.summary}</p>

                          <ul className="tags" role="list">
                            {path.skills.slice(0, 4).map((skill) => (
                              <li key={skill}>{skill}</li>
                            ))}
                          </ul>

                          {started && (
                            <Meter
                              value={progress.percent}
                              label={finished ? 'Completed' : 'Your progress'}
                              valueLabel={`${progress.completed}/${progress.total}`}
                            />
                          )}

                          <div className="tile-foot">
                            <span className="mono tnum">
                              {formatCount(path.lessonCount, 'lesson')} · {formatMinutes(path.minutes)}
                            </span>
                            <span className="link">
                              {started && !finished ? 'Resume' : finished ? 'Review' : 'Start'} <Chevron />
                            </span>
                          </div>
                        </div>
                      </article>
                    </li>
                  )
                })}
              </ul>
            </>
          )}

          {terms && lessons.length > 0 && (
            <section style={{ marginTop: 'clamp(44px, 5vw, 64px)' }} aria-labelledby="lesson-matches">
              <p className="mono" id="lesson-matches" style={{ marginBottom: 16 }}>
                {formatCount(lessons.length, 'lesson')} matching “{query.trim()}”
              </p>

              <ul className="index" role="list">
                {lessons.slice(0, 12).map((lesson) => (
                  <li key={`${lesson.pathSlug}/${lesson.slug}`}>
                    <Link href={`/learn/${lesson.pathSlug}/${lesson.slug}`} className="index-row">
                      <span className="index-n">→</span>
                      <span className="index-b">
                        <span className="h4" style={{ display: 'block' }}>
                          {lesson.title}
                        </span>
                        <span className="mono" style={{ display: 'block' }}>
                          {lesson.pathTitle} · {lesson.module}
                        </span>
                      </span>
                      <span className="index-m">
                        <span className="mono tnum">{formatMinutes(lesson.minutes)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </>
  )
}
