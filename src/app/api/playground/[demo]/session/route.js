import { NextResponse } from 'next/server'
import { serviceFetch, sessionToken } from '@/lib/auth'

/**
 * Demo instances.
 *
 * A thin proxy: the browser has a cookie, the service wants a bearer token,
 * and this is the only place that translates one into the other. The service
 * re-checks ownership and expiry on every call — this handler is a convenience,
 * not a security boundary.
 */
export const dynamic = 'force-dynamic'

async function proxy(path, { method, body }) {
  const token = await sessionToken()
  if (!token) return NextResponse.json({ error: 'Sign in to start a demo instance' }, { status: 401 })

  const { ok, status, payload } = await serviceFetch(path, { token, method, body })
  return NextResponse.json(ok ? payload : { error: payload?.error ?? 'That did not work' }, { status: status || 502 })
}

export async function POST(request, { params }) {
  const { demo } = await params
  return proxy(`/playground/${encodeURIComponent(demo)}/session`, { method: 'POST', body: {} })
}

export async function DELETE(request, { params }) {
  await params
  const id = new URL(request.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Which instance?' }, { status: 400 })
  return proxy(`/playground/sessions/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
