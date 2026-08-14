'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Chevron, { Check } from '@/components/void/Icons'
import { useProgress } from '@/components/learn/ProgressProvider'
import { Meter } from '@/components/learn/ui'
import { padIndex } from '@/lib/format'

/** Records that the lesson was opened. Renders nothing. */
export function LessonVisit({ pathSlug, lessonSlug }) {
  const { ready, markVisited } = useProgress()

  useEffect(() => {
    if (ready) markVisited(pathSlug, lessonSlug)
  }, [ready, markVisited, pathSlug, lessonSlug])

  return null
}

/** Sidebar outline: every lesson in the path, with its state. */
export function LessonOutline({ pathSlug, pathTitle, modules, lessons, currentSlug }) {
  const { ready, pathProgress, lessonStatus } = useProgress()
  const progress = ready ? pathProgress(pathSlug, lessons.map((l) => l.slug)) : null
  const order = Object.fromEntries(lessons.map((lesson, i) => [lesson.slug, i + 1]))

  return (
    <div className="outline">
      <div className="outline-top">
        <p className="mono">Path</p>
        <p className="h4" style={{ marginTop: 6 }}>
          <Link href={`/learn/${pathSlug}`} className="link-quiet">
            {pathTitle}
          </Link>
        </p>
        {progress && (
          <div style={{ marginTop: 14 }}>
            <Meter
              value={progress.percent}
              label="Progress"
              valueLabel={`${progress.completed}/${progress.total}`}
              quiet
            />
          </div>
        )}
      </div>

      {modules.map((module) => (
        <div className="outline-g" key={module.title}>
          <p className="mono">{module.title}</p>
          <ul role="list">
            {module.lessons.map((lesson) => {
              const status = ready ? lessonStatus(pathSlug, lesson.slug) : 'not_started'
              const current = lesson.slug === currentSlug

              return (
                <li key={lesson.slug}>
                  <Link
                    href={`/learn/${pathSlug}/${lesson.slug}`}
                    aria-current={current ? 'page' : undefined}
                    data-done={status === 'completed' ? '1' : '0'}
                  >
                    <span className="n">{padIndex(order[lesson.slug])}</span>
                    <span>{lesson.title}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}

/** Completion control at the end of a lesson. */
export function LessonComplete({ pathSlug, lessonSlug, next }) {
  const { ready, isComplete, setLessonComplete, writable } = useProgress()
  const done = ready && isComplete(pathSlug, lessonSlug)

  return (
    <div className="lesson-done">
      <div>
        <p className="mono">{done ? 'Marked complete in this browser' : 'Finished this lesson?'}</p>
        {!writable && (
          <p className="body" style={{ marginTop: 8, maxWidth: '42ch' }}>
            This browser is blocking local storage, so progress cannot be saved.
          </p>
        )}
      </div>

      <div className="btn-row">
        <button
          type="button"
          className={done ? 'btn btn-ghost' : 'btn'}
          onClick={() => setLessonComplete(pathSlug, lessonSlug, !done)}
          disabled={!ready}
        >
          {done ? 'Mark as not complete' : 'Mark complete'}
          {done ? null : <Check size={13} />}
        </button>

        {next && (
          <Link href={`/learn/${pathSlug}/${next.slug}`} className={done ? 'btn' : 'btn btn-ghost'}>
            Next lesson <Chevron />
          </Link>
        )}
      </div>
    </div>
  )
}
