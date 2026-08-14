import Link from 'next/link'
import Nav from '@/components/void/Nav'
import Footer from '@/components/void/Footer'
import NextPage from '@/components/void/NextPage'
import Chevron from '@/components/void/Icons'
import { Crumbs, Difficulty, MetaRow, SectionHead, StateBlock } from '@/components/learn/ui'
import { formatCount, formatMinutes, padIndex } from '@/lib/format'

export default function TechnologyDetail({ tech, next }) {
  const hasPath = tech.paths.length > 0

  return (
    <div className="grain">
      <Nav />

      <main id="main">
        <section className="phead grid-bg">
          <div className="phead-light" aria-hidden="true">
            <img src="/void/deep-field.webp" alt="" fetchPriority="high" decoding="async" />
          </div>

          <div className="shell-wide phead-in">
            <Crumbs
              items={[
                { label: 'Technologies', href: '/technologies' },
                { label: tech.name },
              ]}
            />

            <h1 className="d1 phead-h" style={{ marginTop: 18 }}>
              {tech.name}
            </h1>

            <p className="lede phead-l">{tech.tagline}</p>

            <div className="phead-meta">
              {/* The full fact list lives in the rail; the head carries only
                  what orients you at a glance. */}
              <MetaRow
                items={[
                  <span key="cat">{tech.category}</span>,
                  <Difficulty key="level" level={tech.level} />,
                  tech.paths.length > 0 ? (
                    <span key="paths" className="tnum">
                      {tech.paths.length === 1 ? '1 learning path' : `${tech.paths.length} learning paths`}
                    </span>
                  ) : (
                    <span key="paths">Overview only</span>
                  ),
                ]}
              />
            </div>
          </div>
        </section>

        <section className="sec-sm">
          <div className="shell-wide split">
            <div>
              <div className="prose" data-r>
                <h2 id="what-it-is">What it is</h2>
                <p>{tech.what}</p>
                <h2 id="why-learn-it">Why learn it</h2>
                <p>{tech.why}</p>
              </div>

              <section style={{ marginTop: 'clamp(44px, 5vw, 68px)' }} aria-labelledby="progression-h">
                <header className="sec-h" data-r>
                  <p className="mono" id="progression-h">
                    Progression
                  </p>
                  <h2 className="d2">
                    A sensible order <span className="dim">to learn it in.</span>
                  </h2>
                </header>

                <ul className="index" role="list" data-r>
                  {tech.outline.map((item, i) => (
                    <li key={item.title}>
                      <div className="index-row">
                        <span className="index-n">{padIndex(i + 1)}</span>
                        <span className="index-b">
                          <span className="h4" style={{ display: 'block' }}>
                            {item.title}
                          </span>
                          <span className="body" style={{ display: 'block' }}>
                            {item.note}
                          </span>
                        </span>
                        <span className="index-m" />
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              <section style={{ marginTop: 'clamp(44px, 5vw, 68px)' }} aria-labelledby="paths-h">
                <header className="sec-h" data-r>
                  <p className="mono" id="paths-h">
                    Learning
                  </p>
                  <h2 className="d2">{hasPath ? 'Paths covering this.' : 'No full path yet.'}</h2>
                </header>

                {hasPath ? (
                  <ul className="grid-h grid-h-2" role="list" data-r>
                    {tech.paths.map((path) => (
                      <li key={path.slug} className="lift stretch">
                        <p className="mono">{path.eyebrow}</p>
                        <h3 className="d3">
                          <Link href={`/learn/${path.slug}`} className="stretch-l">
                            {path.title}
                          </Link>
                        </h3>
                        <p className="body trunc-3">{path.summary}</p>
                        <div className="card-foot">
                          <span className="mono tnum">
                            {formatCount(path.lessonCount, 'lesson')} · {formatMinutes(path.minutes)}
                          </span>
                          <span className="link">
                            Open <Chevron />
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div data-r>
                    <StateBlock
                      align="left"
                      eyebrow="Honest status"
                      title="This technology has an overview, not a path."
                      body={
                        tech.exams.length > 0
                          ? 'The progression above is real and worth following on your own. There is an assessment for it, and the related technologies below have full paths — nothing here pretends a course exists that does not.'
                          : 'The progression above is real and worth following on your own. The related technologies below have full paths — nothing here pretends a course exists that does not.'
                      }
                      actions={
                        <>
                          {tech.exams.length > 0 && (
                            <Link href={`/exams/${tech.exams[0].slug}`} className="btn">
                              Take the {tech.exams[0].title} <Chevron />
                            </Link>
                          )}
                          <Link href="/learn" className="btn btn-ghost">
                            Browse paths that exist
                          </Link>
                        </>
                      }
                    />
                  </div>
                )}
              </section>
            </div>

            <aside className="rail" aria-label="Technology details">
              {tech.prerequisites.length > 0 && (
                <div className="panel panel-sm">
                  <p className="mono">Learn first</p>
                  <ul className="rail-notes" role="list" style={{ marginTop: 12 }}>
                    {tech.prerequisites.map((item) => (
                      <li key={item.slug} className="body">
                        <Link href={`/technologies/${item.slug}`} className="link-quiet">
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <p className="mono" style={{ marginBottom: 12 }}>
                  Facts
                </p>
                <ul className="rail-list" role="list">
                  {tech.facts.map((fact) => (
                    <li key={fact.k}>
                      <span className="k body">{fact.k}</span>
                      <span className="v tnum">{fact.v}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {tech.related.length > 0 && (
                <div>
                  <p className="mono" style={{ marginBottom: 12 }}>
                    Related technologies
                  </p>
                  <ul className="rail-list" role="list">
                    {tech.related.map((item) => (
                      <li key={item.slug}>
                        <span className="k body">{item.category}</span>
                        <Link href={`/technologies/${item.slug}`} className="v link-quiet">
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {tech.exams.length > 0 && (
                <div>
                  <p className="mono" style={{ marginBottom: 12 }}>
                    Assessments
                  </p>
                  <ul className="rail-list" role="list">
                    {tech.exams.map((exam) => (
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

              {tech.projects.length > 0 && (
                <div>
                  <p className="mono" style={{ marginBottom: 12 }}>
                    PulpLabs projects using it
                  </p>
                  <ul className="rail-list" role="list">
                    {tech.projects.map((project) => (
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
            </aside>
          </div>
        </section>

        {next && (
          <div className="flow">
            <section className="sec">
              <div className="shell-wide">
                <SectionHead
                  eyebrow="Keep exploring"
                  title="Next technology."
                  action={
                    <Link href="/technologies" className="link">
                      All technologies <Chevron />
                    </Link>
                  }
                />
                <ul className="grid-h grid-h-3 grid-h-sm" role="list">
                  {next.map((item) => (
                    <li key={item.slug} className="lift stretch" data-r>
                      <p className="mono">{item.category}</p>
                      <h3 className="h4">
                        <Link href={`/technologies/${item.slug}`} className="stretch-l">
                          {item.name}
                        </Link>
                      </h3>
                      <p className="body trunc-2">{item.tagline}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>
        )}

        <NextPage
          href={hasPath ? `/learn/${tech.paths[0].slug}` : '/learn'}
          title="Preparation tracks"
          label="Start learning"
        />
      </main>

      <Footer />
    </div>
  )
}
