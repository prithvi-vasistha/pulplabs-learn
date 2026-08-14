/**
 * Progress persistence.
 *
 * This is a browser-local store, and the product says so wherever progress is
 * shown — nothing here pretends to be an account. The shape is deliberately
 * the shape an API would return, so swapping the two read/write functions for
 * fetch calls is the whole migration.
 */

export const STORAGE_KEY = 'pulplabs.learn.v1'

export const EMPTY_STATE = { version: 1, lessons: {}, attempts: [], saved: [] }

export const LESSON_STATUS = {
  notStarted: 'not_started',
  inProgress: 'in_progress',
  completed: 'completed',
}

export function lessonKey(pathSlug, lessonSlug) {
  return `${pathSlug}/${lessonSlug}`
}

export function readState() {
  if (typeof window === 'undefined') return EMPTY_STATE
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_STATE
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return EMPTY_STATE
    return {
      version: 1,
      lessons: parsed.lessons ?? {},
      attempts: Array.isArray(parsed.attempts) ? parsed.attempts : [],
      saved: Array.isArray(parsed.saved) ? parsed.saved : [],
    }
  } catch {
    // A corrupt or unreadable store must not break the page.
    return EMPTY_STATE
  }
}

export function writeState(state) {
  if (typeof window === 'undefined') return false
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    return true
  } catch {
    // Private browsing or a full quota. The UI reports this rather than
    // silently pretending the write succeeded.
    return false
  }
}

/** Aggregate progress for one path, derived from lesson completion. */
export function derivePathProgress(state, pathSlug, lessonSlugs) {
  const total = lessonSlugs.length
  let completed = 0
  let lastTouchedAt = null
  let lastTouchedSlug = null

  for (const slug of lessonSlugs) {
    const entry = state.lessons[lessonKey(pathSlug, slug)]
    if (!entry) continue
    if (entry.status === LESSON_STATUS.completed) completed += 1
    if (entry.at && (!lastTouchedAt || entry.at > lastTouchedAt)) {
      lastTouchedAt = entry.at
      lastTouchedSlug = slug
    }
  }

  const nextSlug =
    lessonSlugs.find((slug) => state.lessons[lessonKey(pathSlug, slug)]?.status !== LESSON_STATUS.completed) ?? null

  return {
    total,
    completed,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
    started: completed > 0 || Boolean(lastTouchedSlug),
    finished: total > 0 && completed === total,
    nextSlug,
    lastTouchedSlug,
    lastTouchedAt,
  }
}
