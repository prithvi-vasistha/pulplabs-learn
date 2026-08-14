/**
 * The content service.
 *
 * `node:http` and one dependency (`pg`). A framework would add a router, a
 * body parser and a plugin system to serve twenty JSON routes against a
 * database on the same host — the project's rule about unnecessary
 * dependencies applies here as much as it does in the web app.
 */

import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'
import { dirname, resolve as resolvePath } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pool, query, waitForDatabase } from './db.js'
import { seed } from './seed.js'
import * as content from './content.js'

const here = dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.PORT ?? 4000)

/**
 * Route table. A pattern is a path with `:name` segments; the first match
 * wins. Explicit and greppable, which is the whole reason not to reach for a
 * router.
 */
const ROUTES = [
  ['GET', '/health', async () => ({ ok: true })],

  ['GET', '/settings', () => content.getSettings()],

  ['GET', '/paths', () => content.getPaths()],
  ['GET', '/paths/:slug', (p) => content.getPath(p.slug)],
  ['GET', '/paths/:path/lessons/:lesson', (p) => content.getLesson(p.path, p.lesson)],
  ['GET', '/lesson-params', () => content.getAllLessonParams()],

  ['GET', '/technologies', () => content.getTechnologies()],
  ['GET', '/technologies/:slug', (p) => content.getTechnology(p.slug)],

  ['GET', '/exams', () => content.getExams()],
  ['GET', '/exams/families', () => content.getExamFamilies()],
  ['GET', '/exams/slugs', () => content.getExamSlugs()],
  ['GET', '/exams/catalogue', () => content.getExamCatalogue()],
  ['GET', '/exams/:slug', (p) => content.getExam(p.slug)],
  // The candidate view. `correct` and `explanation` are not selected for it.
  ['GET', '/exams/:slug/candidate', (p) => content.getCandidateExam(p.slug)],
  // The only route that reads the answer key, and it never returns the exam.
  ['POST', '/exams/:slug/grade', (p, body) => content.gradeAttempt(p.slug, body?.answers ?? {})],

  ['GET', '/projects', () => content.getProjects()],
  ['GET', '/projects/:slug', (p) => content.getProject(p.slug)],

  ['GET', '/doc-sets', () => content.getDocSets()],
  ['GET', '/doc-sets/slugs', () => content.getDocSetSlugs()],
  ['GET', '/doc-sets/:slug', (p) => content.getDocSet(p.slug)],
  ['GET', '/doc-params', () => content.getAllDocParams()],
  ['GET', '/doc-pages/:set/:page*', (p) => content.getDocPage(p.set, p.page)],

  ['GET', '/field', () => content.getFieldEntries()],
  ['GET', '/field/slugs', () => content.getFieldSlugs()],
  ['GET', '/field/:slug', (p) => content.getFieldEntry(p.slug)],

  ['GET', '/search-index', () => content.getSearchIndex()],
  ['GET', '/progress-catalogue', () => content.getProgressCatalogue()],
  ['POST', '/lesson-refs', (p, body) => content.resolveLessonRefs(body?.refs ?? [])],
]

/** Match a path against a pattern, returning captured params or null. */
function match(pattern, path) {
  const want = pattern.split('/').filter(Boolean)
  const got = path.split('/').filter(Boolean)
  const params = {}

  for (let i = 0; i < want.length; i++) {
    const segment = want[i]

    // `:name*` swallows the rest of the path — doc page slugs contain slashes.
    if (segment.endsWith('*')) {
      const rest = got.slice(i)
      if (rest.length === 0) return null
      params[segment.slice(1, -1)] = rest.join('/')
      return params
    }

    if (i >= got.length) return null
    if (segment.startsWith(':')) params[segment.slice(1)] = decodeURIComponent(got[i])
    else if (segment !== got[i]) return null
  }

  return got.length === want.length ? params : null
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > 1_000_000) {
        reject(new Error('Request body too large'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8')
      if (!raw) return resolve(null)
      try {
        resolve(JSON.parse(raw))
      } catch {
        reject(new Error('Body is not valid JSON'))
      }
    })
    req.on('error', reject)
  })
}

function send(res, status, payload) {
  const body = JSON.stringify(payload)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store',
  })
  res.end(body)
}

const server = createServer(async (req, res) => {
  const started = Date.now()
  const url = new URL(req.url, 'http://localhost')
  const path = url.pathname.replace(/^\/api(?=\/|$)/, '') || '/'

  try {
    for (const [method, pattern, handler] of ROUTES) {
      if (req.method !== method) continue
      const params = match(pattern, path)
      if (!params) continue

      const body = method === 'POST' ? await readBody(req) : null
      const result = await handler(params, body)

      if (result === null || result === undefined) {
        send(res, 404, { error: 'Not found', path })
      } else {
        send(res, 200, result)
      }

      if (process.env.LOG_REQUESTS !== 'off') {
        console.log(`${req.method} ${path} ${res.statusCode} ${Date.now() - started}ms`)
      }
      return
    }

    send(res, 404, { error: 'No such route', path })
  } catch (error) {
    console.error(`${req.method} ${path} failed:`, error)
    send(res, 500, { error: 'Internal error' })
  }
})

async function start() {
  await waitForDatabase()

  // The schema is idempotent and so is the seed, so both run on every boot.
  // A fresh container and a restart take the same path, which means the path
  // that runs in production is the one that gets exercised in development.
  await query(readFileSync(resolvePath(here, '../db/schema.sql'), 'utf8'))
  console.log('[service] schema ready')

  if (process.env.SKIP_SEED !== '1') {
    await seed({ prune: process.env.SEED_PRUNE === '1' })
  }

  server.listen(PORT, '0.0.0.0', () => console.log(`[service] listening on :${PORT}`))
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    console.log(`[service] ${signal}, closing`)
    server.close(() => pool.end().then(() => process.exit(0)))
    setTimeout(() => process.exit(0), 5000).unref()
  })
}

start().catch((error) => {
  console.error('[service] failed to start:', error)
  process.exit(1)
})
