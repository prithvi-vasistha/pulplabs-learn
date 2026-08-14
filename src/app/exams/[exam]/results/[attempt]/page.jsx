import { notFound } from 'next/navigation'
import Nav from '@/components/void/Nav'
import Footer from '@/components/void/Footer'
import NextPage from '@/components/void/NextPage'
import ExamResults from '@/components/learn/ExamResults'
import { getExam } from '@/lib/content'

export async function generateMetadata({ params }) {
  const { exam: slug } = await params
  const exam = await getExam(slug)

  return {
    title: exam ? `${exam.title} — results` : 'Results',
    robots: { index: false, follow: false },
  }
}

export default async function Page({ params }) {
  const { exam: slug, attempt } = await params
  const exam = await getExam(slug)
  if (!exam) notFound()

  return (
    <div className="grain">
      <Nav />

      <main id="main">
        <ExamResults
          examSlug={exam.slug}
          examTitle={exam.title}
          attemptId={attempt}
          relatedPaths={exam.relatedPaths}
        />

        <NextPage href="/dashboard" title="Your dashboard" label="Track it" />
      </main>

      <Footer />
    </div>
  )
}
