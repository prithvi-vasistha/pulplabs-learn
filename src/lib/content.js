/**
 * The content API.
 *
 * Every accessor here was already `async` when the data lived in static
 * modules, on the bet that "replacing the imports with fetch does not touch a
 * single call site". This file is that bet being collected: the bodies became
 * one-line fetches against the content service, and no page component changed.
 *
 * The derivation logic — path summaries, technology joins, the search index —
 * moved to the service, next to the database it reads. There is one
 * implementation of each shape rather than two that can drift.
 */

const BASE = (process.env.CONTENT_API_URL ?? 'http://localhost:4000').replace(/\/$/, '')

/**
 * `no-store` is what makes the site dynamic: edit a row, reload, see it. The
 * service sits on the same host and the queries are small, so this costs a
 * millisecond and buys the whole point of putting content in a database.
 *
 * A 404 is a real answer — "no such lesson" — so it becomes `null` and callers
 * keep using `if (!x) notFound()`.
 */
async function get(path, { fallback } = {}) {
  let response
  try {
    response = await fetch(`${BASE}${path}`, {
      cache: 'no-store',
      headers: { accept: 'application/json' },
    })
  } catch (error) {
    throw new Error(`Content service unreachable at ${BASE}${path}: ${error.message}`, { cause: error })
  }

  if (response.status === 404) return fallback ?? null
  if (!response.ok) throw new Error(`Content service returned ${response.status} for ${path}`)
  return response.json()
}

async function post(path, body) {
  const response = await fetch(`${BASE}${path}`, {
    method: 'POST',
    cache: 'no-store',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(body),
  })
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`Content service returned ${response.status} for ${path}`)
  return response.json()
}

const encode = encodeURIComponent

/* ------------------------------------------------------------- settings --- */

/**
 * Editorial constants — the certification disclosure, the catalogue note, the
 * field rules. They used to be exported strings; they are rows now, so they
 * are awaited like everything else.
 */
export async function getSettings() {
  return get('/api/settings', { fallback: {} })
}

/* ---------------------------------------------------------------- paths --- */

export async function getPaths() {
  return get('/api/paths', { fallback: [] })
}

export async function getPath(slug) {
  return get(`/api/paths/${encode(slug)}`)
}

export async function getLesson(pathSlug, lessonSlug) {
  return get(`/api/paths/${encode(pathSlug)}/lessons/${encode(lessonSlug)}`)
}

export async function getAllLessonParams() {
  return get('/api/lesson-params', { fallback: [] })
}

/* --------------------------------------------------------- technologies --- */

export async function getTechnologies() {
  return get('/api/technologies', { fallback: [] })
}

export async function getTechnology(slug) {
  return get(`/api/technologies/${encode(slug)}`)
}

/* ---------------------------------------------------------------- exams --- */

export async function getExams() {
  return get('/api/exams', { fallback: [] })
}

export async function getExamFamilies() {
  return get('/api/exams/families', { fallback: [] })
}

export async function getExam(slug) {
  return get(`/api/exams/${encode(slug)}`)
}

/**
 * The exam as a candidate may see it. The service does not select `correct` or
 * `explanation` for this route, so the answer key is not merely stripped in
 * transit — it never leaves the database.
 */
export async function getCandidateExam(slug) {
  return get(`/api/exams/${encode(slug)}/candidate`)
}

export async function getExamSlugs() {
  return get('/api/exams/slugs', { fallback: [] })
}

export async function getExamCatalogue() {
  return get('/api/exams/catalogue', { fallback: [] })
}

/** Grade a submission. Called from a server action, never from the browser. */
export async function gradeExam(slug, answers) {
  return post(`/api/exams/${encode(slug)}/grade`, { answers })
}

/* ------------------------------------------------------------- projects --- */

export async function getProjects() {
  return get('/api/projects', { fallback: [] })
}

export async function getProject(slug) {
  return get(`/api/projects/${encode(slug)}`)
}

/* ----------------------------------------------------------------- docs --- */

export async function getDocSets() {
  return get('/api/doc-sets', { fallback: [] })
}

export async function getDocSet(slug) {
  return get(`/api/doc-sets/${encode(slug)}`)
}

export async function getDocPage(setSlug, pageSlug) {
  // Doc page slugs contain slashes; the route's trailing capture takes them whole.
  return get(`/api/doc-pages/${encode(setSlug)}/${pageSlug.split('/').map(encode).join('/')}`)
}

export async function getAllDocParams() {
  return get('/api/doc-params', { fallback: [] })
}

export async function getDocSetSlugs() {
  return get('/api/doc-sets/slugs', { fallback: [] })
}

/* ---------------------------------------------------------------- field --- */

export async function getFieldEntries() {
  return get('/api/field', { fallback: [] })
}

export async function getFieldEntry(slug) {
  return get(`/api/field/${encode(slug)}`)
}

export async function getFieldSlugs() {
  return get('/api/field/slugs', { fallback: [] })
}

/* --------------------------------------------------------------- search --- */

export async function getSearchIndex() {
  return get('/api/search-index', { fallback: [] })
}

/* -------------------------------------------------------- home + lookup --- */

export async function resolveLessonRefs(refs) {
  return post('/api/lesson-refs', { refs })
}

export async function getProgressCatalogue() {
  return get('/api/progress-catalogue', { fallback: [] })
}
