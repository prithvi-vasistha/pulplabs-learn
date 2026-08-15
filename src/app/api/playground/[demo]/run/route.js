import { NextResponse } from 'next/server'
import { serviceFetch, sessionToken } from '@/lib/auth'

/** Run one demo. The engine, the corpus and the answer keys stay in the service. */
export const dynamic = 'force-dynamic'

export async function POST(request, { params }) {
  const { demo } = await params
  const token = await sessionToken()
  if (!token) return NextResponse.json({ error: 'Sign in to run this demo' }, { status: 401 })

  const body = await request.json().catch(() => ({}))

  const { ok, status, payload } = await serviceFetch(`/playground/${encodeURIComponent(demo)}/run`, {
    token,
    method: 'POST',
    body: { sessionId: body.sessionId, input: body.input ?? {} },
  })

  return NextResponse.json(ok ? payload : { error: payload?.error ?? 'The run failed' }, { status: status || 502 })
}
