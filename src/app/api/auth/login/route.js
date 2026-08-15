import { NextResponse } from 'next/server'
import { clientIp, serviceFetch, sessionCookie } from '@/lib/auth'

/**
 * Sign in.
 *
 * The password reaches this handler and goes straight back out to the service
 * over the internal network; nothing about it is stored, logged or held. What
 * comes back is a token, and the only place it lands is an httpOnly cookie the
 * browser cannot read.
 */
export const dynamic = 'force-dynamic'

export async function POST(request) {
  const body = await request.json().catch(() => ({}))

  const { ok, status, payload } = await serviceFetch('/auth/login', {
    method: 'POST',
    ip: clientIp(request),
    body: { email: body.email, password: body.password },
  })

  if (!ok) {
    return NextResponse.json({ error: payload?.error ?? 'Could not sign you in' }, { status: status || 502 })
  }

  const response = NextResponse.json({ user: payload.user })
  response.cookies.set(sessionCookie(request, payload.token, payload.expiresIn))
  return response
}
