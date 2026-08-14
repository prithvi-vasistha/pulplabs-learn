'use server'

import { examBySlug } from '@/data/exams'
import { grade } from '@/lib/exam-engine'

/**
 * Grade a submission on the server.
 *
 * Correct answers and explanations live only in the question bank on this side
 * of the boundary — the attempt page receives questions with those fields
 * stripped (see toCandidateExam), so they cannot be read out of the payload
 * before submission.
 */
export async function gradeAttempt(examSlug, answers) {
  const exam = examBySlug[examSlug]

  if (!exam) {
    return { ok: false, error: `Unknown exam: ${examSlug}` }
  }

  if (!answers || typeof answers !== 'object') {
    return { ok: false, error: 'Answers must be an object keyed by question id.' }
  }

  return { ok: true, result: grade(exam, answers) }
}
