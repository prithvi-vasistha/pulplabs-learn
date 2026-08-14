import Link from 'next/link'
import Nav from '@/components/void/Nav'
import Footer from '@/components/void/Footer'
import Cover from '@/components/void/Cover'
import Chevron from '@/components/void/Icons'
import DailyQuestion from '@/components/learn/DailyQuestion'
import ContinueLearning from '@/components/learn/ContinueLearning'
import CourseCard, { AUDIENCE, PathCourseCard } from '@/components/learn/CourseCard'
import { SectionHead } from '@/components/learn/ui'
import {
  disclosure,
  getDailyQuestion,
  getExams,
  getFieldEntries,
  getPaths,
  getProgressCatalogue,
  getProjects,
  getTechnologies,
} from '@/lib/content'
import { dayKey } from '@/lib/daily'
import { formatCount, formatMinutes, levelRank } from '@/lib/format'

/**
 * The academy itself, not a page about it.
 *
 * There is no marketing landing page any more. Someone arriving here should be
 * one click from starting something and zero clicks from *doing* something,
 * which is what the daily question is for: a catalogue earns one visit, a
 * question a day earns the habit.
 */
export default async function Home() {
  const key = dayKey()
  const [question, paths, catalogue, exams, projects, field, technologies] = await Promise.all([
    getDailyQuestion(key),
    getPaths(),
    getProgressCatalogue(),
    getExams(),
    getProjects(),
    getFieldEntries(),
    getTechnologies(),
  ])

  const totalLessons = paths.reduce((t, p) => t + p.lessonCount, 0)
  const totalMinutes = paths.reduce((t, p) => t + p.minutes, 0)
  const sorted = [...paths].sort((a, b) => levelRank(a.level) - levelRank(b.level))

  return (
    <div className="grain">
      <Nav />

      <main id="main">
        {/* ── A band, not a hero. Say what this is, then get out of the way ── */}
        <section className="ac-head">
          <div className="ac-head-cv" aria-hidden="true">
            <Cover seed="pulplabs-learn-home" ratio="auto" />
          </div>

          <div className="shell-wide ac-head-in">
            <div>
              <p className="mono">PulpLabs Learn</p>
              <h1 className="ac-h">
                Learn the AI stack <span className="dim">by being tested on it.</span>
              </h1>
              <p className="lede ac-l">
                {paths.length} courses, {totalLessons} lessons and {exams.length} mock papers — every
                result broken down by topic and pointed back at the lesson behind the gap.
              </p>
              <div className="btn-row" style={{ marginTop: 26 }}>
                <Link href="/learn" className="btn">
                  Browse courses <Chevron />
                </Link>
                <Link href="/practice" className="btn btn-ghost">
                  Today’s question
                </Link>
              </div>
            </div>

            {/* The hook is on the first screen, unasked. */}
            <div className="ac-daily">
              <DailyQuestion question={question} dayKey={key} compact />
            </div>
          </div>
        </section>

        <ContinueLearning catalogue={catalogue} />

        {/* ── Courses ────────────────────────────────────────────────────── */}
        <section className="sec-sm" id="courses" style={{ scrollMarginTop: 'calc(var(--nav-h) + 24px)' }}>
          <div className="shell-wide">
            <SectionHead
              eyebrow={`${paths.length} courses · ${formatMinutes(totalMinutes)}`}
              title="Build practical AI skills."
              lede="Each course is a sequence with an exam behind it, not a playlist."
              action={
                <Link href="/learn" className="link">
                  All courses <Chevron />
                </Link>
              }
            />

            <ul className="cc-grid" role="list">
              {sorted.map((path, i) => (
                <PathCourseCard key={path.slug} path={path} index={i} />
              ))}
            </ul>

            <p className="note" style={{ marginTop: 28 }}>
              {disclosure}
            </p>
          </div>
        </section>

        <div className="flow">
          {/* ── Practice ─────────────────────────────────────────────────── */}
          <section className="sec">
            <div className="shell-wide">
              <SectionHead
                eyebrow={`${exams.length} papers`}
                title={
                  <>
                    Prove it, <span className="dim">then read what you missed.</span>
                  </>
                }
                action={
                  <Link href="/practice" className="link">
                    All papers <Chevron />
                  </Link>
                }
              />

              <ul className="cc-grid" role="list">
                {exams.slice(0, 3).map((exam, i) => (
                  <CourseCard
                    key={exam.slug}
                    href={`/exams/${exam.slug}`}
                    seed={`exam-${exam.slug}`}
                    audience={AUDIENCE[exam.level]}
                    title={exam.title}
                    summary={exam.summary}
                    meta={`${formatCount(exam.questionCount, 'question')} · ${exam.minutes} min`}
                    level={exam.level}
                    index={i}
                  />
                ))}
              </ul>
            </div>
          </section>

          {/* ── Subjects ─────────────────────────────────────────────────── */}
          <section className="sec">
            <div className="shell-wide">
              <SectionHead
                eyebrow={`${technologies.length} subjects`}
                title="Or start from a subject."
                lede="Every subject page gathers each lesson, exam, project, guide and case study that touches it. The number is how many pieces that is."
                action={
                  <Link href="/technologies" className="link">
                    All subjects <Chevron />
                  </Link>
                }
              />

              <ul className="chip-grid" role="list">
                {technologies.map((tech) => (
                  <li key={tech.slug}>
                    <Link href={`/technologies/${tech.slug}`}>
                      {tech.name}
                      <span className="tnum">{tech.materialCount}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* ── Projects and Field ───────────────────────────────────────── */}
          <section className="sec">
            <div className="shell-wide">
              <SectionHead
                eyebrow="Beyond the courses"
                title={
                  <>
                    What we ship, <span className="dim">and what it was like.</span>
                  </>
                }
              />

              <ul className="cc-grid" role="list">
                {projects.slice(0, 2).map((project, i) => (
                  <CourseCard
                    key={project.slug}
                    href={`/projects/${project.slug}`}
                    seed={`project-${project.slug}`}
                    audience={`${project.category} · ${project.status}`}
                    title={project.name}
                    summary={project.tagline}
                    meta={
                      project.docPageCount > 0
                        ? formatCount(project.docPageCount, 'doc page')
                        : 'Repository only'
                    }
                    index={i}
                  />
                ))}
                {field.slice(0, 1).map((entry) => (
                  <CourseCard
                    key={entry.slug}
                    href={`/field/${entry.slug}`}
                    seed={`field-${entry.slug}`}
                    audience={`${entry.kind}${entry.client ? ` · ${entry.client}` : ''}`}
                    title={entry.title}
                    summary={entry.summary}
                    meta={`${entry.minutes} min read`}
                    index={2}
                  />
                ))}
              </ul>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
