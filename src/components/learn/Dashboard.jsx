'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Chevron from '@/components/void/Icons'
import ContinueLearning from '@/components/learn/ContinueLearning'
import Dialog from '@/components/learn/Dialog'
import { useProgress } from '@/components/learn/ProgressProvider'
import { Badge, Meter, SectionHead, StateBlock } from '@/components/learn/ui'
import { formatCount, formatDate, formatMinutes } from '@/lib/format'

/**
 * The learner dashboard.
 *
 * Everything here is derived from the local store — nothing is invented, and
 * where there is no data the panel says so instead of showing a zero that looks
 * like a measurement.
 */
export default function Dashboard({ catalogue, exams }) {
  const { ready, state, attempts, pathProgress, saved, reset, toggleSaved } = useProgress()
  const [confirmingReset, setConfirmingReset] = useState(false)

  const pathStates = useMemo(() => {
    if (!ready) return []
    return catalogue.map((path) => ({
      path,
      progress: pathProgress(path.slug, path.lessons.map((l) => l.slug)),
    }))
  }, [ready, catalogue, pathProgress])

  const stats = useMemo(() => {
    const completedLessons = Object.values(state.lessons).filter((l) => l.status === 'completed').length
    const inProgressPaths = pathStates.filter((p) => p.progress.started && !p.progress.finished).length
    const averageScore =
      attempts.length === 0
        ? null
        : Math.round(attempts.reduce((total, a) => total + a.score, 0) / attempts.length)

    const minutesCompleted = catalogue.reduce((total, path) => {
      return (
        total +
        path.lessons.reduce((sum, lesson) => {
          const entry = state.lessons[`${path.slug}/${lesson.slug}`]
          return entry?.status === 'completed' ? sum + lesson.minutes : sum
        }, 0)
      )
    }, 0)

    return { completedLessons, inProgressPaths, averageScore, minutesCompleted }
  }, [state.lessons, pathStates, attempts, catalogue])

  // The most recent attempt per exam decides what is recommended.
  const recommendations = useMemo(() => {
    const latest = new Map()
    for (const attempt of attempts) {
      if (!latest.has(attempt.examSlug)) latest.set(attempt.examSlug, attempt)
    }

    const seen = new Set()
    const out = []
    for (const attempt of latest.values()) {
      for (const rec of attempt.recommendations ?? []) {
        if (seen.has(rec.href)) continue
        seen.add(rec.href)
        out.push({ ...rec, examTitle: attempt.examTitle, examSlug: attempt.examSlug })
      }
    }
    return out.sort((a, b) => a.percent - b.percent)
  }, [attempts])

  if (!ready) {
    return (
      <div className="shell-wide" style={{ paddingBlock: 'clamp(40px, 5vw, 72px)' }} aria-hidden="true">
        <span className="skel skel-t" style={{ width: '30%' }} />
        <span className="skel skel-b" style={{ marginTop: 24 }} />
        <span className="skel skel-b" style={{ marginTop: 16 }} />
      </div>
    )
  }

  const nothingYet =
    stats.completedLessons === 0 &&
    attempts.length === 0 &&
    saved.length === 0 &&
    !pathStates.some((entry) => entry.progress.started)

  return (
    <>
      <section className="sec-sm">
        <div className="shell-wide">
          {nothingYet ? (
            <StateBlock
              align="left"
              eyebrow="Nothing tracked yet"
              title="Your dashboard fills itself in as you work."
              body="Complete a lesson or take an assessment and this page starts reporting where you are, what you have finished, and which topics need another pass. Everything is stored in this browser only."
              actions={
                <>
                  <Link href="/learn" className="btn">
                    Start a learning path <Chevron />
                  </Link>
                  <Link href="/exams" className="btn btn-ghost">
                    Take a mock exam
                  </Link>
                </>
              }
            />
          ) : (
            <ul className="stat-band" role="list">
              <li>
                <b className="tnum">{stats.completedLessons}</b>
                <span className="mono">Lessons completed</span>
              </li>
              <li>
                <b className="tnum">{stats.inProgressPaths}</b>
                <span className="mono">Paths in progress</span>
              </li>
              <li>
                <b className="tnum">{attempts.length}</b>
                <span className="mono">Exam attempts</span>
              </li>
              <li>
                <b className="tnum">{stats.averageScore == null ? '—' : `${stats.averageScore}%`}</b>
                <span className="mono">Average score</span>
              </li>
            </ul>
          )}
        </div>
      </section>

      {!nothingYet && (
        <section className="sec-sm">
          <div className="shell-wide">
            <SectionHead eyebrow="Continue" title="Pick up where you stopped." reveal={false} />
            <ContinueLearning catalogue={catalogue} variant="all" />
          </div>
        </section>
      )}

      <section className="sec-sm">
        <div className="shell-wide split">
          <div>
            <SectionHead eyebrow="Paths" title="Every path, and how far in you are." reveal={false} />

            <ul className="index" role="list">
              {pathStates.map(({ path, progress }) => (
                <li key={path.slug}>
                  <Link href={`/learn/${path.slug}`} className="index-row">
                    <span className="index-n">{progress.finished ? '✓' : `${progress.percent}%`}</span>
                    <span className="index-b">
                      <span className="h4" style={{ display: 'block' }}>
                        {path.title}
                      </span>
                      <span style={{ display: 'block', marginTop: 10, maxWidth: 420 }}>
                        <Meter value={progress.percent} quiet={!progress.started} />
                      </span>
                    </span>
                    <span className="index-m">
                      {progress.finished && <Badge>Completed</Badge>}
                      {!progress.finished && progress.started && <Badge solid>In progress</Badge>}
                      {!progress.started && <Badge quiet>Not started</Badge>}
                      <span className="mono tnum">
                        {progress.completed}/{progress.total} · {formatMinutes(path.minutes)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <section style={{ marginTop: 'clamp(48px, 5.5vw, 72px)' }} aria-labelledby="history-h">
              <SectionHead eyebrow="Assessments" title="Attempt history." reveal={false} />

              {attempts.length === 0 ? (
                <StateBlock
                  align="left"
                  eyebrow="No attempts"
                  title="You have not taken an assessment in this browser."
                  body="An assessment is the fastest way to find out which parts of a path you can skip and which you cannot."
                  actions={
                    <Link href="/exams" className="btn">
                      Browse mock exams <Chevron />
                    </Link>
                  }
                />
              ) : (
                <ul className="tl" role="list" id="history-h">
                  {attempts.map((attempt) => (
                    <li key={attempt.id}>
                      <span className="mono">{formatDate(attempt.at)}</span>
                      <span>
                        <Link href={`/exams/${attempt.examSlug}/results/${attempt.id}`} className="link-quiet">
                          {attempt.examTitle}
                        </Link>
                        {attempt.weak?.length > 0 && (
                          <span className="mono" style={{ display: 'block', marginTop: 4 }}>
                            Weak: {attempt.weak.join(', ')}
                          </span>
                        )}
                      </span>
                      <span className="mono tnum">
                        {attempt.score}% {attempt.passed ? '· pass' : '· below pass'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <aside className="rail" aria-label="Recommendations and saved items">
            <div>
              <p className="mono" style={{ marginBottom: 12 }}>
                What to study next
              </p>
              {recommendations.length === 0 ? (
                <p className="body">
                  Recommendations appear after an assessment. They come from your topic scores, not from a
                  guess about what you might like.
                </p>
              ) : (
                <ul className="related-list" role="list" style={{ marginTop: 0 }}>
                  {recommendations.slice(0, 6).map((rec) => (
                    <li key={rec.href}>
                      <Link href={rec.href}>
                        <span>
                          <span className="mono" style={{ display: 'block', marginBottom: 4 }}>
                            {rec.topic} · {rec.percent}%
                          </span>
                          <span className="h4">{rec.label}</span>
                        </span>
                        <Chevron />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <p className="mono" style={{ marginBottom: 12 }}>
                Saved
              </p>
              {saved.length === 0 ? (
                <p className="body">
                  Nothing saved. Lessons have a “Save for later” control that puts them here.
                </p>
              ) : (
                <ul className="rail-list" role="list">
                  {saved.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="k body link-quiet">
                        {item.label}
                      </Link>
                      <button
                        type="button"
                        className="v link-quiet mono"
                        onClick={() => toggleSaved(item)}
                        style={{ background: 'none' }}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <p className="mono" style={{ marginBottom: 12 }}>
                Exams available
              </p>
              <ul className="rail-list" role="list">
                {exams.map((exam) => (
                  <li key={exam.slug}>
                    <span className="k body tnum">{exam.questionCount} q</span>
                    <Link href={`/exams/${exam.slug}`} className="v link-quiet">
                      {exam.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="panel panel-sm">
              <p className="mono">Local data</p>
              <p className="body" style={{ marginTop: 10 }}>
                {formatCount(stats.completedLessons, 'completed lesson')} and{' '}
                {formatCount(attempts.length, 'attempt')} stored in this browser. Nothing is uploaded, and
                clearing site data clears it.
              </p>
              <div className="btn-row" style={{ marginTop: 16 }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirmingReset(true)}>
                  Reset all progress
                </button>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <Dialog open={confirmingReset} onClose={() => setConfirmingReset(false)} labelledBy="reset-h" describedBy="reset-d">
        <p className="mono">This cannot be undone</p>
        <h2 className="d3" id="reset-h">
          Reset all local progress?
        </h2>
        <p className="body" id="reset-d">
          This clears {formatCount(stats.completedLessons, 'completed lesson')},{' '}
          {formatCount(attempts.length, 'exam attempt')}, and {formatCount(saved.length, 'saved item')} from
          this browser. There is no server copy to restore from.
        </p>
        <div className="dlg-actions">
          <button
            type="button"
            className="btn"
            onClick={() => {
              reset()
              setConfirmingReset(false)
            }}
          >
            Reset everything
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setConfirmingReset(false)}>
            Keep my progress
          </button>
        </div>
      </Dialog>
    </>
  )
}
