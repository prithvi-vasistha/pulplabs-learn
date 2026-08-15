import AppShell from '@/components/void/AppShell'
import Link from 'next/link'
import NextPage from '@/components/void/NextPage'
import Chevron from '@/components/void/Icons'
import { ExamList } from '@/components/learn/ExamProgress'
import { PageHead, SectionHead } from '@/components/learn/ui'
import { getExams } from '@/lib/content'

export default async function Exams() {
  const exams = await getExams()
  const questionCount = exams.reduce((total, exam) => total + exam.questionCount, 0)

  return (
    <AppShell>
        <PageHead
          eyebrow="Mock exams"
          plate="aperture-glow"
          title={
            <>
              Find the gaps.
              <br />
              <span className="dim">Then close them.</span>
            </>
          }
          lede="Every result breaks down by topic and links each weak area to the lesson that covers it."
          jump={[
            { href: '#papers', label: 'Papers', count: exams.length },
            { href: '#how', label: 'How grading works' },
          ]}
        />

        <section className="sec-sm" id="papers" style={{ scrollMarginTop: 'calc(var(--nav-h) + 24px)' }}>
          <div className="shell-wide">
            <SectionHead
              eyebrow={`${exams.length} exams · ${questionCount} questions`}
              title="Pick an assessment."
              action={
                <Link href="/learn" className="link">
                  Learning paths <Chevron />
                </Link>
              }
            />

            <ExamList exams={exams} />
          </div>
        </section>

        <div className="flow">
          <section className="sec" id="how" style={{ scrollMarginTop: 'calc(var(--nav-h) + 24px)' }}>
            <div className="shell">
              <SectionHead
                eyebrow="How it works"
                title={
                  <>
                    Graded on the server. <span className="dim">Explained on the way back.</span>
                  </>
                }
              />

              <ul className="grid-h grid-h-3 grid-h-sm" role="list">
                <li data-r>
                  <p className="mono">01</p>
                  <h3 className="h4">Answers stay hidden</h3>
                  <p className="body">
                    The attempt page receives questions with the correct answers and explanations stripped
                    out. They are added by the grader after you submit.
                  </p>
                </li>
                <li data-r style={{ '--rd': '65ms' }}>
                  <p className="mono">02</p>
                  <h3 className="h4">Topic-level scoring</h3>
                  <p className="body">
                    Each question carries a topic, so the result is a breakdown rather than a single figure —
                    82% overall is not the useful part.
                  </p>
                </li>
                <li data-r style={{ '--rd': '130ms' }}>
                  <p className="mono">03</p>
                  <h3 className="h4">A reading list, not advice</h3>
                  <p className="body">
                    Every topic below 80% produces a link to the specific lesson or technology page that
                    covers it. Then retake it.
                  </p>
                </li>
              </ul>
            </div>
          </section>
        </div>

        <NextPage href="/projects" title="Projects" />
      </AppShell>
  )
}
