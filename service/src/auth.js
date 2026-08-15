/**
 * Accounts.
 *
 * Two ways in — a password, or Google — and one way out: a signed token with
 * the user id in it. The web app never sees a password hash, never talks to
 * Google's token endpoint, and never holds the client secret; it holds a
 * cookie and asks this service who it belongs to.
 *
 * Read `crypto.js` first. It explains why the email is ciphertext with an HMAC
 * index beside it and why the password is a one-way digest instead.
 */

import { one, query } from './db.js'
import {
  blindIndex,
  hashPassword,
  initKeys,
  randomToken,
  randomUUID,
  seal,
  signToken,
  unseal,
  verifyPassword,
  verifyToken,
} from './crypto.js'
import { badRequest, conflict, HttpError, tooMany, unauthorized } from './errors.js'

const TOKEN_TTL_SECONDS = Number(process.env.AUTH_TOKEN_TTL ?? 7 * 24 * 60 * 60)
const MIN_PASSWORD = 10

export const GOOGLE = {
  clientId: process.env.GOOGLE_CLIENT_ID ?? '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
  authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUrl: 'https://oauth2.googleapis.com/token',
  scope: 'openid email profile',
}

/**
 * Resolve the signing secret.
 *
 * `AUTH_SECRET` wins when it is set — that is how a real deployment does it.
 * Without one, a secret is generated and kept in `settings`, so `docker run`
 * with no configuration still issues tokens that survive a restart. The
 * alternative, a hardcoded fallback, is the single most common way a demo
 * ships an attacker's signing key to production.
 */
export async function initAuth() {
  let secret = process.env.AUTH_SECRET

  if (!secret) {
    const row = await one(`select value from settings where key = 'auth.secret'`)
    secret = row?.value ?? null

    if (!secret) {
      secret = randomToken(48)
      await query(
        `insert into settings (key, value) values ('auth.secret', $1)
         on conflict (key) do nothing`,
        [JSON.stringify(secret)]
      )
      // Re-read: another process may have won the insert.
      const stored = await one(`select value from settings where key = 'auth.secret'`)
      secret = stored?.value ?? secret
      console.log('[auth] generated a signing secret and stored it in settings — set AUTH_SECRET to control it')
    }
  }

  initKeys(secret)

  /* Loud on purpose. A silent "google: off" reads as a missing feature rather
     than a missing environment variable, and that is exactly how it was read
     the first time this shipped. */
  if (googleConfigured()) {
    console.log(`[auth] ready — google sign-in enabled for client ${GOOGLE.clientId.slice(0, 12)}…`)
  } else {
    const missing = [
      !GOOGLE.clientId && 'GOOGLE_CLIENT_ID',
      !GOOGLE.clientSecret && 'GOOGLE_CLIENT_SECRET',
    ].filter(Boolean)
    console.warn(
      `[auth] ready — GOOGLE SIGN-IN IS OFF: ${missing.join(' and ')} not set. ` +
        'Start the container with `--env-file .env` (see .env.example). Email and password still work.'
    )
  }
}

/* ----------------------------------------------------------- the record --- */

const USER_COLS = 'id, email_index, email_enc, name_enc, avatar_enc, password_hash, provider, google_sub, created_at, last_login_at'

/** The shape everything outside this service sees. No hash, no index, no key. */
function publicUser(row) {
  if (!row) return null
  return {
    id: row.id,
    email: unseal(row.email_enc),
    name: unseal(row.name_enc),
    avatar: unseal(row.avatar_enc),
    provider: row.provider,
    hasPassword: Boolean(row.password_hash),
    googleLinked: Boolean(row.google_sub),
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at,
  }
}

function issue(row) {
  return {
    token: signToken({ sub: row.id }, { ttlSeconds: TOKEN_TTL_SECONDS }),
    expiresIn: TOKEN_TTL_SECONDS,
    user: publicUser(row),
  }
}

async function touch(id) {
  await query('update users set last_login_at = now() where id = $1', [id])
}

/* ---------------------------------------------------------- validation --- */

// Deliberately loose. Anything stricter rejects addresses that are valid and
// in use; the actual test of an address is whether mail to it arrives.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function cleanEmail(value) {
  const email = String(value ?? '').trim()
  if (!EMAIL.test(email) || email.length > 320) throw badRequest('That does not look like an email address')
  return email
}

function cleanPassword(value) {
  const password = String(value ?? '')
  if (password.length < MIN_PASSWORD) throw badRequest(`Use at least ${MIN_PASSWORD} characters`)
  if (password.length > 512) throw badRequest('That password is too long')
  return password
}

function cleanName(value) {
  const name = String(value ?? '').trim().replace(/\s+/g, ' ')
  if (name.length < 1) throw badRequest('Tell us what to call you')
  return name.slice(0, 120)
}

/* -------------------------------------------------------- rate limiting --- */

/*
 * In memory, per process. It is not a distributed rate limiter and does not
 * pretend to be one — it exists so an online guessing attack against one
 * address costs hours instead of seconds. scrypt is doing the heavy lifting.
 */
const attempts = new Map()
const WINDOW_MS = 15 * 60 * 1000
const MAX_FAILURES = 8

function guard(key) {
  const entry = attempts.get(key)
  if (entry && entry.until > Date.now() && entry.count >= MAX_FAILURES) throw tooMany()
}

function recordFailure(key) {
  const now = Date.now()
  const entry = attempts.get(key)
  if (!entry || entry.until <= now) attempts.set(key, { count: 1, until: now + WINDOW_MS })
  else entry.count += 1

  // Cheap sweep, so a long-lived process does not accumulate dead keys.
  if (attempts.size > 5000) {
    for (const [k, v] of attempts) if (v.until <= now) attempts.delete(k)
  }
}

function clearFailures(key) {
  attempts.delete(key)
}

/* ------------------------------------------------------------- password --- */

export async function register({ email, name, password }, { ip } = {}) {
  const address = cleanEmail(email)
  const index = blindIndex(address)

  guard(`register:${ip ?? 'unknown'}`)

  const existing = await one('select id from users where email_index = $1', [index])
  if (existing) throw conflict('There is already an account with that address')

  const row = await one(
    `insert into users (id, email_index, email_enc, name_enc, password_hash, provider, last_login_at)
     values ($1, $2, $3, $4, $5, 'password', now())
     returning ${USER_COLS}`,
    [randomUUID(), index, seal(address), seal(cleanName(name)), await hashPassword(cleanPassword(password))]
  )

  return issue(row)
}

export async function login({ email, password }, { ip } = {}) {
  const address = cleanEmail(email)
  const index = blindIndex(address)
  const key = `login:${index}:${ip ?? 'unknown'}`

  guard(key)

  const row = await one(`select ${USER_COLS} from users where email_index = $1`, [index])
  const ok = row?.password_hash ? await verifyPassword(String(password ?? ''), row.password_hash) : false

  if (!ok) {
    recordFailure(key)
    // One message for "no such account" and "wrong password". The difference
    // is not the caller's business and leaking it enumerates our users.
    throw unauthorized('That email and password do not match an account')
  }

  clearFailures(key)
  await touch(row.id)
  return issue(row)
}

/* --------------------------------------------------------------- google --- */

export function googleConfigured() {
  return Boolean(GOOGLE.clientId && GOOGLE.clientSecret)
}

/**
 * Exchange an authorization code, then sign in whoever it identifies.
 *
 * The ID token's signature is not checked against Google's JWKS, and that is
 * deliberate: it did not arrive through a browser, it came back on our own TLS
 * connection to Google's token endpoint in response to a request carrying our
 * client secret. Google's own documentation says verification is unnecessary
 * on this path. The claims are still checked — issuer, audience, expiry — so a
 * misconfigured client fails loudly instead of trusting the wrong project.
 */
export async function googleSignIn({ code, redirectUri, codeVerifier }) {
  if (!googleConfigured()) throw new HttpError(501, 'Google sign-in is not configured on this server')
  if (!code) throw badRequest('Missing authorization code')

  const body = new URLSearchParams({
    code,
    client_id: GOOGLE.clientId,
    client_secret: GOOGLE.clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  })
  if (codeVerifier) body.set('code_verifier', codeVerifier)

  const response = await fetch(GOOGLE.tokenUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    console.error('[auth] google token exchange failed:', payload)
    throw new HttpError(502, payload.error_description || 'Google rejected the sign-in attempt')
  }

  const claims = decodeIdToken(payload.id_token)
  if (!claims) throw new HttpError(502, 'Google returned a token we could not read')

  const issuers = ['https://accounts.google.com', 'accounts.google.com']
  if (!issuers.includes(claims.iss)) throw new HttpError(502, 'Unexpected token issuer')
  if (claims.aud !== GOOGLE.clientId) throw new HttpError(502, 'Token was issued for a different client')
  if (typeof claims.exp === 'number' && claims.exp * 1000 < Date.now()) throw new HttpError(502, 'Google token has expired')
  if (claims.email && claims.email_verified === false) throw badRequest('Verify your Google email address first')
  if (!claims.sub || !claims.email) throw new HttpError(502, 'Google did not return an identity')

  return upsertGoogleUser(claims)
}

function decodeIdToken(token) {
  try {
    return JSON.parse(Buffer.from(String(token).split('.')[1], 'base64url').toString('utf8'))
  } catch {
    return null
  }
}

async function upsertGoogleUser(claims) {
  const address = cleanEmail(claims.email)
  const index = blindIndex(address)
  const name = claims.name ? cleanName(claims.name) : address.split('@')[0]

  // Already linked.
  let row = await one(`select ${USER_COLS} from users where google_sub = $1`, [claims.sub])

  if (!row) {
    // Same verified address as a password account: link them rather than
    // creating a second account for one person.
    const existing = await one('select id from users where email_index = $1', [index])

    row = existing
      ? await one(
          `update users set google_sub = $2, name_enc = coalesce(name_enc, $3), avatar_enc = $4, last_login_at = now()
           where id = $1 returning ${USER_COLS}`,
          [existing.id, claims.sub, seal(name), seal(claims.picture ?? null)]
        )
      : await one(
          `insert into users (id, email_index, email_enc, name_enc, avatar_enc, provider, google_sub, last_login_at)
           values ($1, $2, $3, $4, $5, 'google', $6, now())
           returning ${USER_COLS}`,
          [randomUUID(), index, seal(address), seal(name), seal(claims.picture ?? null), claims.sub]
        )
  } else {
    row = await one(
      `update users set name_enc = $2, avatar_enc = $3, last_login_at = now()
       where id = $1 returning ${USER_COLS}`,
      [row.id, seal(name), seal(claims.picture ?? null)]
    )
  }

  return issue(row)
}

/* ------------------------------------------------------------ the token --- */

/** Resolve a bearer token to a user, or null. Called on most requests. */
export async function userFromToken(token) {
  const claims = verifyToken(token)
  if (!claims?.sub) return null

  const row = await one(`select ${USER_COLS} from users where id = $1`, [claims.sub])
  return publicUser(row)
}

export async function getAccount(userId) {
  const row = await one(`select ${USER_COLS} from users where id = $1`, [userId])
  return publicUser(row)
}

export function providers() {
  return {
    password: true,
    google: {
      enabled: googleConfigured(),
      clientId: GOOGLE.clientId || null,
      authorizeUrl: GOOGLE.authorizeUrl,
      scope: GOOGLE.scope,
    },
  }
}
