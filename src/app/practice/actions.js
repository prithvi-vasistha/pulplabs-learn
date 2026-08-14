'use server'

import { exams } from '@/data/exams'
import { dayKey, pickDaily } from '@/lib/daily'

/**
 * Grade the daily question on the server.
 *
 * Same rule as the exams: the correct answer and the explanation exist only on
 * this side of the boundary. The card renders a question with those fields
 * stripped, so nothing can be read out of the page source before answering.
 */
export async function answerDaily(key, choice) {
  const pool = flatten()
  const today = dayKey()

  // Only today's question can be answered, or the streak means nothing.
  if (key !== today) {
    return { ok: false, error: 'That question is no longer today’s.' }
  }

  const picked = pickDaily(pool, today)
  if (!picked) return { ok: false, error: 'No question available.' }

  const correct = picked.question.correct.length === 1 && picked.question.correct[0] === choice

  return {
    ok: true,
    result: {
      correct,
      answer: picked.question.correct[0],
      explanation: picked.question.explanation,
      topic: picked.question.topic,
      examSlug: picked.examSlug,
      examTitle: picked.examTitle,
      studyHref: picked.studyHref,
    },
  }
}

function flatten() {
  return exams.flatMap((exam) =>
    exam.questions
      .filter((q) => q.type === 'single' && q.correct.length === 1)
      .map((question) => ({
        question,
        examSlug: exam.slug,
        examTitle: exam.title,
        studyHref: exam.topicLinks?.[question.topic] ?? `/exams/${exam.slug}`,
      }))
  )
}
