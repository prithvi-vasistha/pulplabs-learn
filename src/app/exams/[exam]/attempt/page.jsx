import { notFound } from 'next/navigation'
import Nav from '@/components/void/Nav'
import ExamRunner from '@/components/learn/ExamRunner'
import { examBySlug } from '@/data/exams'
import { toCandidateExam } from '@/lib/exam-engine'
import { getExamSlugs } from '@/lib/content'

export async function generateStaticParams() {
  const slugs = await getExamSlugs()
  return slugs.map((exam) => ({ exam }))
}

export async function generateMetadata({ params }) {
  const { exam: slug } = await params
  const exam = examBySlug[slug]
  return {
    title: exam ? `${exam.title} — attempt` : 'Exam not found',
    robots: { index: false, follow: false },
  }
}

export default async function Page({ params }) {
  const { exam: slug } = await params
  const exam = examBySlug[slug]
  if (!exam) notFound()

  // Correct answers and explanations are removed here, on the server. What the
  // browser receives cannot be inspected for the answer key.
  const candidate = toCandidateExam(exam)

  return (
    <div className="grain">
      <Nav />
      <main id="main">
        <h1 className="sr-only">{exam.title} — attempt in progress</h1>
        <ExamRunner exam={candidate} />
      </main>
    </div>
  )
}
