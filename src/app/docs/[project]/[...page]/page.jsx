import { notFound } from 'next/navigation'
import DocsPage from '@/views/void/DocsPage'
import { getAllDocParams, getDocPage } from '@/lib/content'

export async function generateStaticParams() {
  return getAllDocParams()
}

export async function generateMetadata({ params }) {
  const { project, page } = await params
  const data = await getDocPage(project, page.join('/'))
  if (!data) return { title: 'Page not found' }

  return {
    title: `${data.page.title} — ${data.set.name}`,
    description: data.page.summary,
    alternates: { canonical: `/docs/${project}/${page.join('/')}` },
  }
}

export default async function Page({ params }) {
  const { project, page } = await params
  const data = await getDocPage(project, page.join('/'))
  if (!data) notFound()

  return <DocsPage data={data} />
}

export const dynamicParams = false
