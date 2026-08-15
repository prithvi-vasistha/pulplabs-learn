/**
 * The playground: demo instances, and the engines they run.
 *
 * A demo instance is a lease — one row, one owner, a deadline and a run quota.
 * That is what signing in buys, and why it is the one section that requires an
 * account: everything else on this site is reading, and reading should not
 * need a login.
 *
 * The engines are pure functions of (spec, input). They live in the service
 * because the specs contain the answer keys, and because a demo whose logic
 * ships to the browser is a demo the reader can trivially fake a result from.
 */

import { one, rows } from './db.js'
import { badRequest, forbidden, notFound, tooMany } from './errors.js'
import { randomUUID } from './crypto.js'

const LEASE_MINUTES = Number(process.env.PLAYGROUND_LEASE_MINUTES ?? 45)
const RUN_QUOTA = Number(process.env.PLAYGROUND_RUN_QUOTA ?? 60)
const MAX_ACTIVE = 4

/* ---------------------------------------------------------------- demos --- */

const PUBLIC_COLS = `slug, title, tagline, kind, engine, summary, minutes, brief, controls, learn,
                     technologies, spec -> 'preview' as preview, position`

export async function getDemos() {
  return rows(`select ${PUBLIC_COLS} from playground_demos order by position`)
}

export async function getDemo(slug) {
  return one(`select ${PUBLIC_COLS} from playground_demos where slug = $1`, [slug])
}

/* ------------------------------------------------------------- instances -- */

function publicSession(row) {
  if (!row) return null
  return {
    id: row.id,
    demoSlug: row.demo_slug,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    lastUsedAt: row.last_used_at,
    runs: row.runs,
    quota: RUN_QUOTA,
  }
}

/** Drop leases that have run out. Cheap, and keeps the table honest. */
async function sweep() {
  await one('delete from playground_sessions where expires_at < now() returning 1').catch(() => null)
}

export async function startSession(userId, slug) {
  const demo = await one('select slug from playground_demos where slug = $1', [slug])
  if (!demo) throw notFound('No such demo')

  await sweep()

  const existing = await one(
    `select * from playground_sessions
      where user_id = $1 and demo_slug = $2 and expires_at > now()
      order by created_at desc limit 1`,
    [userId, slug]
  )
  // Re-entering a demo you already have open is not a new instance.
  if (existing) return publicSession(existing)

  const active = await one('select count(*)::int as n from playground_sessions where user_id = $1', [userId])
  if (active.n >= MAX_ACTIVE) {
    throw tooMany(`You have ${active.n} instances open. End one before starting another.`)
  }

  const row = await one(
    `insert into playground_sessions (id, user_id, demo_slug, expires_at)
     values ($1, $2, $3, now() + ($4 || ' minutes')::interval)
     returning *`,
    [randomUUID(), userId, slug, String(LEASE_MINUTES)]
  )
  return publicSession(row)
}

export async function listSessions(userId) {
  await sweep()
  const list = await rows(
    `select s.*, d.title from playground_sessions s
       join playground_demos d on d.slug = s.demo_slug
      where s.user_id = $1 order by s.created_at desc`,
    [userId]
  )
  return list.map((row) => ({ ...publicSession(row), title: row.title }))
}

export async function endSession(userId, id) {
  const row = await one('delete from playground_sessions where id = $1 and user_id = $2 returning id', [id, userId])
  if (!row) throw notFound('That instance is already gone')
  return { ok: true }
}

/* ------------------------------------------------------------------ run --- */

export async function run(userId, slug, { sessionId, input } = {}) {
  if (!sessionId) throw badRequest('Start an instance first')

  const session = await one(
    'select * from playground_sessions where id = $1 and demo_slug = $2',
    [sessionId, slug]
  )
  if (!session) throw notFound('That instance no longer exists')
  if (session.user_id !== userId) throw forbidden('That instance belongs to another account')
  if (new Date(session.expires_at) <= new Date()) throw forbidden('That instance has expired — start a new one')
  if (session.runs >= RUN_QUOTA) throw tooMany('This instance has used its run quota')

  const demo = await one('select slug, engine, spec, controls from playground_demos where slug = $1', [slug])
  if (!demo) throw notFound('No such demo')

  const engine = ENGINES[demo.engine]
  if (!engine) throw badRequest(`No engine for ${demo.engine}`)

  const started = process.hrtime.bigint()
  const result = engine(demo.spec ?? {}, input ?? {}, demo.controls ?? {})
  const ms = Number(process.hrtime.bigint() - started) / 1e6

  const updated = await one(
    'update playground_sessions set runs = runs + 1, last_used_at = now() where id = $1 returning *',
    [sessionId]
  )

  return { result: { ...result, ms: Math.round(ms * 100) / 100 }, session: publicSession(updated) }
}

/* -------------------------------------------------------------- engines --- */

const STOPWORDS = new Set(
  'a an and are as at be but by do does for from how i if in is it its my no not of on or that the their they this to was what when where which why will with you your'.split(' ')
)

const tokenize = (text) => String(text ?? '').toLowerCase().match(/[a-z0-9]+/g) ?? []

/**
 * BM25 over the demo's corpus, with every term's contribution reported.
 *
 * The scores are the point. A ranking without them is a black box, and the
 * whole reason to put a retriever in front of somebody is so they can see that
 * "irrelevant results" is usually one term carrying the entire score.
 */
function retrieval(spec, input) {
  const query = String(input.query ?? '').slice(0, 400)
  if (!query.trim()) throw badRequest('Type a query')

  const k1 = clamp(Number(input.k1 ?? 1.2), 0, 3)
  const b = clamp(Number(input.b ?? 0.75), 0, 1)
  const k = Math.round(clamp(Number(input.k ?? 5), 1, 10))
  const expand = Boolean(input.expand)

  const corpus = spec.corpus ?? []
  const docs = corpus.map((doc) => {
    const terms = tokenize(`${doc.title} ${doc.text}`)
    const tf = new Map()
    for (const term of terms) tf.set(term, (tf.get(term) ?? 0) + 1)
    return { ...doc, tf, length: terms.length }
  })

  const avgdl = docs.reduce((sum, d) => sum + d.length, 0) / (docs.length || 1)

  const asked = [...new Set(tokenize(query).filter((t) => !STOPWORDS.has(t) && t.length > 1))]
  const added = []
  if (expand) {
    for (const term of asked) {
      for (const synonym of spec.synonyms?.[term] ?? []) {
        if (!asked.includes(synonym) && !added.includes(synonym)) added.push(synonym)
      }
    }
  }

  const terms = [...asked, ...added]
  // Expanded terms are guesses about intent, so they count for less than the
  // words the reader actually typed.
  const weightFor = (term) => (added.includes(term) ? 0.5 : 1)

  const df = new Map()
  for (const term of terms) df.set(term, docs.filter((d) => d.tf.has(term)).length)

  const scored = docs.map((doc) => {
    const parts = []
    let score = 0

    for (const term of terms) {
      const frequency = doc.tf.get(term) ?? 0
      if (frequency === 0) continue
      const n = df.get(term)
      const idf = Math.log(1 + (docs.length - n + 0.5) / (n + 0.5))
      const norm = frequency * (k1 + 1) / (frequency + k1 * (1 - b + b * (doc.length / avgdl)))
      const contribution = idf * norm * weightFor(term)
      score += contribution
      parts.push({ term, tf: frequency, df: n, contribution: round(contribution) })
    }

    return {
      id: doc.id,
      title: doc.title,
      source: doc.source,
      text: doc.text,
      length: doc.length,
      score: round(score),
      parts: parts.sort((x, y) => y.contribution - x.contribution),
    }
  })

  const hits = scored.filter((d) => d.score > 0).sort((a, b2) => b2.score - a.score).slice(0, k)
  const unmatched = terms.filter((term) => df.get(term) === 0)

  const notes = []
  if (hits.length === 0) {
    notes.push({
      kind: 'miss',
      text: 'No document shares a single term with this query. A lexical retriever reports that honestly; a vector retriever would have returned its five nearest neighbours anyway, and the generator would have used them.',
    })
  }
  if (unmatched.length > 0 && hits.length > 0) {
    notes.push({
      kind: 'partial',
      text: `${unmatched.map((t) => `“${t}”`).join(', ')} ${unmatched.length === 1 ? 'appears' : 'appear'} nowhere in the corpus, so ${unmatched.length === 1 ? 'it contributes' : 'they contribute'} nothing to the ranking. The result you see was decided by the other terms.`,
    })
  }
  if (hits.length > 1 && hits[0].score > 0 && hits[1].score / hits[0].score > 0.92) {
    notes.push({
      kind: 'tie',
      text: 'The top two are within 8% of each other. A reranker earns its latency here; picking one of these by first-stage score alone is close to a coin toss.',
    })
  }
  if (hits.length > 0 && hits[0].parts.length === 1) {
    notes.push({
      kind: 'thin',
      text: `The top result is carried by one term — “${hits[0].parts[0].term}”. Single-term matches are where lexical retrieval looks confident and is not.`,
    })
  }

  return {
    engine: 'retrieval',
    query,
    terms: asked,
    expanded: added,
    unmatched,
    settings: { k, k1, b, expand },
    corpusSize: docs.length,
    avgLength: Math.round(avgdl),
    hits,
    notes,
  }
}

/**
 * A context window is arithmetic, and this is the arithmetic. No tokeniser is
 * loaded — the estimate is a heuristic, and saying so is part of the lesson.
 */
function budget(spec, input) {
  const text = String(input.text ?? '').slice(0, 20000)
  const window = Math.round(clamp(Number(input.window ?? 32000), 1000, 2_000_000))
  const reserve = Math.round(clamp(Number(input.reserve ?? 1500), 0, window))
  const system = Math.round(clamp(Number(input.system ?? 600), 0, window))
  const history = Math.round(clamp(Number(input.history ?? 2400), 0, window))
  const chunk = Math.round(clamp(Number(input.chunk ?? 400), 50, 4000))
  const overlap = Math.round(clamp(Number(input.overlap ?? 40), 0, chunk - 1))
  const topK = Math.round(clamp(Number(input.topK ?? 8), 0, 100))

  const prompt = estimateTokens(text)
  // Overlap is paid for on every chunk after the first.
  const perChunk = chunk
  const retrieved = topK === 0 ? 0 : perChunk * topK - overlap * Math.max(0, topK - 1)

  const segments = [
    { key: 'system', label: 'System instructions', tokens: system, fixed: true },
    { key: 'prompt', label: 'This prompt', tokens: prompt, fixed: true },
    { key: 'history', label: 'Conversation history', tokens: history, fixed: false },
    { key: 'retrieved', label: `Retrieved context (${topK} × ${chunk})`, tokens: retrieved, fixed: false },
    { key: 'reserve', label: 'Reserved for the answer', tokens: reserve, fixed: true },
  ]

  const total = segments.reduce((sum, s) => sum + s.tokens, 0)
  const over = total - window

  // How many chunks actually fit once everything fixed has been paid for.
  const fixed = system + prompt + history + reserve
  const room = Math.max(0, window - fixed)
  const fits = perChunk === 0 ? 0 : Math.max(0, Math.floor((room + overlap) / (perChunk - overlap)))

  const largest = [...segments].sort((a, b) => b.tokens - a.tokens)[0]

  const advice = []
  if (over > 0) {
    advice.push(
      `Over the window by ${over.toLocaleString()} tokens. At this chunk size only ${fits} of your ${topK} passages fit — the rest are evicted by whatever truncation your client does, usually silently and usually from the middle.`
    )
  } else {
    advice.push(
      `${(window - total).toLocaleString()} tokens spare, ${Math.round(((window - total) / window) * 100)}% of the window. That is your headroom for a longer answer or a deeper history.`
    )
  }
  if (largest.key === 'retrieved' && topK > 0) {
    advice.push(
      `Retrieved context is the largest line at ${Math.round((retrieved / total) * 100)}% of the total. Halving top-k usually costs less accuracy than teams expect — measure recall at k before you pay for all of it.`
    )
  }
  if (system > window * 0.15) {
    advice.push('System instructions are eating more than 15% of the window on every single call, including the ones that do not need them.')
  }
  if (reserve < 500) {
    advice.push('A reserve under 500 tokens truncates long answers mid-sentence. The model does not know it is running out of room.')
  }

  return {
    engine: 'budget',
    window,
    total,
    over,
    fitsChunks: fits,
    requestedChunks: topK,
    segments: segments.map((s) => ({ ...s, percent: round((s.tokens / window) * 100) })),
    estimate: { chars: text.length, words: text.trim() ? text.trim().split(/\s+/).length : 0, tokens: prompt },
    note: spec.preview?.note ?? null,
    advice,
  }
}

/** Character and word blend. Within a few percent of BPE on English prose. */
function estimateTokens(text) {
  const chars = text.length
  if (chars === 0) return 0
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  return Math.max(1, Math.round((chars / 4) * 0.5 + words * 1.33 * 0.5))
}

/**
 * Run the reader's keyword rules against the held-back labels and report the
 * numbers that decide whether a rule is good enough: accuracy, per-label
 * recall, and the cases it got wrong with the reason it got them wrong.
 */
function evals(spec, input) {
  const labels = spec.labels ?? []
  const cases = spec.cases ?? []
  const caseSensitive = Boolean(input.caseSensitive)
  const fallback = labels.includes(input.fallback) ? input.fallback : labels[0]

  const rules = {}
  for (const label of labels) {
    const raw = String(input.rules?.[label] ?? '').slice(0, 500)
    rules[label] = raw
      .split(',')
      .map((term) => (caseSensitive ? term.trim() : term.trim().toLowerCase()))
      .filter(Boolean)
  }
  if (Object.values(rules).every((list) => list.length === 0)) {
    throw badRequest('Give at least one rule a keyword')
  }

  const results = cases.map((item) => {
    const haystack = caseSensitive ? item.text : item.text.toLowerCase()
    const scores = labels.map((label) => ({
      label,
      matched: rules[label].filter((term) => haystack.includes(term)),
    }))

    const best = scores.reduce((a, b2) => (b2.matched.length > a.matched.length ? b2 : a), { label: null, matched: [] })
    const predicted = best.matched.length > 0 ? best.label : fallback
    const ambiguous = scores.filter((s) => s.matched.length > 0 && s.matched.length === best.matched.length).length > 1

    return {
      id: item.id,
      text: item.text,
      expected: item.label,
      predicted,
      correct: predicted === item.label,
      matched: best.matched,
      byFallback: best.matched.length === 0,
      ambiguous,
    }
  })

  const correct = results.filter((r) => r.correct).length
  const perLabel = labels.map((label) => {
    const actual = results.filter((r) => r.expected === label)
    const predicted = results.filter((r) => r.predicted === label)
    const hit = results.filter((r) => r.expected === label && r.correct).length
    return {
      label,
      support: actual.length,
      recall: actual.length ? round((hit / actual.length) * 100) : 0,
      precision: predicted.length ? round((hit / predicted.length) * 100) : 0,
      keywords: rules[label].length,
    }
  })

  const notes = []
  const fallbackCount = results.filter((r) => r.byFallback).length
  if (fallbackCount > 0) {
    const share = Math.round((fallbackCount / results.length) * 100)
    notes.push(
      `${fallbackCount} of ${results.length} cases matched no rule at all and fell through to “${fallback}” — ${share}% of the set. A fallback carrying that much traffic is not a classifier, it is a default.`
    )
  }
  const ambiguousCount = results.filter((r) => r.ambiguous).length
  if (ambiguousCount > 0) {
    notes.push(`${ambiguousCount} cases matched two labels equally. Order decided them, which means the result is stable only until somebody reorders the rules.`)
  }
  const weakest = [...perLabel].sort((a, b2) => a.recall - b2.recall)[0]
  if (weakest && weakest.recall < 100) {
    notes.push(`Weakest label is “${weakest.label}” at ${weakest.recall}% recall. That is the one to look at before adding another keyword anywhere else.`)
  }

  return {
    engine: 'evals',
    total: results.length,
    correct,
    accuracy: round((correct / (results.length || 1)) * 100),
    fallback,
    caseSensitive,
    perLabel,
    results,
    notes,
  }
}

const ENGINES = { retrieval, budget, evals }

/* --------------------------------------------------------------- helpers --- */

function clamp(value, min, max) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function round(value) {
  return Math.round(value * 100) / 100
}
