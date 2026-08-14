import { notFound } from 'next/navigation'
import DocsPage from '@/views/void/DocsPage'
import { getAllDocParams, getDocPage } from '@/lib/content'

/* Content lives in Postgres, so this route is rendered on demand: adding a
   row makes a page appear without a rebuild. Prerendering the whole catalogue
   at build time would need the database up during `next build` and would go
   stale the moment anything changed. */
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  const { project, page } = await params
  const data = await getDocPage(project, page.join('/'))
  if (!data) return { title: 'Page not found' }

  return {
    title: `${data.page.title} — ${data.set.name}`,
    description: data.page.summary,
    alternates: { canonical: `/projects/${project}/${page.join('/')}` },
  }
}

export default async function Page({ params }) {
  const { project, page } = await params
  const data = await getDocPage(project, page.join('/'))
  if (!data) notFound()

  return <DocsPage data={data} />
}
