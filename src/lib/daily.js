/**
 * One question a day.
 *
 * This is the thing a course catalogue does not give you: a reason to come
 * back tomorrow. Everyone gets the same question on the same day, drawn from
 * the real exam banks — so it is worth discussing, and it is never filler
 * written to fill a slot.
 *
 * Deliberately not gamified past the point of honesty: a streak counts days
 * you actually answered, it lives in this browser, and the product says so.
 * There is no account, so there is no leaderboard and no badge that implies
 * one.
 */

/** Day key in UTC, so the question turns over at the same instant for everyone. */
export function dayKey(date = new Date()) {
  return date.toISOString().slice(0, 10)
}

/** Days between two day keys. Used to decide whether a streak survived. */
export function daysBetween(a, b) {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000)
}

/** Stable integer from the day key — the same everywhere, with no stored state. */
function dayIndex(key) {
  let h = 0x811c9dc5
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h
}

/**
 * Pick the day's question from a flat pool.
 *
 * The pool is walked with a stride that is coprime with its length, so the
 * sequence visits every question once before repeating any of them. A plain
 * hash-modulo would repeat some questions within a week and never show others.
 */
export function pickDaily(pool, key = dayKey()) {
  if (pool.length === 0) return null

  const n = pool.length
  let stride = (dayIndex('stride') % n) + 1
  while (gcd(stride, n) !== 1) stride = (stride % n) + 1

  const day = Math.floor(Date.parse(`${key}T00:00:00Z`) / 86400000)
  return pool[((day * stride) % n + n) % n]
}

function gcd(a, b) {
  while (b) [a, b] = [b, a % b]
  return a
}
