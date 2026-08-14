import Link from 'next/link'
import Nav from '@/components/void/Nav'
import Footer from '@/components/void/Footer'
import NextPage from '@/components/void/NextPage'
import Chevron from '@/components/void/Icons'
import { Badge, Crumbs, MetaRow, SectionHead } from '@/components/learn/ui'
import { formatCount, padIndex } from '@/lib/format'

export default function ProjectDetail({ project, next }) {
  const docsHref = project.docSet ? `/docs/${project.docSet.slug}` : null

  return (
    <div className="grain">
      <Nav />

      <main id="main">
        <section className="phead grid-bg">
          <div className="phead-light" aria-hidden="true">
            <img src="/void/grid-horizon.webp" alt="" fetchPriority="high" decoding="async" />
          </div>

          <div className="shell-wide phead-in">
            <Crumbs items={[{ label: 'Open source', href: '/builds' }, { label: project.name }]} />

            <h1 className="d1 phead-h" style={{ marginTop: 18 }}>
              {project.name}
            </h1>

            <p className="lede phead-l">{project.tagline}</p>

            <div className="phead-meta">
              <MetaRow
                items={[
                  <span key="cat">{project.category}</span>,
                  <span key="status">{project.status}</span>,
                  <span key="tech">{project.technologies.join(' · ')}</span>,
                ]}
              />
            </div>

            <div className="btn-row" style={{ marginTop: 28 }}>
              {docsHref ? (
                <Link href={docsHref} className="btn">
                  Read the docs <Chevron />
                </Link>
              ) : (
                <Link href="/docs" className="btn btn-ghost">
                  Browse published documentation
                </Link>
              )}
              <Link href="/builds" className="btn btn-ghost">
                All projects
              </Link>
            </div>
          </div>
        </section>

        <section className="sec-sm">
          <div className="shell-wide split">
            <div>
              <div className="prose" data-r>
                <h2 id="what-it-is">What it is</h2>
                <p>{project.description}</p>
                <h2 id="the-problem">The problem it exists for</h2>
                <p>{project.problem}</p>
              </div>

              <section style={{ marginTop: 'clamp(44px, 5vw, 68px)' }} aria-labelledby="features-h">
                <header className="sec-h" data-r>
                  <p className="mono" id="features-h">
                    Features
                  </p>
                  <h2 className="d2">What it does.</h2>
                </header>

                <ul className="index" role="list" data-r>
                  {project.features.map((feature, i) => (
                    <li key={feature.title}>
                      <div className="index-row">
                        <span className="index-n">{padIndex(i + 1)}</span>
                        <span className="index-b">
                          <span className="h4" style={{ display: 'block' }}>
                            {feature.title}
                          </span>
                          <span className="body" style={{ display: 'block' }}>
                            {feature.text}
                          </span>
                        </span>
                        <span className="index-m" />
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              <section style={{ marginTop: 'clamp(44px, 5vw, 68px)' }} aria-labelledby="arch-h">
                <header className="sec-h" data-r>
                  <p className="mono" id="arch-h">
                    Architecture
                  </p>
                  <h2 className="d2">How it is put together.</h2>
                </header>

                <ul className="grid-h grid-h-2" role="list" data-r>
                  {project.architecture.map((item) => (
                    <li key={item.title}>
                      <h3 className="h4">{item.title}</h3>
                      <p className="body">{item.text}</p>
                    </li>
                  ))}
                </ul>
              </section>

              <section style={{ marginTop: 'clamp(44px, 5vw, 68px)' }} aria-labelledby="learn-h">
                <header className="sec-h" data-r>
                  <p className="mono" id="learn-h">
                    Learn the concepts behind this project
                  </p>
                  <h2 className="d2">
                    Read the ideas, <span className="dim">then read the code.</span>
                  </h2>
                </header>

                <ul className="related-list" role="list" data-r style={{ marginTop: 0 }}>
                  {project.learn.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href}>
                        <span className="h4">{item.label}</span>
                        <Chevron />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <aside className="rail" aria-label="Project details">
              <div className="panel panel-sm">
                <p className="mono">Repository</p>
                {project.hasRepository ? (
                  <>
                    <p className="body" style={{ marginTop: 10 }}>
                      Source, issues, and contribution guide.
                    </p>
                    <div className="btn-row" style={{ marginTop: 16 }}>
                      <a
                        href={project.repository}
                        className="btn btn-ghost"
                        rel="noreferrer noopener"
                        target="_blank"
                      >
                        Open repository
                      </a>
                    </div>
                  </>
                ) : (
                  <p className="body" style={{ marginTop: 10 }}>
                    Not published yet. When the repository goes public the link appears here and everywhere
                    else this project is listed — this page will not link to something that does not exist.
                  </p>
                )}
              </div>

              <div>
                <p className="mono" style={{ marginBottom: 12 }}>
                  Status
                </p>
                <ul className="rail-list" role="list">
                  <li>
                    <span className="k body">Stage</span>
                    <span className="v">{project.status}</span>
                  </li>
                  <li>
                    <span className="k body">Category</span>
                    <span className="v">{project.category}</span>
                  </li>
                  <li>
                    <span className="k body">Docs</span>
                    <span className="v">
                      {project.docSet ? (
                        <Link href={`/docs/${project.docSet.slug}`} className="link-quiet">
                          {project.docSet.version}
                        </Link>
                      ) : (
                        'Not published'
                      )}
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <p className="mono" style={{ marginBottom: 12 }}>
                  Technologies
                </p>
                <ul className="rail-list" role="list">
                  {project.technologyDetail.map((tech) => (
                    <li key={tech.slug}>
                      <span className="k body">{tech.category}</span>
                      <Link href={`/technologies/${tech.slug}`} className="v link-quiet">
                        {tech.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {project.exams.length > 0 && (
                <div>
                  <p className="mono" style={{ marginBottom: 12 }}>
                    Related assessments
                  </p>
                  <ul className="rail-list" role="list">
                    {project.exams.map((exam) => (
                      <li key={exam.slug}>
                        <span className="k body tnum">{formatCount(exam.questionCount, 'question')}</span>
                        <Link href={`/exams/${exam.slug}`} className="v link-quiet">
                          {exam.title}
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
                  eyebrow="More from the catalogue"
                  title="Next project."
                  action={
                    <Link href="/builds" className="link">
                      All projects <Chevron />
                    </Link>
                  }
                />

                <ul className="grid-h grid-h-2" role="list">
                  <li className="lift stretch" data-r>
                    <div className="card-top">
                      <p className="mono">{next.category}</p>
                      <Badge quiet={next.status !== 'In development'}>{next.status}</Badge>
                    </div>
                    <h3 className="d3">
                      <Link href={`/builds/${next.slug}`} className="stretch-l">
                        {next.name}
                      </Link>
                    </h3>
                    <p className="body trunc-3">{next.tagline}</p>
                    <div className="card-foot">
                      <span className="mono">{next.technologies.join(' · ')}</span>
                      <span className="link">
                        View project <Chevron />
                      </span>
                    </div>
                  </li>

                  <li className="lift stretch" data-r style={{ '--rd': '65ms' }}>
                    <p className="mono">Documentation</p>
                    <h3 className="d3">
                      <Link href="/docs" className="stretch-l">
                        Read the reference
                      </Link>
                    </h3>
                    <p className="body trunc-3">
                      Installation, concepts, guides, API reference, and troubleshooting for the projects that
                      have published documentation.
                    </p>
                    <div className="card-foot">
                      <span className="mono">Written for the person using it</span>
                      <span className="link">
                        Open docs <Chevron />
                      </span>
                    </div>
                  </li>
                </ul>
              </div>
            </section>
          </div>
        )}

        <NextPage
          href={docsHref ?? '/docs'}
          title="Documentation"
          label="Read on"
        />
      </main>

      <Footer />
    </div>
  )
}
