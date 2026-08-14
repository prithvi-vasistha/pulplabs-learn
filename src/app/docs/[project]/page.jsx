import { notFound } from 'next/navigation'
import DocsSet from '@/views/void/DocsSet'
import { getDocSet, getDocSetSlugs } from '@/lib/content'

export async function generateStaticParams() {
  const slugs = await getDocSetSlugs()
  return slugs.map((project) => ({ project }))
}

export async function generateMetadata({ params }) {
  const { project: slug } = await params
  const set = await getDocSet(slug)
  if (!set) return { title: 'Documentation not found' }

  return {
    title: `${set.name} documentation`,
    description: set.tagline,
    alternates: { canonical: `/docs/${set.slug}` },
  }
}

export default async function Page({ params }) {
  const { project: slug } = await params
  const set = await getDocSet(slug)
  if (!set) notFound()

  return <DocsSet set={set} />
}

export const dynamicParams = false
