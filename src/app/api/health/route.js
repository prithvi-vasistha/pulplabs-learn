/**
 * Liveness and readiness for the UI.
 *
 * Deliberately answers without touching the content service or the database:
 * a probe every ten seconds should not render the front page, and "can this
 * process serve a request" is a different question from "is Postgres up".
 * The service has its own /health for that.
 */
export const dynamic = 'force-dynamic'

export function GET() {
  return Response.json({ ok: true }, { headers: { 'cache-control': 'no-store' } })
}
