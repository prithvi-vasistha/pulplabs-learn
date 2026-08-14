import { notFound } from 'next/navigation'
import LessonReader from '@/views/void/LessonReader'
import { getAllLessonParams, getLesson } from '@/lib/content'

export async function generateStaticParams() {
  return getAllLessonParams()
}

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

export const dynamicParams = false
