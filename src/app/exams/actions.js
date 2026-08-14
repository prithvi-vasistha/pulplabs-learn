'use server'

import { gradeExam } from '@/lib/content'

/**
 * Grade a submission.
 *
 * The boundary moved but did not weaken. The answer key used to live in a
 * module this file could import; it now lives in Postgres, and the only query
 * that selects `correct` and `explanation` is the grader inside the content
 * service. The browser has no route that returns them.
 */
export async function gradeAttempt(examSlug, answers) {
  if (!answers || typeof answers !== 'object') {
    return { ok: false, error: 'Answers must be an object keyed by question id.' }
  }

  const result = await gradeExam(examSlug, answers)
  if (!result) return { ok: false, error: `Unknown exam: ${examSlug}` }

  return { ok: true, result }
}
