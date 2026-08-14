import Link from 'next/link'
import Nav from '@/components/void/Nav'
import Footer from '@/components/void/Footer'
import NextPage from '@/components/void/NextPage'
import Cover from '@/components/void/Cover'
import Chevron from '@/components/void/Icons'
import DailyQuestion from '@/components/learn/DailyQuestion'
import { ExamList } from '@/components/learn/ExamProgress'
import { PageHead, SectionHead } from '@/components/learn/ui'
import { getDailyQuestion, getExams } from '@/lib/content'
import { dayKey } from '@/lib/daily'

export default async function Practice() {
  const key = dayKey()
  const [question, exams] = await Promise.all([getDailyQuestion(key), getExams()])
  const questionCount = exams.reduce((total, exam) => total + exam.questionCount, 0)

  return (
    <div className="grain">
      <Nav />

      <main id="main">
        <PageHead
          eyebrow="Practice"
          plate="aperture-glow"
          title={
            <>
              Find the gaps. <span className="dim">Then close them.</span>
            </>
          }
          lede="One question a day, and full mock papers whenever you want them. Both report by topic and point at the lesson behind the gap."
          jump={[
            { href: '#daily', label: 'Today' },
            { href: '#papers', label: 'Mock papers', count: exams.length },
            { href: '#how', label: 'How grading works' },
          ]}
        />

        <section className="sec-sm" id="daily" style={{ scrollMarginTop: 'calc(var(--nav-h) + 24px)' }}>
          <div className="shell">
            <div className="daily-wrap" data-r>
              <Cover seed={`daily-${key}`} className="daily-cv" ratio="auto" />
              <DailyQuestion question={question} dayKey={key} />
            </div>

            {question && (
              <p className="note" style={{ marginTop: 20 }}>
                Drawn from the {question.poolSize} questions in our mock papers. Everyone gets the same
                question on the same day, and the streak is kept in this browser — there is no account.
              </p>
            )}
          </div>
        </section>

        <div className="flow">
          <section className="sec" id="papers" style={{ scrollMarginTop: 'calc(var(--nav-h) + 24px)' }}>
            <div className="shell-wide">
              <SectionHead
                eyebrow={`${exams.length} papers · ${questionCount} questions`}
                title="Sit a full paper."
                action={
                  <Link href="/learn" className="link">
                    Courses <Chevron />
                  </Link>
                }
              />

              <ExamList exams={exams} />
            </div>
          </section>

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
                    The page receives questions with the correct answers and explanations stripped out.
                    They are added by the grader after you submit.
                  </p>
                </li>
                <li data-r style={{ '--rd': '65ms' }}>
                  <p className="mono">02</p>
                  <h3 className="h4">Topic-level scoring</h3>
                  <p className="body">
                    Each question carries a topic, so the result is a breakdown rather than a single
                    figure — 82% overall is not the useful part.
                  </p>
                </li>
                <li data-r style={{ '--rd': '130ms' }}>
                  <p className="mono">03</p>
                  <h3 className="h4">A reading list, not advice</h3>
                  <p className="body">
                    Every topic below 80% produces a link to the specific lesson that covers it. Then
                    retake it.
                  </p>
                </li>
              </ul>
            </div>
          </section>
        </div>

        <NextPage href="/learn" title="Courses" />
      </main>

      <Footer />
    </div>
  )
}
