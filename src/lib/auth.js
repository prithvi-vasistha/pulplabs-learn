/**
 * The session, as the web app sees it.
 *
 * The browser holds one httpOnly cookie and nothing else — no token in
 * localStorage, no user object in a client bundle, no decoding of anything in
 * a component. Every page that needs to know who is reading asks the service,
 * server-side, and React's `cache` makes that one call per request no matter
 * how many components ask.
 *
 * httpOnly is the whole point: a cross-site script that runs on this page
 * still cannot read the token, because JavaScript on this origin cannot read
 * the token either.
 */

import { cache } from 'react'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const SESSION_COOKIE = 'pl_session'
export const OAUTH_COOKIE = 'pl_oauth'

const BASE = (process.env.CONTENT_API_URL ?? 'http://localhost:4000').replace(/\/$/, '')

/**
 * Call the service with the caller's bearer token attached.
 *
 * `ip` is forwarded because the service rate-limits sign-in attempts, and
 * without it every attempt in the world would arrive from this one server and
 * share one bucket — locking out the whole site instead of one attacker.
 */
export async function serviceFetch(path, { token, method = 'GET', body, signal, ip } = {}) {
  const response = await fetch(`${BASE}/api${path}`, {
    method,
    cache: 'no-store',
    signal,
    headers: {
      accept: 'application/json',
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(ip ? { 'x-forwarded-for': ip } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  const payload = await response.json().catch(() => null)
  return { ok: response.ok, status: response.status, payload }
}

export async function sessionToken() {
  const store = await cookies()
  return store.get(SESSION_COOKIE)?.value ?? null
}

/**
 * Who is reading, or null. Never throws: a signed-out reader and an unreachable
 * auth service both mean "render the signed-out page", and a portal that 500s
 * because a cookie is stale is worse than one that shows a sign-in link.
 */
export const currentUser = cache(async () => {
  const token = await sessionToken()
  if (!token) return null

  try {
    const { ok, payload } = await serviceFetch('/auth/me', { token })
    return ok ? payload : null
  } catch {
    return null
  }
})

/* --------------------------------------------------------------- cookies -- */

/**
 * `secure` is decided by the request rather than by an environment variable,
 * because the one deployment that gets an env var wrong is the one running in
 * production over TLS with a cookie that is happy to travel in the clear.
 */
export function isSecureRequest(request) {
  const forwarded = request.headers.get('x-forwarded-proto')
  if (forwarded) return forwarded.split(',')[0].trim() === 'https'
  try {
    return new URL(request.url).protocol === 'https:'
  } catch {
    return false
  }
}

export function sessionCookie(request, token, maxAge) {
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: isSecureRequest(request),
    path: '/',
    maxAge,
  }
}

export function clearedSessionCookie(request) {
  return { ...sessionCookie(request, '', 0) }
}

/** The reader's address, as far as we can tell behind whatever proxy is in front. */
export function clientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') ?? ''
}

/** The origin this request arrived on — used as the OAuth redirect target. */
export function requestOrigin(request) {
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  const proto = request.headers.get('x-forwarded-proto')?.split(',')[0].trim() ?? (isSecureRequest(request) ? 'https' : 'http')
  if (host) return `${proto}://${host}`
  return new URL(request.url).origin
}

/**
 * Build a redirect from the origin the reader used.
 *
 * Not from `request.url`: inside the container Next reports that as
 * `http://0.0.0.0:3000`, and a Location header pointing at 0.0.0.0 is a dead
 * end in every browser. The Host header is what the reader actually typed.
 */
export function redirectTo(request, path, status = 303) {
  return NextResponse.redirect(new URL(path, requestOrigin(request)), status)
}

/** Only internal paths, so `?next=` cannot be pointed at another origin. */
export function safeNext(value, fallback = '/profile') {
  const next = String(value ?? '')
  if (!next.startsWith('/') || next.startsWith('//')) return fallback
  return next
}
