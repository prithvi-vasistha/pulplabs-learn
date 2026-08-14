'use client'

import Link from 'next/link'
import Chevron from '@/components/void/Icons'
import CodeBlock from '@/components/learn/CodeBlock'
import { renderInline } from '@/components/learn/inline'
import { useProgress } from '@/components/learn/ProgressProvider'
import { Badge, Crumbs, Meter, StateBlock } from '@/components/learn/ui'
import { formatClock, formatDate, formatCount } from '@/lib/format'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

/**
 * Results for one attempt.
 *
 * Attempts live in the browser store, so this reads by id rather than fetching.
 * A missing id is a real state — an attempt from another device, or one cleared
 * from storage — and gets a specific message rather than a generic error.
 */
export default function ExamResults({ examSlug, examTitle, attemptId, relatedPaths = [] }) {
  const { ready, getAttempt, attemptsFor } = useProgress()

  if (!ready) {
    return (
      <div className="shell-wide" style={{ paddingBlock: 'clamp(48px, 6vw, 88px)' }} aria-hidden="true">
        <span className="skel skel-t" style={{ width: '38%' }} />
        <span className="skel skel-b" style={{ marginTop: 28 }} />
      </div>
    )
  }

  const attempt = getAttempt(attemptId)

  if (!attempt) {
    const others = attemptsFor(examSlug)
    return (
      <div className="shell-wide" style={{ paddingBlock: 'clamp(48px, 6vw, 88px)' }}>
        <StateBlock
          eyebrow="Attempt not found"
          title="This result is not in this browser."
          body="Attempts are stored locally, not in an account — so a result taken on another device or browser, or cleared since, cannot be shown here."
          actions={
            <>
              <Link href={`/exams/${examSlug}/attempt`} className="btn">
                Take the exam again <Chevron />
              </Link>
              {others.length > 0 && (
                <Link href={`/exams/${examSlug}/results/${others[0].id}`} className="btn btn-ghost">
                  Your most recent attempt
                </Link>
              )}
              <Link href="/dashboard" className="btn btn-ghost">
                Dashboard
              </Link>
            </>
          }
        />
      </div>
    )
  }

  const previous = attemptsFor(examSlug).filter((a) => a.id !== attempt.id && a.at < attempt.at)[0]
  const delta = previous ? attempt.score - previous.score : null

  return (
    <>
      <section className="phead grid-bg">
        <div className="phead-light" aria-hidden="true">
          <img src="/void/aperture-glow.webp" alt="" fetchPriority="high" decoding="async" />
        </div>

        <div className="shell-wide phead-in">
          <Crumbs
            items={[
              { label: 'Mock exams', href: '/exams' },
              { label: examTitle, href: `/exams/${examSlug}` },
              { label: 'Results' },
            ]}
          />

          <p className="mono" style={{ marginTop: 20 }}>
            {attempt.autoSubmitted ? 'Submitted automatically when time ran out' : 'Submitted'} ·{' '}
            {formatDate(attempt.at)}
          </p>

          <div className="score" style={{ marginTop: 18 }}>
            <p className="score-n tnum">
              {attempt.score}
              <sup>%</sup>
            </p>
            <div className="score-side">
              <p className="d3">
                {attempt.passed ? 'Above the pass mark.' : 'Below the pass mark.'}
              </p>
              <p className="body" style={{ marginTop: 8, maxWidth: '46ch' }}>
                {attempt.correct} of {attempt.total} correct. The pass mark for this assessment is{' '}
                {attempt.passing}%.
                {delta != null && delta !== 0
                  ? ` That is ${Math.abs(delta)} points ${delta > 0 ? 'above' : 'below'} your previous attempt.`
                  : ''}
              </p>
            </div>
          </div>

          <div className="phead-meta">
            <ul className="meta mono" role="list">
              <li>
                <span className="tnum">{attempt.correct} correct</span>
              </li>
              <li>
                <span className="tnum">{attempt.incorrect} incorrect</span>
              </li>
              <li>
                <span className="tnum">{attempt.unanswered} unanswered</span>
              </li>
              <li>
                <span className="tnum">{formatClock(attempt.durationSeconds)} taken</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="sec-sm">
        <div className="shell-wide split">
          <div>
            <header className="sec-h" data-r>
              <p className="mono">By topic</p>
              <h2 className="d2">
                Where the marks <span className="dim">came from.</span>
              </h2>
            </header>

            <ul className="topics" role="list" data-r>
              {attempt.topics.map((topic) => (
                <li key={topic.topic}>
                  <span className="t-name">{topic.topic}</span>
                  <span className="t-meter">
                    <Meter value={topic.percent} quiet={topic.percent < 60} />
                  </span>
                  <span className="t-score tnum">
                    {topic.correct}/{topic.total}
                  </span>
                </li>
              ))}
            </ul>

            {attempt.recommendations.length > 0 && (
              <section style={{ marginTop: 'clamp(48px, 5.5vw, 72px)' }} aria-labelledby="rec-h">
                <header className="sec-h" data-r>
                  <p className="mono" id="rec-h">
                    What to do next
                  </p>
                  <h2 className="d2">Read these, then retake it.</h2>
                  <p className="lede">
                    One link per topic you scored under 80% on, pointing at the material that covers it.
                  </p>
                </header>

                <ul className="related-list" role="list" data-r style={{ marginTop: 0 }}>
                  {attempt.recommendations.map((rec) => (
                    <li key={rec.topic}>
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
              </section>
            )}

            <section style={{ marginTop: 'clamp(48px, 5.5vw, 72px)' }} aria-labelledby="review-h">
              <header className="sec-h" data-r>
                <p className="mono" id="review-h">
                  Question review
                </p>
                <h2 className="d2">Every question, with the reasoning.</h2>
              </header>

              <div className="review" data-r>
                {attempt.questions.map((question, i) => (
                  <article className="review-q" key={question.id}>
                    <div className="review-h">
                      <p className="mono">
                        {String(i + 1).padStart(2, '0')} · {question.topic}
                      </p>
                      {question.isCorrect ? (
                        <Badge>Correct</Badge>
                      ) : question.answered ? (
                        <Badge solid>Incorrect</Badge>
                      ) : (
                        <Badge quiet>Unanswered</Badge>
                      )}
                    </div>

                    <p className="q-stem" style={{ fontSize: '1rem' }}>
                      {renderInline(question.prompt)}
                    </p>

                    {question.code && <CodeBlock code={question.code} lang={question.lang} />}

                    <ul className="opts" role="list">
                      {question.options.map((option, optionIndex) => {
                        const isCorrect = question.correct.includes(option.id)
                        const isPicked = question.picked.includes(option.id)
                        if (!isCorrect && !isPicked) return null

                        return (
                          <li key={option.id}>
                            <div
                              className="opt opt-review"
                              data-correct={isCorrect ? '1' : '0'}
                              data-picked={isPicked ? '1' : '0'}
                            >
                              <span className="opt-m" aria-hidden="true">
                                {LETTERS[optionIndex]}
                              </span>
                              <span>
                                {renderInline(option.text)}
                                <span className="opt-tag">
                                  {isCorrect && isPicked
                                    ? 'Correct — your answer'
                                    : isCorrect
                                      ? 'Correct answer'
                                      : 'Your answer'}
                                </span>
                              </span>
                            </div>
                          </li>
                        )
                      })}
                    </ul>

                    <div className="explain">
                      <p className="mono">Why</p>
                      <p className="body">{renderInline(question.explanation)}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className="rail" aria-label="Result actions">
            <div className="panel panel-sm">
              <p className="mono">Retake</p>
              <p className="body" style={{ marginTop: 10 }}>
                Retaking generates a fresh attempt. Previous results stay in your dashboard so you can see the
                movement.
              </p>
              <div className="btn-row" style={{ marginTop: 18 }}>
                <Link href={`/exams/${examSlug}/attempt`} className="btn">
                  Retake exam <Chevron />
                </Link>
              </div>
            </div>

            {attempt.strong.length > 0 && (
              <div>
                <p className="mono" style={{ marginBottom: 12 }}>
                  Strong
                </p>
                <ul className="tags" role="list">
                  {attempt.strong.map((topic) => (
                    <li key={topic}>{topic}</li>
                  ))}
                </ul>
              </div>
            )}

            {attempt.weak.length > 0 && (
              <div>
                <p className="mono" style={{ marginBottom: 12 }}>
                  Needs work
                </p>
                <ul className="tags" role="list">
                  {attempt.weak.map((topic) => (
                    <li key={topic}>{topic}</li>
                  ))}
                </ul>
              </div>
            )}

            {relatedPaths.length > 0 && (
              <div>
                <p className="mono" style={{ marginBottom: 12 }}>
                  Paths covering this
                </p>
                <ul className="rail-list" role="list">
                  {relatedPaths.map((path) => (
                    <li key={path.slug}>
                      <span className="k body tnum">{formatCount(path.lessonCount, 'lesson')}</span>
                      <Link href={`/learn/${path.slug}`} className="v link-quiet">
                        {path.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="mono">This result is stored in this browser only</p>
          </aside>
        </div>
      </section>
    </>
  )
}
