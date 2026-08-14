import { notFound } from 'next/navigation'
import FieldEntry from '@/views/void/FieldEntry'
import { getFieldEntries, getFieldEntry, getFieldSlugs } from '@/lib/content'

export async function generateStaticParams() {
  const slugs = await getFieldSlugs()
  return slugs.map((entry) => ({ entry }))
}

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

  return <FieldEntry entry={entry} next={next.slug === slug ? null : next} />
}

export const dynamicParams = false
