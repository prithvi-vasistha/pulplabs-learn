/**
 * One ranking function, used by both the search page and the command palette.
 *
 * Two surfaces that rank the same corpus differently is a bug the user
 * experiences as "search is unreliable", so the scoring lives here rather than
 * in either component.
 */

/** Rank one entry against the query terms. Title matches dominate. */
export function score(entry, terms) {
  const title = entry.title.toLowerCase()
  const description = (entry.description ?? '').toLowerCase()
  const keywords = (entry.keywords ?? '').toLowerCase()

  let total = 0

  for (const term of terms) {
    let hit = 0
    if (title.startsWith(term)) hit += 14
    if (title.includes(term)) hit += 10
    if (description.includes(term)) hit += 4
    if (keywords.includes(term)) hit += 2
    if (hit === 0) return 0 // every term must appear somewhere
    total += hit
  }

  return total
}

export function toTerms(query) {
  return query
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean)
}

export function rank(index, terms, limit) {
  if (terms.length === 0) return []

  const results = index
    .map((entry) => ({ entry, value: score(entry, terms) }))
    .filter((row) => row.value > 0)
    .sort((a, b) => b.value - a.value || a.entry.title.localeCompare(b.entry.title))
    .map((row) => row.entry)

  return limit ? results.slice(0, limit) : results
}

/** Display order for grouped results — sequenced material first. */
export const TYPE_ORDER = [
  'Article',
  'Learning path',
  'Lesson',
  'Technology',
  'Mock exam',
  'Documentation',
  'Project',
  'Field',
]

export function groupByType(entries) {
  const map = new Map()
  for (const entry of entries) {
    if (!map.has(entry.type)) map.set(entry.type, [])
    map.get(entry.type).push(entry)
  }
  return [...map.entries()].sort(
    (a, b) => TYPE_ORDER.indexOf(a[0]) - TYPE_ORDER.indexOf(b[0])
  )
}
