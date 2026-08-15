'use client'

import Link from 'next/link'
import Chevron from '@/components/void/Icons'
import { useProgress } from '@/components/learn/ProgressProvider'
import { Meter } from '@/components/learn/ui'
import { formatMinutes } from '@/lib/format'

/**
 * Resume state on the home page and the dashboard.
 *
 * Until the local store has been read, `ready` is false and a skeleton renders
 * — showing "0% complete" and then correcting it would be worse than a beat of
 * loading. With no progress at all, this becomes a discovery prompt rather than
 * an empty box.
 */
export default function ContinueLearning({ catalogue, variant = 'home' }) {
  const { ready, pathProgress } = useProgress()

  if (!ready) {
    return (
      <div className="panel" aria-hidden="true">
        <span className="skel" style={{ width: '32%' }} />
        <span className="skel skel-t" style={{ width: '58%', marginTop: 18 }} />
        <span className="skel" style={{ width: '100%', marginTop: 20, height: 2 }} />
      </div>
    )
  }

  const active = catalogue
    .map((path) => ({ path, progress: pathProgress(path.slug, path.lessons.map((l) => l.slug)) }))
    .filter((entry) => entry.progress.started && !entry.progress.finished)
    .sort((a, b) => String(b.progress.lastTouchedAt ?? '').localeCompare(String(a.progress.lastTouchedAt ?? '')))

  if (active.length === 0) {
    const suggestion = catalogue[0]
    return (
      <div className="panel">
        <p className="mono">Start here</p>
        <h2 className="d3" style={{ marginTop: 12 }}>
          Nothing in progress yet.
        </h2>
        <p className="body" style={{ marginTop: 12, maxWidth: '52ch' }}>
          Pick a path and the reader will keep your place. Progress is stored in this browser — there is no
          account, and nothing is sent anywhere.
        </p>
        <div className="btn-row" style={{ marginTop: 22 }}>
          <Link href={`/learn/${suggestion.slug}`} className="btn">
            Start {suggestion.title} <Chevron />
          </Link>
          <Link href="/learn" className="btn btn-ghost">
            Browse all paths
          </Link>
        </div>
      </div>
    )
  }

  const shown = variant === 'home' ? active.slice(0, 1) : active

  return (
    <div className="stack-list">
      {shown.map(({ path, progress }) => {
        const next = path.lessons.find((l) => l.slug === progress.nextSlug) ?? path.lessons[0]
        const position = path.lessons.findIndex((l) => l.slug === next.slug) + 1

        return (
          <div className="panel" key={path.slug}>
            <div className="card-top">
              <p className="mono">Continue · {path.eyebrow}</p>
              <span className="mono tnum">
                {progress.completed} / {progress.total} lessons
              </span>
            </div>

            <h2 className="d3" style={{ marginTop: 14 }}>
              <Link href={`/learn/${path.slug}`}>{path.title}</Link>
            </h2>

            <div style={{ marginTop: 20 }}>
              <Meter value={progress.percent} large />
            </div>

            <div className="card-foot" style={{ marginTop: 22, alignItems: 'flex-end' }}>
              <div>
                <p className="mono">
                  Next · lesson {position} of {progress.total}
                </p>
                <p className="h4" style={{ marginTop: 6 }}>
                  {next.title}
                </p>
                <p className="mono" style={{ marginTop: 6 }}>
                  {formatMinutes(next.minutes)}
                </p>
              </div>
              <Link href={`/learn/${path.slug}/${next.slug}`} className="btn">
                Continue <Chevron />
              </Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}
