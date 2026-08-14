import { notFound } from 'next/navigation'
import LessonReader from '@/views/void/LessonReader'
import { getAllLessonParams, getLesson } from '@/lib/content'

/* Content lives in Postgres, so this route is rendered on demand: adding a
   row makes a page appear without a rebuild. Prerendering the whole catalogue
   at build time would need the database up during `next build` and would go
   stale the moment anything changed. */
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  const { path, lesson } = await params
  const data = await getLesson(path, lesson)
  if (!data) return { title: 'Lesson not found' }

  return {
    title: `${data.lesson.title} — ${data.path.title}`,
    description: data.lesson.summary,
    alternates: { canonical: `/learn/${path}/${lesson}` },
  }
}

export default async function Page({ params }) {
  const { path, lesson } = await params
  const data = await getLesson(path, lesson)
  if (!data) notFound()

  return <LessonReader data={data} />
}
