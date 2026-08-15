import { createHash, randomBytes } from 'node:crypto'
import { NextResponse } from 'next/server'
import { OAUTH_COOKIE, isSecureRequest, redirectTo, requestOrigin, safeNext, serviceFetch } from '@/lib/auth'

/**
 * Begin Google sign-in.
 *
 * Two secrets are minted here and both stay on this side of the browser:
 *
 *  - `state`, echoed back by Google and compared on return. Without it, an
 *    attacker can hand a victim a link that logs them into the attacker's
 *    account — CSRF, but the wrong way round.
 *  - a PKCE verifier, of which only the SHA-256 hash is sent. An authorization
 *    code stolen from the redirect is then useless without the verifier, which
 *    never left this server's cookie.
 *
 * The client id and secret live in the content service; this route asks it
 * whether Google is configured rather than reading the credentials itself.
 */
export const dynamic = 'force-dynamic'

const b64url = (buffer) => Buffer.from(buffer).toString('base64url')

export async function GET(request) {
  const url = new URL(request.url)
  const next = safeNext(url.searchParams.get('next'))

  const { ok, payload } = await serviceFetch('/auth/providers')
  const google = ok ? payload?.google : null

  if (!google?.enabled) {
    return redirectTo(request, '/login?error=google-unavailable')
  }

  const state = b64url(randomBytes(16))
  const verifier = b64url(randomBytes(32))
  const challenge = b64url(createHash('sha256').update(verifier).digest())

  // Registered redirect URIs must match exactly. The default is this origin,
  // which is what the client is registered with; set GOOGLE_REDIRECT_URI to
  // use a dedicated callback path once one is registered.
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || requestOrigin(request)

  const authorize = new URL(google.authorizeUrl)
  authorize.search = new URLSearchParams({
    client_id: google.clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: google.scope,
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    // Ask every time rather than silently reusing whichever account the
    // browser happens to be signed into.
    prompt: 'select_account',
  }).toString()

  const response = NextResponse.redirect(authorize.toString(), 303)
  response.cookies.set({
    name: OAUTH_COOKIE,
    value: JSON.stringify({ state, verifier, next, redirectUri }),
    httpOnly: true,
    sameSite: 'lax', // The return trip is a top-level GET, which lax allows.
    secure: isSecureRequest(request),
    path: '/',
    maxAge: 600,
  })
  return response
}
