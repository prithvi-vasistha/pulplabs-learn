import { NextResponse } from 'next/server'

/**
 * One job: catch a Google callback that lands on the site root.
 *
 * Google requires the redirect URI to match a registered value exactly, and
 * the credentials we were given register bare origins — `http://localhost:3000`
 * — rather than a callback path. So the code arrives at `/`, and this rewrites
 * it to the handler that knows what to do with it.
 *
 * Register `<origin>/api/auth/google/callback` and set GOOGLE_REDIRECT_URI to
 * it and this never fires again; the flow is identical either way.
 */
export function middleware(request) {
  const url = request.nextUrl

  const looksLikeCallback =
    url.searchParams.has('state') && (url.searchParams.has('code') || url.searchParams.has('error'))

  if (!looksLikeCallback) return NextResponse.next()

  const rewritten = url.clone()
  rewritten.pathname = '/api/auth/google/callback'
  return NextResponse.rewrite(rewritten)
}

// Only the root. Every other request skips this file entirely.
export const config = { matcher: '/' }
