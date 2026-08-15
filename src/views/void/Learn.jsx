import AppShell from '@/components/void/AppShell'
import Link from 'next/link'
import NextPage from '@/components/void/NextPage'
import Chevron from '@/components/void/Icons'
import Cover from '@/components/void/Cover'
import CourseCatalogue from '@/components/learn/CourseCatalogue'
import { TechCell } from '@/components/learn/cards'
import { PageHead, SectionHead } from '@/components/learn/ui'
import { getExams, getPaths, getProgressCatalogue, getSettings, getTechnologies } from '@/lib/content'
import { formatCount, formatMinutes } from '@/lib/format'

export default async function Learn() {
  const [paths, catalogue, technologies, exams, settings] = await Promise.all([
    getPaths(),
    getProgressCatalogue(),
    getTechnologies(),
    getExams(),
    getSettings(),
  ])

  const totalMinutes = paths.reduce((total, path) => total + path.minutes, 0)
  const totalLessons = paths.reduce((total, path) => total + path.lessonCount, 0)
  const withoutPath = technologies.filter((tech) => tech.pathCount === 0)
  const foundations = exams.find((exam) => exam.slug === 'ai-foundations')

  return (
    <AppShell>
        <PageHead
          eyebrow="Courses"
          plate="flare-column"
          title={
            <>
              Courses. <span className="dim">In order, for a reason.</span>
            </>
          }
          lede="The material we use to bring a team up to speed. Each course is a sequence with an exam behind it — it states what it assumes and what you will be able to do at the end."
          jump={[
            { href: '#start', label: 'Where to start' },
            { href: '#catalogue', label: 'Courses', count: paths.length },
            { href: '#subjects', label: 'By subject', count: technologies.length },
          ]}
        />

        {/* ── Not sure where to start ──────────────────────────────────── */}
        <section className="sec-sm" id="start" style={{ scrollMarginTop: 'calc(var(--nav-h) + 24px)' }}>
          <div className="shell-wide">
            <ul className="tiles tiles-2" role="list" style={{ marginBottom: 'clamp(40px, 5vw, 64px)' }}>
              <li>
                <article className="tile" data-r>
                  <div className="tile-media">
                    <Cover seed="start-here" ratio="16 / 9" />
                    <span className="tile-n">Start here</span>
                  </div>
                  <div className="tile-in">
                    <p className="mono">Not sure which track</p>
                    <h2 className="d3">
                      <Link href={foundations ? `/exams/${foundations.slug}` : '/practice'} className="stretch-l">
                        Sit the foundations paper cold
                      </Link>
                    </h2>
                    <p className="body">
                      Twelve questions on the vendor-neutral core every AI certification assumes. The result
                      breaks down by topic and recommends the track that fits the gaps — which is a better
                      answer than guessing.
                    </p>
                    <div className="tile-foot">
                      <span className="mono tnum">
                        {foundations
                          ? `${formatCount(foundations.questionCount, 'question')} · ${foundations.minutes} min`
                          : 'Mock exam'}
                      </span>
                      <span className="link">
                        Take it <Chevron />
                      </span>
                    </div>
                  </div>
                </article>
              </li>

              <li>
                <article className="tile" data-r style={{ '--rd': '65ms' }}>
                  <div className="tile-media">
                    <Cover seed="browse-subjects" ratio="16 / 9" />
                    <span className="tile-n">Or browse</span>
                  </div>
                  <div className="tile-in">
                    <p className="mono">I know what I want</p>
                    <h2 className="d3">
                      <Link href="/technologies" className="stretch-l">
                        Start from a technology
                      </Link>
                    </h2>
                    <p className="body">
                      Go to the subject, read what it is and what it is worth, and follow the track it points
                      at. {withoutPath.length} technologies have an overview but no track of their own yet —
                      those pages say so plainly.
                    </p>
                    <div className="tile-foot">
                      <span className="mono tnum">{formatCount(technologies.length, 'technology', 'technologies')}</span>
                      <span className="link">
                        Browse <Chevron />
                      </span>
                    </div>
                  </div>
                </article>
              </li>
            </ul>

            <div id="catalogue" style={{ scrollMarginTop: 'calc(var(--nav-h) + 24px)' }}>
              <SectionHead
                eyebrow={`${paths.length} tracks · ${totalLessons} lessons · ${formatMinutes(totalMinutes)}`}
                title="All courses"
                lede="Filter by level, or search across every course and every individual lesson."
                action={
                  <Link href="/practice" className="link">
                    Practice <Chevron />
                  </Link>
                }
              />

              <CourseCatalogue paths={paths} catalogue={catalogue} />
            </div>

            <p className="note" style={{ marginTop: 32 }}>
              {settings.disclosure}
            </p>
          </div>
        </section>

        {/* ── Technologies, as a way into Learn rather than a sibling of it ──
            They were a sixth top-level destination competing with Learn and
            Docs for the same question. They are an axis through this material,
            so they live here, where someone is already choosing what to read. */}
        <div className="flow">
          <section className="sec" id="subjects" style={{ scrollMarginTop: 'calc(var(--nav-h) + 24px)' }}>
            <div className="shell-wide">
              <SectionHead
                eyebrow={`${technologies.length} subjects`}
                title={
                  <>
                    Or start from a subject, <span className="dim">not a track.</span>
                  </>
                }
                lede="Each subject page gathers every lesson, exam, project, guide and case study that touches it — the number on each card is how many pieces that is."
                action={
                  <Link href="/technologies" className="link">
                    All subjects <Chevron />
                  </Link>
                }
              />

              <ul className="grid-h grid-h-4" role="list">
                {technologies.slice(0, 8).map((tech, i) => (
                  <TechCell key={tech.slug} tech={tech} index={i} />
                ))}
              </ul>
            </div>
          </section>
        </div>

        <NextPage href="/practice" title="Practice" />
      </AppShell>
  )
}
