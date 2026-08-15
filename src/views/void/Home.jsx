import AppShell from '@/components/void/AppShell'
import Link from 'next/link'
import Cover from '@/components/void/Cover'
import Chevron from '@/components/void/Icons'
import ContinueLearning from '@/components/learn/ContinueLearning'
import CourseCard, { AUDIENCE, PathCourseCard } from '@/components/learn/CourseCard'
import { SectionHead } from '@/components/learn/ui'
import {
  getExams,
  getFieldEntries,
  getPaths,
  getProgressCatalogue,
  getProjects,
  getSettings,
  getTechnologies,
} from '@/lib/content'
import { formatCount, formatMinutes, levelRank } from '@/lib/format'

/**
 * The academy itself, not a page about it.
 *
 * There is no marketing landing page any more, and the band above the courses
 * is deliberately short: the certifications are the product, so they are on
 * the first screen rather than below a page of introduction.
 */
export default async function Home() {
  const [paths, catalogue, exams, projects, field, technologies, settings] = await Promise.all([
    getPaths(),
    getProgressCatalogue(),
    getExams(),
    getProjects(),
    getFieldEntries(),
    getTechnologies(),
    getSettings(),
  ])

  const totalLessons = paths.reduce((t, p) => t + p.lessonCount, 0)
  const totalMinutes = paths.reduce((t, p) => t + p.minutes, 0)
  const sorted = [...paths].sort((a, b) => levelRank(a.level) - levelRank(b.level))

  return (
    <AppShell>
        {/* ── A portal masthead, not a pitch ───────────────────────────────
            No hero, no call to action, no headline selling a transformation.
            A reader arriving here is usually somebody we already work with,
            so the first screen says what this is and gets out of the way. */}
        <section className="pmast">
          <div>
            <p className="mono">PulpLabs Learn</p>
            <h1 className="pmast-h">Enablement portal</h1>
            <p className="pmast-l">
              The material we use to bring teams up to speed on the systems we build for them —
              {' '}{paths.length} courses, {totalLessons} lessons and {exams.length} papers, plus the
              projects we ship in the open and the engagements they came out of.
            </p>
          </div>

          <dl className="pmast-facts">
            <div>
              <dt className="mono">Courses</dt>
              <dd className="tnum">{paths.length}</dd>
            </div>
            <div>
              <dt className="mono">Lessons</dt>
              <dd className="tnum">{totalLessons}</dd>
            </div>
            <div>
              <dt className="mono">Papers</dt>
              <dd className="tnum">{exams.length}</dd>
            </div>
            <div>
              <dt className="mono">Reading time</dt>
              <dd className="tnum">{formatMinutes(totalMinutes)}</dd>
            </div>
          </dl>
        </section>

        <ContinueLearning catalogue={catalogue} />

        {/* ── Certifications, above the fold ──────────────────────────────── */}
        <section
          className="sec-sm ac-first"
          id="courses"
          style={{ scrollMarginTop: 'calc(var(--nav-h) + 24px)' }}
        >
          <div className="shell-wide">
            <div className="ac-bar">
              <h2 className="d3">Courses</h2>
              <span className="mono tnum">
                {paths.length} courses · {formatMinutes(totalMinutes)}
              </span>
              <Link href="/learn" className="link">
                All courses <Chevron />
              </Link>
            </div>

            <ul className="cc-grid" role="list">
              {sorted.map((path, i) => (
                <PathCourseCard key={path.slug} path={path} index={i} />
              ))}
            </ul>

            <p className="note" style={{ marginTop: 26 }}>
              {settings.disclosure}
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
      </AppShell>
  )
}
