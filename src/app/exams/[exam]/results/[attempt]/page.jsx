import { notFound } from 'next/navigation'
import Nav from '@/components/void/Nav'
import Footer from '@/components/void/Footer'
import NextPage from '@/components/void/NextPage'
import ExamResults from '@/components/learn/ExamResults'
import { getExam } from '@/lib/content'

/* Content lives in Postgres, so this route is rendered on demand: adding a
   row makes a page appear without a rebuild. Prerendering the whole catalogue
   at build time would need the database up during `next build` and would go
   stale the moment anything changed. */
export const dynamic = 'force-dynamic'

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

        <NextPage href="/profile" title="Your profile" label="Track it" />
      </main>

      <Footer />
    </div>
  )
}
