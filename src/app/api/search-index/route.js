import { getSearchIndex } from '@/lib/content'

/**
 * The search corpus, proxied from the content service.
 *
 * The command palette needs the whole index to rank against, but embedding it
 * in every page payload would tax every visit to pay for a feature most visits
 * do not use. Fetched once, on first open, and built from the database — so a
 * new lesson is searchable as soon as it is seeded.
 */
export const dynamic = 'force-dynamic'

export async function GET() {
  const index = await getSearchIndex()

  return Response.json(index, {
    headers: { 'cache-control': 'public, max-age=0, must-revalidate' },
  })
}
