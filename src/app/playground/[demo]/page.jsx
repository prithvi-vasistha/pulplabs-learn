import { notFound } from 'next/navigation'
import PlaygroundDemo from '@/views/void/PlaygroundDemo'
import { getPlaygroundDemo } from '@/lib/content'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  const { demo: slug } = await params
  const demo = await getPlaygroundDemo(slug)
  if (!demo) return {}

  return {
    title: demo.title,
    description: demo.summary,
    alternates: { canonical: `/playground/${demo.slug}` },
  }
}

export default async function Page({ params }) {
  const { demo: slug } = await params
  const demo = await getPlaygroundDemo(slug)
  if (!demo) notFound()

  return <PlaygroundDemo demo={demo} />
}
