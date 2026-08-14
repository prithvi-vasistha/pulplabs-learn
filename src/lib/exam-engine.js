/**
 * What is left of the exam engine after the move to Postgres.
 *
 * `toCandidateExam` and `grade` are gone from this file — they now live in the
 * content service, beside the only database columns that hold an answer key.
 * That is a stronger boundary than the one they enforced here: the candidate
 * route does not select those columns at all, so there is no key in the
 * process that renders the page.
 *
 * This is the part that must stay in the browser: an id for an attempt the
 * reader keeps locally.
 */

export function newAttemptId() {
  const random = Math.random().toString(36).slice(2, 8)
  return `${Date.now().toString(36)}-${random}`
}
