'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Chevron, { ChevronLeft, Clock, Flag } from '@/components/void/Icons'
import CodeBlock from '@/components/learn/CodeBlock'
import Dialog from '@/components/learn/Dialog'
import { renderInline } from '@/components/learn/inline'
import { useProgress } from '@/components/learn/ProgressProvider'
import { Meter } from '@/components/learn/ui'
import { gradeAttempt } from '@/app/exams/actions'
import { newAttemptId } from '@/lib/exam-engine'
import { formatClock } from '@/lib/format'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

/**
 * The attempt experience.
 *
 * The exam arrives without correct answers — grading is a server action called
 * on submit. Nothing here can reveal an answer early, because nothing here
 * knows one.
 */
export default function ExamRunner({ exam }) {
  const router = useRouter()
  const { saveAttempt, writable } = useProgress()

  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [flags, setFlags] = useState({})
  const [remaining, setRemaining] = useState(exam.minutes * 60)
  const [confirming, setConfirming] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const stem = useRef(null)
  const submitted = useRef(false)

  const question = exam.questions[index]
  const answeredCount = useMemo(
    () => exam.questions.filter((q) => (answers[q.id] ?? []).length > 0).length,
    [answers, exam.questions]
  )
  const flaggedCount = Object.values(flags).filter(Boolean).length

  const submit = useCallback(
    async (auto = false) => {
      if (submitted.current) return
      submitted.current = true
      setSubmitting(true)
      setError(null)

      const response = await gradeAttempt(exam.slug, answers).catch((err) => ({
        ok: false,
        error: err?.message ?? 'The grader could not be reached.',
      }))

      if (!response?.ok) {
        submitted.current = false
        setSubmitting(false)
        setConfirming(false)
        setError(response?.error ?? 'Grading failed. Your answers are still here — try submitting again.')
        return
      }

      const attempt = {
        id: newAttemptId(),
        examSlug: exam.slug,
        examTitle: exam.title,
        at: new Date().toISOString(),
        autoSubmitted: auto,
        durationSeconds: exam.minutes * 60 - remaining,
        ...response.result,
      }

      saveAttempt(attempt)
      router.push(`/exams/${exam.slug}/results/${attempt.id}`)
    },
    [answers, exam.minutes, exam.slug, exam.title, remaining, router, saveAttempt]
  )

  // Countdown. Auto-submits once at zero.
  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          clearInterval(timer)
          submit(true)
          return 0
        }
        return value - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [submit])

  // Leaving mid-attempt loses the answers, so say so.
  useEffect(() => {
    const onBeforeUnload = (event) => {
      if (submitted.current || answeredCount === 0) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [answeredCount])

  const go = (nextIndex) => {
    setIndex(nextIndex)
    // Move focus to the new question so keyboard and screen reader users are
    // not left at the bottom of the previous one.
    requestAnimationFrame(() => stem.current?.focus())
  }

  const choose = (optionId) => {
    setAnswers((current) => {
      const picked = current[question.id] ?? []

      if (question.multiple) {
        return {
          ...current,
          [question.id]: picked.includes(optionId) ? picked.filter((id) => id !== optionId) : [...picked, optionId],
        }
      }

      return { ...current, [question.id]: picked[0] === optionId ? [] : [optionId] }
    })
  }

  const picked = answers[question.id] ?? []
  const low = remaining <= 300

  return (
    <>
      <div className="exam-bar">
        <div className="shell-wide exam-bar-in">
          <div className="exam-bar-t">
            <p className="mono">Attempt in progress</p>
            <strong>{exam.title}</strong>
          </div>

          <div className="exam-bar-r">
            <span className="mono tnum">
              {answeredCount}/{exam.questionCount} answered
            </span>
            <span className="timer" data-low={low ? '1' : '0'}>
              <Clock />
              {formatClock(remaining)}
            </span>
            <button type="button" className="btn btn-sm" onClick={() => setConfirming(true)} disabled={submitting}>
              Submit
            </button>
          </div>
        </div>

        <p className="sr-only" role="status">
          {low ? `Five minutes or less remaining. ${formatClock(remaining)} left.` : ''}
        </p>
      </div>

      <div className="shell-wide exam-shell">
        <div>
          <div className="q q-anim" key={question.id}>
            <div className="q-head">
              <p className="mono">
                Question {index + 1} of {exam.questionCount} · {question.topic}
              </p>
              <button
                type="button"
                className="chip"
                aria-pressed={Boolean(flags[question.id])}
                onClick={() => setFlags((current) => ({ ...current, [question.id]: !current[question.id] }))}
              >
                <Flag size={12} /> {flags[question.id] ? 'Flagged' : 'Flag for review'}
              </button>
            </div>

            {/* The page's h1 is the visually hidden exam title; each question
                is a section below it. */}
            <h2 className="q-stem" tabIndex={-1} ref={stem}>
              {renderInline(question.prompt)}
            </h2>

            {question.code && <CodeBlock code={question.code} lang={question.lang} />}

            {question.multiple && <p className="mono">Select all that apply</p>}

            <ul className={`opts${question.multiple ? ' opt-multi' : ''}`} role="list">
              {question.options.map((option, i) => {
                const selected = picked.includes(option.id)
                return (
                  <li key={option.id}>
                    <button
                      type="button"
                      className="opt"
                      aria-pressed={selected}
                      onClick={() => choose(option.id)}
                    >
                      <span className="opt-m" aria-hidden="true">
                        {LETTERS[i]}
                      </span>
                      <span>{renderInline(option.text)}</span>
                    </button>
                  </li>
                )
              })}
            </ul>

            {error && (
              <p className="body" role="alert">
                {error}
              </p>
            )}

            <div className="q-foot">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => go(index - 1)}
                disabled={index === 0}
              >
                <ChevronLeft /> Previous
              </button>

              {index === exam.questionCount - 1 ? (
                <button type="button" className="btn" onClick={() => setConfirming(true)} disabled={submitting}>
                  Review and submit <Chevron />
                </button>
              ) : (
                <button type="button" className="btn" onClick={() => go(index + 1)}>
                  Next <Chevron />
                </button>
              )}
            </div>
          </div>
        </div>

        <aside className="exam-side" aria-label="Question navigation">
          <div className="panel panel-sm">
            <Meter
              value={(answeredCount / exam.questionCount) * 100}
              label="Answered"
              valueLabel={`${answeredCount}/${exam.questionCount}`}
            />

            <ul className="qnav" role="list" style={{ marginTop: 18 }}>
              {exam.questions.map((q, i) => (
                <li key={q.id}>
                  <button
                    type="button"
                    className="qbtn"
                    onClick={() => go(i)}
                    aria-current={i === index ? 'true' : undefined}
                    data-answered={(answers[q.id] ?? []).length > 0 ? '1' : '0'}
                    data-flag={flags[q.id] ? '1' : '0'}
                    aria-label={`Question ${i + 1}${(answers[q.id] ?? []).length > 0 ? ', answered' : ', not answered'}${
                      flags[q.id] ? ', flagged' : ''
                    }`}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}
            </ul>

            <ul className="legend mono" role="list" style={{ marginTop: 20 }}>
              <li>
                <span className="sw" data-k="current" aria-hidden="true" /> Current
              </li>
              <li>
                <span className="sw" data-k="answered" aria-hidden="true" /> Answered
              </li>
              <li>
                <span className="sw" data-k="flag" aria-hidden="true" /> Flagged
              </li>
            </ul>
          </div>

          {!writable && (
            <p className="body">
              This browser is blocking local storage, so the result cannot be saved after grading. You will
              still see it once.
            </p>
          )}
        </aside>
      </div>

      <Dialog open={confirming} onClose={() => !submitting && setConfirming(false)} labelledBy="submit-h" describedBy="submit-d">
        <p className="mono">Before you submit</p>
        <h2 className="d3" id="submit-h">
          Submit {exam.title}?
        </h2>
        <p className="body" id="submit-d">
          Answers are graded on the server. You cannot change them afterwards, but you can retake the exam as
          many times as you like.
        </p>

        <ul className="dlg-facts mono" role="list">
          <li>
            <span>Answered</span>
            <span className="tnum">
              {answeredCount} of {exam.questionCount}
            </span>
          </li>
          <li>
            <span>Unanswered</span>
            <span className="tnum">{exam.questionCount - answeredCount}</span>
          </li>
          <li>
            <span>Flagged for review</span>
            <span className="tnum">{flaggedCount}</span>
          </li>
          <li>
            <span>Time remaining</span>
            <span className="tnum">{formatClock(remaining)}</span>
          </li>
        </ul>

        {exam.questionCount - answeredCount > 0 && (
          <p className="body">
            Unanswered questions are marked incorrect. There is no penalty for a wrong answer over a blank
            one.
          </p>
        )}

        <div className="dlg-actions">
          <button type="button" className="btn" onClick={() => submit(false)} disabled={submitting}>
            {submitting ? 'Grading…' : 'Submit for grading'}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setConfirming(false)}
            disabled={submitting}
          >
            Keep working
          </button>
        </div>
      </Dialog>

      <p className="sr-only" role="status">
        {submitting ? 'Grading your attempt' : ''}
      </p>

      <div className="exam-exit shell-wide">
        <Link href={`/exams/${exam.slug}`} className="link-quiet mono">
          Leave the attempt — answers are not saved
        </Link>
      </div>
    </>
  )
}
