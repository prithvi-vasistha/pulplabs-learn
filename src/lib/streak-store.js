/**
 * Streak and daily history, in this browser only.
 *
 * Same contract as progress-store: there is no account, nothing is uploaded,
 * and the interface says so wherever a streak appears. A streak that silently
 * lived on a server would be a claim we have not built.
 */

import { dayKey, daysBetween } from '@/lib/daily'

const KEY = 'pl-daily-v1'

const EMPTY = { current: 0, best: 0, lastDay: null, answered: {} }

function read() {
  if (typeof window === 'undefined') return EMPTY
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw)
    return {
      current: Number(parsed.current) || 0,
      best: Number(parsed.best) || 0,
      lastDay: parsed.lastDay ?? null,
      answered: parsed.answered && typeof parsed.answered === 'object' ? parsed.answered : {},
    }
  } catch {
    return EMPTY
  }
}

function write(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {}
  return state
}

/**
 * The stored streak is what it was when it was last written. A run that ended
 * two days ago is over whether or not the reader comes back to be told, so the
 * value is recomputed on read rather than trusted.
 */
export function readStreak(today = dayKey()) {
  const state = read()
  if (!state.lastDay) return { ...state, current: 0 }

  const gap = daysBetween(state.lastDay, today)
  if (gap > 1) return { ...state, current: 0 }
  return state
}

/** Record today's answer. Correct or not, showing up is what continues a run. */
export function recordDaily(today, correct) {
  const state = readStreak(today)

  if (state.answered[today]) return state // one attempt a day, and it counts

  const continued = state.lastDay && daysBetween(state.lastDay, today) === 1
  const current = continued ? state.current + 1 : 1

  return write({
    current,
    best: Math.max(current, state.best),
    lastDay: today,
    answered: { ...state.answered, [today]: correct ? 'correct' : 'incorrect' },
  })
}

export function clearStreak() {
  try {
    localStorage.removeItem(KEY)
  } catch {}
  return EMPTY
}

/** The last `days` days, oldest first, for the little run of marks on the card. */
export function recentDays(state, days = 14, today = dayKey()) {
  const end = Math.floor(Date.parse(`${today}T00:00:00Z`) / 86400000)
  return Array.from({ length: days }, (_, i) => {
    const key = new Date((end - (days - 1 - i)) * 86400000).toISOString().slice(0, 10)
    return { key, status: state.answered[key] ?? null, today: key === today }
  })
}
