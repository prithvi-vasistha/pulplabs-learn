'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Chevron, { Check, Clock } from '@/components/void/Icons'
import { renderInline } from '@/components/learn/inline'
import { answerDaily } from '@/app/practice/actions'
import { readStreak, recentDays, recordDaily } from '@/lib/streak-store'

/**
 * The daily question.
 *
 * A catalogue gives you a reason to visit once. This is the reason to come
 * back: one real exam question a day, the same one for everybody, graded on
 * the server and explained immediately with a link to the lesson that covers
 * it. Being wrong is the useful outcome — it is the only part that tells you
 * what to read next.
 */
export default function DailyQuestion({ question, dayKey, compact = false }) {
  const [choice, setChoice] = useState(null)
  const [result, setResult] = useState(null)
  const [pending, setPending] = useState(false)
  const [streak, setStreak] = useState(null)

  useEffect(() => setStreak(readStreak(dayKey)), [dayKey])

  const alreadyDone = streak?.answered?.[dayKey]

  const submit = async () => {
    if (!choice || pending || result) return
    setPending(true)
    const response = await answerDaily(dayKey, choice)
    setPending(false)
    if (!response.ok) return
    setResult(response.result)
    setStreak(recordDaily(dayKey, response.result.correct))
  }

  if (!question) {
    return (
      <div className="daily">
        <p className="mono">Daily question</p>
        <p className="body">No question is available today.</p>
      </div>
    )
  }

  const days = streak ? recentDays(streak, compact ? 7 : 14, dayKey) : []

  return (
    <section className="daily" aria-labelledby="daily-h">
      <header className="daily-top">
        <div>
          <p className="mono" id="daily-h">
            Question of the day
          </p>
          <p className="daily-sub mono">{question.topic}</p>
        </div>

        {streak && (
          <div className="daily-streak">
            <span className="daily-n tnum">{streak.current}</span>
            <span className="mono">
              day{streak.current === 1 ? '' : 's'}
              {streak.best > streak.current ? ` · best ${streak.best}` : ''}
            </span>
          </div>
        )}
      </header>

      <h2 className="daily-q">{renderInline(question.prompt)}</h2>

      <ul className="daily-opts" role="list">
        {question.options.map((option) => {
          const picked = choice === option.id
          const isAnswer = result && result.answer === option.id
          const wrongPick = result && picked && !result.correct

          return (
            <li key={option.id}>
              <button
                type="button"
                className="opt daily-opt"
                aria-pressed={picked}
                data-state={isAnswer ? 'right' : wrongPick ? 'wrong' : undefined}
                disabled={Boolean(result) || !streak || Boolean(alreadyDone && !result)}
                onClick={() => setChoice(option.id)}
              >
                <span className="opt-k mono">{option.id.toUpperCase()}</span>
                <span className="opt-t">{renderInline(option.text)}</span>
                {isAnswer && <Check />}
              </button>
            </li>
          )
        })}
      </ul>

      {streak && !result && !alreadyDone && (
        <div className="daily-foot">
          <button type="button" className="btn" onClick={submit} disabled={!choice || pending}>
            {pending ? 'Checking…' : 'Check answer'}
          </button>
          <span className="mono daily-note">Answers are graded on the server</span>
        </div>
      )}

      {streak && !result && alreadyDone && (
        <div className="daily-foot">
          <span className="mono">
            <Clock /> Answered today — {alreadyDone === 'correct' ? 'correct' : 'not quite'}. Next one
            tomorrow.
          </span>
        </div>
      )}

      {result && (
        <div className="daily-result" data-correct={result.correct || undefined} role="status">
          <p className="h4">{result.correct ? 'Correct.' : 'Not quite.'}</p>
          <p className="body">{renderInline(result.explanation)}</p>
          <div className="daily-links">
            <Link href={result.studyHref} className="link">
              Read the lesson on {result.topic.toLowerCase()} <Chevron />
            </Link>
            <Link href={`/exams/${result.examSlug}`} className="link">
              Sit {result.examTitle} <Chevron />
            </Link>
          </div>
        </div>
      )}

      {streak && days.length > 0 && (
        <div className="daily-run" aria-label={`Last ${days.length} days`}>
          {days.map((d) => (
            <span
              key={d.key}
              className="daily-dot"
              data-status={d.status ?? undefined}
              data-today={d.today || undefined}
              title={d.key}
            />
          ))}
          <span className="mono daily-note">Kept in this browser — there is no account</span>
        </div>
      )}
    </section>
  )
}
