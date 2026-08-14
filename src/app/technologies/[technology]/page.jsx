import { notFound } from 'next/navigation'
import TechnologyDetail from '@/views/void/TechnologyDetail'
import { getTechnologies, getTechnology } from '@/lib/content'

/* Content lives in Postgres, so this route is rendered on demand: adding a
   row makes a page appear without a rebuild. Prerendering the whole catalogue
   at build time would need the database up during `next build` and would go
   stale the moment anything changed. */
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  const { technology: slug } = await params
  const tech = await getTechnology(slug)
  if (!tech) return { title: 'Technology not found' }

  return {
    title: tech.name,
    description: tech.tagline,
    alternates: { canonical: `/technologies/${tech.slug}` },
  }
}

export default async function Page({ params }) {
  const { technology: slug } = await params
  const tech = await getTechnology(slug)
  if (!tech) notFound()

  const all = await getTechnologies()
  const index = all.findIndex((t) => t.slug === slug)
  const next = [1, 2, 3].map((offset) => all[(index + offset) % all.length]).filter((t) => t.slug !== slug)

  return <TechnologyDetail tech={tech} next={next} />
}
