import Link from 'next/link'
import Nav from '@/components/void/Nav'
import Footer from '@/components/void/Footer'
import NextPage from '@/components/void/NextPage'
import Chevron from '@/components/void/Icons'
import CourseCatalogue from '@/components/learn/CourseCatalogue'
import { PageHead, SectionHead } from '@/components/learn/ui'
import { disclosure, getExams, getPaths, getProgressCatalogue, getTechnologies } from '@/lib/content'
import { formatCount, formatMinutes } from '@/lib/format'

export default async function Learn() {
  const [paths, catalogue, technologies, exams] = await Promise.all([
    getPaths(),
    getProgressCatalogue(),
    getTechnologies(),
    getExams(),
  ])

  const totalMinutes = paths.reduce((total, path) => total + path.minutes, 0)
  const totalLessons = paths.reduce((total, path) => total + path.lessonCount, 0)
  const withoutPath = technologies.filter((tech) => tech.pathCount === 0)
  const foundations = exams.find((exam) => exam.slug === 'ai-foundations')

  return (
    <div className="grain">
      <Nav />

      <main id="main">
        <PageHead
          eyebrow="Prepare"
          plate="flare-column"
          title={
            <>
              Preparation tracks.
              <br />
              <span className="dim">In order, for a reason.</span>
            </>
          }
          lede="Each track is a sequence, not a catalogue. It states who it is for, what it assumes you already know, and what you will be able to do when you finish."
        />

        {/* ── Not sure where to start ──────────────────────────────────── */}
        <section className="sec-sm">
          <div className="shell-wide">
            <ul className="tiles tiles-2" role="list" style={{ marginBottom: 'clamp(40px, 5vw, 64px)' }}>
              <li>
                <article className="tile" data-r>
                  <div className="tile-media">
                    <img src="/void/hero-pause.webp" alt="" fetchPriority="high" decoding="async" />
                    <span className="tile-n">Start here</span>
                  </div>
                  <div className="tile-in">
                    <p className="mono">Not sure which track</p>
                    <h2 className="d3">
                      <Link href={foundations ? `/exams/${foundations.slug}` : '/exams'} className="stretch-l">
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
                    <img src="/void/deep-field.webp" alt="" loading="lazy" decoding="async" />
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

            <SectionHead
              eyebrow={`${paths.length} tracks · ${totalLessons} lessons · ${formatMinutes(totalMinutes)}`}
              title="The catalogue."
              lede="Filter by level, or search across every track and every individual lesson."
              action={
                <Link href="/exams" className="link">
                  Mock exams <Chevron />
                </Link>
              }
            />

            <CourseCatalogue paths={paths} catalogue={catalogue} />

            <p className="note" style={{ marginTop: 32 }}>
              {disclosure}
            </p>
          </div>
        </section>

        <NextPage href="/exams" title="Mock exams" />
      </main>

      <Footer />
    </div>
  )
}
