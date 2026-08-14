import { notFound } from 'next/navigation'
import ExamDetail from '@/views/void/ExamDetail'
import { getExam, getExamSlugs } from '@/lib/content'

export async function generateStaticParams() {
  const slugs = await getExamSlugs()
  return slugs.map((exam) => ({ exam }))
}

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
