'use client'

import Link from 'next/link'
import Chevron from '@/components/void/Icons'
import { useProgress } from '@/components/learn/ProgressProvider'
import { Badge, Difficulty } from '@/components/learn/ui'
import { formatCount, formatDate, padIndex } from '@/lib/format'

/** Exam index rows, annotated with the reader's best local score. */
export function ExamList({ exams }) {
  const { ready, attemptsFor } = useProgress()

  return (
    <ul className="index" role="list">
      {exams.map((exam, i) => {
        const attempts = ready ? attemptsFor(exam.slug) : []
        const best = attempts.reduce((max, a) => Math.max(max, a.score), -1)

        return (
          <li key={exam.slug} data-r style={{ '--rd': `${Math.min(i, 5) * 65}ms` }}>
            <Link href={`/exams/${exam.slug}`} className="index-row">
              <span className="index-n">{padIndex(i + 1)}</span>

              <span className="index-b">
                <span className="h4" style={{ display: 'block' }}>
                  {exam.title}
                </span>
                <span className="body" style={{ display: 'block' }}>
                  {exam.summary}
                </span>
                <span className="tags" style={{ display: 'flex', marginTop: 4 }}>
                  {exam.topics.slice(0, 4).map((topic) => (
                    <span key={topic} className="mono">
                      {topic}
                    </span>
                  ))}
                </span>
              </span>

              <span className="index-m">
                <Difficulty level={exam.level} />
                <span className="mono tnum">
                  {formatCount(exam.questionCount, 'question')} · {exam.minutes} min
                </span>
                {best >= 0 && <Badge>Best {best}%</Badge>}
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

/** Start control plus this browser's attempt history for one exam. */
export function ExamStart({ exam }) {
  const { ready, attemptsFor } = useProgress()
  const attempts = ready ? attemptsFor(exam.slug) : []

  return (
    <>
      <div className="panel panel-sm">
        <p className="mono">Ready when you are</p>
        <p className="body" style={{ marginTop: 10 }}>
          {exam.minutes} minutes, {exam.questionCount} questions. The timer starts on the next screen and the
          result is graded on the server.
        </p>
        <div className="btn-row" style={{ marginTop: 18 }}>
          <Link href={`/exams/${exam.slug}/attempt`} className="btn">
            Start exam <Chevron />
          </Link>
        </div>
      </div>

      <div>
        <p className="mono" style={{ marginBottom: 12 }}>
          Your attempts
        </p>

        {!ready ? (
          <span className="skel" style={{ width: '80%' }} aria-hidden="true" />
        ) : attempts.length === 0 ? (
          <p className="body">
            No attempts yet in this browser. Results are stored locally — there is no account and nothing is
            uploaded.
          </p>
        ) : (
          <ul className="rail-list" role="list">
            {attempts.slice(0, 6).map((attempt) => (
              <li key={attempt.id}>
                <span className="k body">{formatDate(attempt.at)}</span>
                <Link href={`/exams/${exam.slug}/results/${attempt.id}`} className="v link-quiet tnum">
                  {attempt.score}%
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
