import { notFound } from 'next/navigation'
import Nav from '@/components/void/Nav'
import ExamRunner from '@/components/learn/ExamRunner'
import { getCandidateExam } from '@/lib/content'

/* Content lives in Postgres, so this route is rendered on demand. */
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  const { exam: slug } = await params
  const exam = await getCandidateExam(slug)
  return {
    title: exam ? `${exam.title} — attempt` : 'Exam not found',
    robots: { index: false, follow: false },
  }
}

export default async function Page({ params }) {
  const { exam: slug } = await params

  /* The candidate view, from the service. `correct` and `explanation` are not
     selected by that query, so the answer key is never in this process — it
     cannot be leaked by a serialisation mistake, and there is no version of
     this page that could accidentally render it. */
  const exam = await getCandidateExam(slug)
  if (!exam) notFound()

  return (
    <div className="grain">
      <Nav />
      <main id="main">
        <h1 className="sr-only">{exam.title} — attempt in progress</h1>
        <ExamRunner exam={exam} />
      </main>
    </div>
  )
}
