'use client'

import Link from 'next/link'
import Chevron from '@/components/void/Icons'
import { useProgress } from '@/components/learn/ProgressProvider'
import { Difficulty, Meter } from '@/components/learn/ui'
import { formatCount, formatMinutes } from '@/lib/format'

/**
 * The paths index. Client-side because each card reports the reader's own
 * progress; the content itself arrives from the server as props.
 */
export default function PathGrid({ paths, catalogue }) {
  const { ready, pathProgress } = useProgress()
  const lessonsBySlug = Object.fromEntries(catalogue.map((c) => [c.slug, c.lessons]))

  return (
    <ul className="grid-h grid-h-2" role="list">
      {paths.map((path, i) => {
        const lessons = lessonsBySlug[path.slug] ?? []
        const progress = ready ? pathProgress(path.slug, lessons.map((l) => l.slug)) : null
        const resume = progress?.started && !progress.finished ? progress.nextSlug : null

        return (
          <li key={path.slug} className="lift stretch" data-r style={{ '--rd': `${i * 65}ms` }}>
            <div className="card-top">
              <p className="mono">{path.eyebrow}</p>
              <Difficulty level={path.level} />
            </div>

            <h2 className="d3">
              <Link href={`/learn/${path.slug}`} className="stretch-l">
                {path.title}
              </Link>
            </h2>

            <p className="body">{path.summary}</p>

            <ul className="tags" role="list">
              {path.skills.slice(0, 5).map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>

            {progress?.started && (
              <div style={{ marginTop: 4 }}>
                <Meter
                  value={progress.percent}
                  label={progress.finished ? 'Completed' : 'Your progress'}
                  valueLabel={`${progress.completed}/${progress.total}`}
                />
              </div>
            )}

            <div className="card-foot">
              <span className="mono tnum">
                {formatCount(path.lessonCount, 'lesson')} · {formatMinutes(path.minutes)}
              </span>
              <span className="link">
                {resume ? 'Resume' : progress?.finished ? 'Review' : 'Open path'} <Chevron />
              </span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
