import { notFound } from 'next/navigation'
import FieldEntry from '@/views/void/FieldEntry'
import { getFieldEntries, getFieldEntry, getFieldSlugs, getSettings } from '@/lib/content'

/* Content lives in Postgres, so this route is rendered on demand: adding a
   row makes a page appear without a rebuild. Prerendering the whole catalogue
   at build time would need the database up during `next build` and would go
   stale the moment anything changed. */
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  const { entry: slug } = await params
  const entry = await getFieldEntry(slug)
  if (!entry) return { title: 'Not found' }

  return {
    title: entry.title,
    description: entry.summary,
    alternates: { canonical: `/field/${entry.slug}` },
  }
}

export default async function Page({ params }) {
  const { entry: slug } = await params
  const entry = await getFieldEntry(slug)
  if (!entry) notFound()

  const all = await getFieldEntries()
  const index = all.findIndex((e) => e.slug === slug)
  const next = all[(index + 1) % all.length]

  const settings = await getSettings()

  return (
    <FieldEntry
      entry={entry}
      next={next.slug === slug ? null : next}
      fieldNote={settings.fieldNote}
    />
  )
}
