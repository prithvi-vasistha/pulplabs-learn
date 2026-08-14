'use client'

import Link from 'next/link'
import Chevron from '@/components/void/Icons'
import { useProgress } from '@/components/learn/ProgressProvider'
import { Badge, Meter } from '@/components/learn/ui'
import { formatMinutes, padIndex } from '@/lib/format'

function useLessonProgress(pathSlug, lessons) {
  const { ready, pathProgress, lessonStatus } = useProgress()
  const progress = ready ? pathProgress(pathSlug, lessons.map((l) => l.slug)) : null
  return { ready, progress, lessonStatus }
}

/** Start / resume control plus the aggregate meter, shown in the path head. */
export function PathStart({ pathSlug, lessons }) {
  const { ready, progress } = useLessonProgress(pathSlug, lessons)
  const first = lessons[0]

  if (!ready) {
    return (
      <div className="path-cta" aria-hidden="true">
        <span className="skel" style={{ width: 200, height: 42, borderRadius: 100 }} />
      </div>
    )
  }

  const nextSlug = progress.nextSlug ?? first.slug
  const next = lessons.find((l) => l.slug === nextSlug) ?? first
  const position = lessons.findIndex((l) => l.slug === next.slug) + 1

  return (
    <div className="path-cta">
      <div className="btn-row">
        <Link href={`/learn/${pathSlug}/${next.slug}`} className="btn">
          {progress.finished ? 'Review the path' : progress.started ? 'Continue' : 'Start the path'} <Chevron />
        </Link>
        {progress.started && !progress.finished && (
          <span className="mono">
            Lesson {position} of {progress.total} · {next.title}
          </span>
        )}
      </div>

      {progress.started && (
        <div className="path-meter">
          <Meter
            value={progress.percent}
            large
            label={progress.finished ? 'Path completed' : 'Your progress'}
            valueLabel={`${progress.completed}/${progress.total} lessons`}
          />
        </div>
      )}
    </div>
  )
}

/** Modules and their lessons, with per-lesson state. */
export function PathModules({ pathSlug, modules, lessons }) {
  const { ready, progress, lessonStatus } = useLessonProgress(pathSlug, lessons)
  const order = Object.fromEntries(lessons.map((lesson, i) => [lesson.slug, i + 1]))

  return (
    <div className="modules">
      {modules.map((module, moduleIndex) => (
        <section className="module" key={module.title} data-r style={{ '--rd': `${moduleIndex * 65}ms` }}>
          <header className="module-h">
            <p className="mono">Module {padIndex(moduleIndex + 1)}</p>
            <h2 className="h4">{module.title}</h2>
          </header>

          <ul className="index" role="list">
            {module.lessons.map((lesson) => {
              const status = ready ? lessonStatus(pathSlug, lesson.slug) : 'not_started'
              const isNext = ready && progress.started && !progress.finished && progress.nextSlug === lesson.slug

              return (
                <li key={lesson.slug}>
                  <Link href={`/learn/${pathSlug}/${lesson.slug}`} className="index-row">
                    <span className="index-n" data-done={status === 'completed' ? '1' : '0'}>
                      {status === 'completed' ? '✓' : padIndex(order[lesson.slug])}
                    </span>

                    <span className="index-b">
                      <span className="h4" style={{ display: 'block' }}>
                        {lesson.title}
                      </span>
                      <span className="body" style={{ display: 'block' }}>
                        {lesson.summary}
                      </span>
                    </span>

                    <span className="index-m">
                      {isNext && <Badge solid>Continue here</Badge>}
                      {!isNext && status === 'completed' && <Badge>Completed</Badge>}
                      {!isNext && status === 'in_progress' && <Badge>In progress</Badge>}
                      <span className="mono tnum">{formatMinutes(lesson.minutes)}</span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
