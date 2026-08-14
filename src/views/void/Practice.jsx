import Link from 'next/link'
import Nav from '@/components/void/Nav'
import Footer from '@/components/void/Footer'
import NextPage from '@/components/void/NextPage'
import Cover from '@/components/void/Cover'
import Chevron from '@/components/void/Icons'
import DailyQuestion from '@/components/learn/DailyQuestion'
import CourseCard, { AUDIENCE } from '@/components/learn/CourseCard'
import { PageHead, SectionHead } from '@/components/learn/ui'
import { getDailyQuestion, getExamFamilies, getExams } from '@/lib/content'
import { dayKey } from '@/lib/daily'
import { formatCount } from '@/lib/format'

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export default async function Practice() {
  const key = dayKey()
  const [question, exams, families] = await Promise.all([
    getDailyQuestion(key),
    getExams(),
    getExamFamilies(),
  ])
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
            ...families.map((f) => ({
              href: `#${slugify(f.name)}`,
              label: f.name,
              count: f.exams.length,
            })),
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
                lede="Grouped by what they prepare you for, so you are choosing a subject rather than a filename."
                action={
                  <Link href="/learn" className="link">
                    Courses <Chevron />
                  </Link>
                }
              />

              {/* One block per family. A reader picking a paper is choosing a
                  certification track, not browsing an undifferentiated list. */}
              {families.map((family) => (
                <section
                  key={family.name}
                  className="fam"
                  id={slugify(family.name)}
                  aria-labelledby={`${slugify(family.name)}-h`}
                >
                  <header className="fam-h">
                    <div>
                      <h3 className="d3" id={`${slugify(family.name)}-h`}>
                        {family.name}
                      </h3>
                      <p className="body">{family.blurb}</p>
                    </div>
                    <span className="mono tnum">
                      {family.exams.length} {family.exams.length === 1 ? 'paper' : 'papers'}
                    </span>
                  </header>

                  <ul className="cc-grid" role="list">
                    {family.exams.map((exam, i) => (
                      <CourseCard
                        key={exam.slug}
                        href={`/exams/${exam.slug}`}
                        seed={`exam-${exam.slug}`}
                        audience={AUDIENCE[exam.level]}
                        title={exam.title.replace(' — Mock Exam', '')}
                        summary={exam.summary}
                        meta={`${formatCount(exam.questionCount, 'question')} · ${exam.minutes} min · pass ${exam.passing}%`}
                        level={exam.level}
                        index={i}
                      />
                    ))}
                  </ul>
                </section>
              ))}
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
