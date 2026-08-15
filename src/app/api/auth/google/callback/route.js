import { OAUTH_COOKIE, clientIp, redirectTo, requestOrigin, safeNext, serviceFetch, sessionCookie } from '@/lib/auth'

/**
 * Return from Google.
 *
 * Everything here is a check before anything is trusted: the browser must
 * present the same `state` we minted, the code is exchanged by the service
 * (which holds the client secret), and the verifier proves the exchange is
 * being done by whoever started the flow.
 *
 * Failures redirect to /login with a reason rather than rendering an error
 * page. Somebody who cannot sign in wants the form, not a stack trace.
 */
export const dynamic = 'force-dynamic'

function fail(request, reason) {
  const response = redirectTo(request, `/login?error=${reason}`)
  response.cookies.delete(OAUTH_COOKIE)
  return response
}

export async function GET(request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')

  if (url.searchParams.get('error')) return fail(request, 'google-cancelled')
  if (!code || !state) return fail(request, 'google-incomplete')

  let stored
  try {
    stored = JSON.parse(request.cookies.get(OAUTH_COOKIE)?.value ?? 'null')
  } catch {
    stored = null
  }

  if (!stored?.state) return fail(request, 'google-expired')
  if (stored.state !== state) return fail(request, 'google-state')

  const { ok, payload } = await serviceFetch('/auth/google', {
    method: 'POST',
    ip: clientIp(request),
    body: {
      code,
      codeVerifier: stored.verifier,
      // Google checks this matches the value used to get the code.
      redirectUri: stored.redirectUri || process.env.GOOGLE_REDIRECT_URI || requestOrigin(request),
    },
  })

  if (!ok || !payload?.token) {
    console.error('[auth] google callback rejected:', payload?.error)
    return fail(request, 'google-rejected')
  }

  const response = redirectTo(request, safeNext(stored.next))
  response.cookies.set(sessionCookie(request, payload.token, payload.expiresIn))
  response.cookies.delete(OAUTH_COOKIE)
  return response
}
