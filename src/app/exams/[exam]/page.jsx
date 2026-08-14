import { notFound } from 'next/navigation'
import ExamDetail from '@/views/void/ExamDetail'
import { getExam, getExamSlugs } from '@/lib/content'

/* Content lives in Postgres, so this route is rendered on demand: adding a
   row makes a page appear without a rebuild. Prerendering the whole catalogue
   at build time would need the database up during `next build` and would go
   stale the moment anything changed. */
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  const { exam: slug } = await params
  const exam = await getExam(slug)
  if (!exam) return { title: 'Exam not found' }

  return {
    title: exam.title,
    description: exam.summary,
    alternates: { canonical: `/exams/${exam.slug}` },
  }
}

export default async function Page({ params }) {
  const { exam: slug } = await params
  const exam = await getExam(slug)
  if (!exam) notFound()

  return <ExamDetail exam={exam} />
}
