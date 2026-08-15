import { NextResponse } from 'next/server'
import { clientIp, serviceFetch, sessionCookie } from '@/lib/auth'

/** Create an account, and sign in with it in the same round trip. */
export const dynamic = 'force-dynamic'

export async function POST(request) {
  const body = await request.json().catch(() => ({}))

  const { ok, status, payload } = await serviceFetch('/auth/register', {
    method: 'POST',
    ip: clientIp(request),
    body: { email: body.email, name: body.name, password: body.password },
  })

  if (!ok) {
    return NextResponse.json({ error: payload?.error ?? 'Could not create the account' }, { status: status || 502 })
  }

  const response = NextResponse.json({ user: payload.user })
  response.cookies.set(sessionCookie(request, payload.token, payload.expiresIn))
  return response
}
