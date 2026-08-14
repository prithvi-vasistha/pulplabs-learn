import Link from 'next/link'
import Nav from '@/components/void/Nav'
import Footer from '@/components/void/Footer'
import NextPage from '@/components/void/NextPage'
import Chevron from '@/components/void/Icons'
import { PathModules, PathStart } from '@/components/learn/PathProgress'
import { Crumbs, Difficulty, MetaRow, SectionHead } from '@/components/learn/ui'
import { disclosure } from '@/lib/content'
import { formatCount, formatMinutes } from '@/lib/format'

export default function PathDetail({ path, exams, projects, technologies, nextPath }) {
  return (
    <div className="grain">
      <Nav />

      <main id="main">
        <section className="phead grid-bg">
          <div className="phead-light" aria-hidden="true">
            <img src="/void/flare-column.webp" alt="" fetchPriority="high" decoding="async" />
          </div>

          <div className="shell-wide phead-in">
            <Crumbs
              items={[
                { label: 'Prepare', href: '/learn' },
                { label: path.title },
              ]}
            />

            <p className="mono" style={{ marginTop: 18 }}>
              Preparation track
            </p>

            <h1 className="d1 phead-h" style={{ marginTop: 14 }}>
              {path.title}
            </h1>

            <p className="lede phead-l">{path.summary}</p>

            <div className="phead-meta">
              <MetaRow
                items={[
                  <Difficulty key="level" level={path.level} />,
                  <span key="span">{path.span}</span>,
                  <span key="lessons" className="tnum">
                    {formatCount(path.lessonCount, 'lesson')}
                  </span>,
                  <span key="modules" className="tnum">
                    {formatCount(path.moduleCount, 'module')}
                  </span>,
                  <span key="time" className="tnum">
                    {formatMinutes(path.minutes)}
                  </span>,
                ]}
              />
            </div>

            <PathStart pathSlug={path.slug} lessons={path.lessons} />
          </div>
        </section>

        <section className="sec-sm">
          <div className="shell-wide split">
            <div>
              <header className="sec-h" data-r>
                <p className="mono">What this gets you</p>
                <h2 className="d2">
                  By the end you can <span className="dim">do these things.</span>
                </h2>
              </header>

              <div className="prose" data-r style={{ marginBottom: 'clamp(44px, 5vw, 68px)' }}>
                <ul>
                  {path.outcomes.map((outcome) => (
                    <li key={outcome}>{outcome}</li>
                  ))}
                </ul>
              </div>

              <PathModules pathSlug={path.slug} modules={path.modules} lessons={path.lessons} />
            </div>

            <aside className="rail" aria-label="Path details">
              <div className="panel panel-sm">
                <p className="mono">Who it is for</p>
                <p className="body" style={{ marginTop: 10 }}>
                  {path.audience}
                </p>
              </div>

              {path.covers?.length > 0 && (
                <div>
                  <p className="mono" style={{ marginBottom: 12 }}>
                    What the track covers
                  </p>
                  <ul className="rail-notes" role="list">
                    {path.covers.map((item) => (
                      <li key={item} className="body">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <p className="mono" style={{ marginBottom: 12 }}>
                  Prerequisites
                </p>
                <ul className="rail-notes" role="list">
                  {path.prerequisites.map((item) => (
                    <li key={item} className="body">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="mono" style={{ marginBottom: 12 }}>
                  Skills covered
                </p>
                <ul className="tags" role="list">
                  {path.skills.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>
              </div>

              {technologies.length > 0 && (
                <div>
                  <p className="mono" style={{ marginBottom: 12 }}>
                    Technologies
                  </p>
                  <ul className="rail-list" role="list">
                    {technologies.map((tech) => (
                      <li key={tech.slug}>
                        <span className="k body">{tech.category}</span>
                        <Link href={`/technologies/${tech.slug}`} className="v link-quiet">
                          {tech.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {exams.length > 0 && (
                <div>
                  <p className="mono" style={{ marginBottom: 12 }}>
                    Test yourself
                  </p>
                  <ul className="rail-list" role="list">
                    {exams.map((exam) => (
                      <li key={exam.slug}>
                        <span className="k body tnum">{exam.questionCount} q</span>
                        <Link href={`/exams/${exam.slug}`} className="v link-quiet">
                          {exam.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {projects.length > 0 && (
                <div>
                  <p className="mono" style={{ marginBottom: 12 }}>
                    Built with this
                  </p>
                  <ul className="rail-list" role="list">
                    {projects.map((project) => (
                      <li key={project.slug}>
                        <span className="k body">{project.category}</span>
                        <Link href={`/builds/${project.slug}`} className="v link-quiet">
                          {project.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="note">{disclosure}</p>
            </aside>
          </div>
        </section>

        {nextPath && (
          <div className="flow">
            <section className="sec">
              <div className="shell-wide">
                <SectionHead
                  eyebrow="Keep going"
                  title="After this track."
                  action={
                    <Link href="/learn" className="link">
                      All tracks <Chevron />
                    </Link>
                  }
                />

                <ul className="grid-h grid-h-2" role="list">
                  <li className="lift stretch" data-r>
                    <p className="mono">{nextPath.eyebrow}</p>
                    <h3 className="d3">
                      <Link href={`/learn/${nextPath.slug}`} className="stretch-l">
                        {nextPath.title}
                      </Link>
                    </h3>
                    <p className="body trunc-3">{nextPath.summary}</p>
                    <div className="card-foot">
                      <span className="mono tnum">
                        {formatCount(nextPath.lessonCount, 'lesson')} · {formatMinutes(nextPath.minutes)}
                      </span>
                      <span className="link">
                        Open track <Chevron />
                      </span>
                    </div>
                  </li>

                  <li className="lift stretch" data-r style={{ '--rd': '65ms' }}>
                    <p className="mono">Practice</p>
                    <h3 className="d3">
                      <Link href="/exams" className="stretch-l">
                        Take an assessment
                      </Link>
                    </h3>
                    <p className="body trunc-3">
                      Reading a path and being able to apply it are different states. The assessments report
                      per-topic performance and link straight back to the lessons behind each gap.
                    </p>
                    <div className="card-foot">
                      <span className="mono">Graded on the server</span>
                      <span className="link">
                        Browse exams <Chevron />
                      </span>
                    </div>
                  </li>
                </ul>
              </div>
            </section>
          </div>
        )}

        <NextPage
          href={exams.length > 0 ? `/exams/${exams[0].slug}` : '/exams'}
          title="Mock exams"
          label="Test yourself"
        />
      </main>

      <Footer />
    </div>
  )
}
