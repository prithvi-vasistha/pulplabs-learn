import { NextResponse } from 'next/server'
import { clearedSessionCookie, redirectTo, safeNext } from '@/lib/auth'

/**
 * Sign out.
 *
 * Clearing the cookie is the whole of it. The token stays technically valid
 * until it expires — that is the trade a stateless token makes — but it exists
 * nowhere except the cookie we just deleted.
 */
export const dynamic = 'force-dynamic'

export async function POST(request) {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(clearedSessionCookie(request))
  return response
}

/** Also reachable as a plain link, for anywhere without JavaScript. */
export async function GET(request) {
  const next = safeNext(new URL(request.url).searchParams.get('next'), '/')
  const response = redirectTo(request, next)
  response.cookies.set(clearedSessionCookie(request))
  return response
}
