/** Small display helpers. Formatting lives here so pages never inline it. */

export function formatMinutes(minutes) {
  if (!minutes && minutes !== 0) return '—'
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest === 0 ? `${hours} hr` : `${hours} hr ${rest} min`
}

export function formatCount(n, singular, plural = `${singular}s`) {
  return `${n} ${n === 1 ? singular : plural}`
}

export function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatClock(seconds) {
  const safe = Math.max(0, Math.floor(seconds))
  const m = Math.floor(safe / 60)
  const s = safe % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function percent(part, whole) {
  if (!whole) return 0
  return Math.round((part / whole) * 100)
}

/** Difficulty is rendered as filled hairline bars — 1, 2, or 3 of them. */
export const LEVEL_RANK = { Beginner: 1, Intermediate: 2, Advanced: 3 }

export function levelRank(level) {
  return LEVEL_RANK[level] ?? 2
}

export function padIndex(n) {
  return String(n).padStart(2, '0')
}

export function pathHref(slug) {
  return `/learn/${slug}`
}

export function lessonHref(pathSlug, lessonSlug) {
  return `/learn/${pathSlug}/${lessonSlug}`
}
