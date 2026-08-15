/**
 * Every primitive the auth layer needs, and nothing else.
 *
 * All of it is `node:crypto`. A JWT library, a bcrypt binding and an
 * encryption helper would be three dependencies to serve one small service
 * that signs one kind of token — and the parts worth getting right (constant
 * time comparison, a pinned algorithm, an authenticated cipher) are decisions,
 * not code volume.
 *
 * One secret enters this module. Three keys leave it, derived with HKDF so
 * that the token signing key, the field encryption key and the blind index key
 * are independent: recovering one does not hand over the others.
 */

import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  hkdfSync,
  randomBytes,
  randomUUID,
  scrypt as scryptCallback,
  timingSafeEqual,
} from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(scryptCallback)

let keys = null

/** Derive the working keys. Called once at boot, before the server listens. */
export function initKeys(secret) {
  if (!secret || secret.length < 16) {
    throw new Error('auth secret must be at least 16 characters')
  }
  const ikm = Buffer.from(secret, 'utf8')
  const salt = Buffer.from('pulplabs.learn.auth.v1')
  const derive = (info) => Buffer.from(hkdfSync('sha256', ikm, salt, info, 32))

  keys = {
    jwt: derive('jwt-signing'),
    pii: derive('field-encryption'),
    index: derive('blind-index'),
  }
}

function requireKeys() {
  if (!keys) throw new Error('crypto keys are not initialised')
  return keys
}

export { randomUUID }

/* ------------------------------------------------------------- passwords -- */

/*
 * scrypt with the parameters from RFC 7914's interactive-login profile.
 * N=16384 costs about 16MB and ~60ms per hash on this class of machine, which
 * is the point: it is the attacker's cost multiplied by their whole dictionary.
 */
const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 64 }

export async function hashPassword(password) {
  const salt = randomBytes(16)
  const key = await scrypt(password.normalize('NFKC'), salt, SCRYPT.keylen, {
    N: SCRYPT.N,
    r: SCRYPT.r,
    p: SCRYPT.p,
  })
  // Self-describing, so the cost parameters can be raised later without
  // invalidating the hashes already stored.
  return ['scrypt', SCRYPT.N, SCRYPT.r, SCRYPT.p, salt.toString('base64'), key.toString('base64')].join('$')
}

export async function verifyPassword(password, stored) {
  if (typeof stored !== 'string') return false
  const [scheme, N, r, p, saltB64, hashB64] = stored.split('$')
  if (scheme !== 'scrypt') return false

  try {
    const salt = Buffer.from(saltB64, 'base64')
    const expected = Buffer.from(hashB64, 'base64')
    const actual = await scrypt(password.normalize('NFKC'), salt, expected.length, {
      N: Number(N),
      r: Number(r),
      p: Number(p),
    })
    return timingSafeEqual(actual, expected)
  } catch {
    return false
  }
}

/* ------------------------------------------------------ field encryption -- */

/**
 * AES-256-GCM. The tag is stored with the ciphertext, so a tampered value
 * fails to decrypt rather than decrypting to something an attacker chose.
 */
export function seal(plaintext) {
  if (plaintext == null) return null
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', requireKeys().pii, iv)
  const body = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()])
  return ['v1', iv.toString('base64url'), cipher.getAuthTag().toString('base64url'), body.toString('base64url')].join('.')
}

export function unseal(blob) {
  if (!blob) return null
  const [version, ivB64, tagB64, bodyB64] = String(blob).split('.')
  if (version !== 'v1') return null

  try {
    const decipher = createDecipheriv('aes-256-gcm', requireKeys().pii, Buffer.from(ivB64, 'base64url'))
    decipher.setAuthTag(Buffer.from(tagB64, 'base64url'))
    return Buffer.concat([decipher.update(Buffer.from(bodyB64, 'base64url')), decipher.final()]).toString('utf8')
  } catch {
    // Wrong key, or the row was altered. Both are "this value is unreadable".
    return null
  }
}

/**
 * A deterministic, keyed digest — the only way to find a row by email when the
 * email itself is ciphertext. Keyed rather than plain SHA-256, so a stolen
 * table cannot be attacked with a list of addresses.
 */
export function blindIndex(value) {
  return createHmac('sha256', requireKeys().index).update(String(value).trim().toLowerCase()).digest('base64url')
}

/* ------------------------------------------------------------------ jwt --- */

const b64url = (buffer) => Buffer.from(buffer).toString('base64url')
const HEADER = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))

function sign(data) {
  return createHmac('sha256', requireKeys().jwt).update(data).digest()
}

export function signToken(claims, { ttlSeconds = 7 * 24 * 60 * 60 } = {}) {
  const now = Math.floor(Date.now() / 1000)
  const payload = b64url(JSON.stringify({ ...claims, iat: now, exp: now + ttlSeconds }))
  const data = `${HEADER}.${payload}`
  return `${data}.${b64url(sign(data))}`
}

/**
 * Returns the claims, or null. Never throws, and never trusts the header:
 * the algorithm is pinned here rather than read from the token, which is the
 * bug behind most JWT verification failures worth a CVE.
 */
export function verifyToken(token) {
  if (typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length !== 3) return null

  const [header, payload, signature] = parts
  if (header !== HEADER) return null

  const expected = sign(`${header}.${payload}`)
  const actual = Buffer.from(signature, 'base64url')
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null

  try {
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    const now = Math.floor(Date.now() / 1000)
    if (typeof claims.exp !== 'number' || claims.exp <= now) return null
    if (typeof claims.iat === 'number' && claims.iat > now + 60) return null
    return claims
  } catch {
    return null
  }
}

/* ------------------------------------------------------------ throwaway --- */

export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString('base64url')
}
