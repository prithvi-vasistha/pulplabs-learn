import { getSearchIndex } from '@/lib/content'

/**
 * The search corpus as one static JSON file.
 *
 * The command palette needs the whole index to rank against, but embedding it
 * in every page payload would tax every visit to pay for a feature most visits
 * do not use. Generated at build time and fetched once, on first open.
 */
export const dynamic = 'force-static'

export async function GET() {
  const index = await getSearchIndex()

  return Response.json(index, {
    headers: { 'cache-control': 'public, max-age=0, must-revalidate' },
  })
}
