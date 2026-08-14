import Link from 'next/link'
import Nav from '@/components/void/Nav'
import Footer from '@/components/void/Footer'
import NextPage from '@/components/void/NextPage'
import Chevron from '@/components/void/Icons'
import { Badge, Crumbs, JumpBar, MetaRow, SectionHead } from '@/components/learn/ui'
import { formatCount, padIndex } from '@/lib/format'

export default function ProjectDetail({ project, next }) {
  const set = project.docSet
  const firstPage = set?.groups[0]?.pages[0]
  const docsHref = firstPage ? `/projects/${set.slug}/${firstPage.slug}` : null

  const jump = [
    { href: '#what-it-is', label: 'Overview' },
    { href: '#features', label: 'Features', count: project.features.length },
    { href: '#architecture', label: 'Architecture', count: project.architecture.length },
    set ? { href: '#documentation', label: 'Documentation', count: set.pageCount } : null,
    { href: '#learn', label: 'Learn', count: project.learn.length },
  ]

  return (
    <div className="grain">
      <Nav />

      <main id="main">
        <section className="phead grid-bg">
          <div className="phead-light" aria-hidden="true">
            <img src="/void/grid-horizon.webp" alt="" fetchPriority="high" decoding="async" />
          </div>

          <div className="shell-wide phead-in">
            <Crumbs items={[{ label: 'Projects', href: '/projects' }, { label: project.name }]} />

            <h1 className="d1 phead-h" style={{ marginTop: 18 }}>
              {project.name}
            </h1>

            <p className="lede phead-l">{project.tagline}</p>

            <div className="phead-meta">
              <MetaRow
                items={[
                  <span key="cat">{project.category}</span>,
                  <span key="status">{project.status}</span>,
                  <span key="docs" className="tnum">
                    {set ? formatCount(set.pageCount, 'doc page') : 'No documentation yet'}
                  </span>,
                ]}
              />
            </div>

            <div className="btn-row phead-a">
              {docsHref && (
                <Link href={docsHref} className="btn">
                  Read the docs <Chevron />
                </Link>
              )}
              {project.hasRepository && (
                <a href={project.repository} className="btn btn-ghost" rel="noreferrer noopener" target="_blank">
                  Open repository
                </a>
              )}
            </div>

            <JumpBar items={jump} />
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

              <section className="anchored" id="features" aria-labelledby="features-h">
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

              <section className="anchored" id="architecture" aria-labelledby="arch-h">
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

              {/* Documentation is part of the project, not a separate section
                  of the site. A reader who wants a specific page can see every
                  page from here without a second index in between. */}
              {set && (
                <section className="anchored" id="documentation" aria-labelledby="docs-h">
                  <header className="sec-h" data-r>
                    <p className="mono" id="docs-h">
                      Documentation · {set.version}
                    </p>
                    <h2 className="d2">
                      Guides, <span className="dim">written for the person using it.</span>
                    </h2>
                  </header>

                  <div className="doc-groups doc-groups-flat" data-r>
                    {set.groups.map((group) => (
                      <div key={group.title}>
                        <h3 className="mono">{group.title}</h3>
                        <ul role="list">
                          {group.pages.map((page) => (
                            <li key={page.slug}>
                              <Link href={`/projects/${set.slug}/${page.slug}`} className="link-quiet">
                                {page.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {set.versionNote && (
                    <p className="note" style={{ marginTop: 20 }}>
                      {set.versionNote}
                    </p>
                  )}
                </section>
              )}

              <section className="anchored" id="learn" aria-labelledby="learn-h">
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
                      {set ? <a href="#documentation" className="link-quiet">{set.version}</a> : 'Not published'}
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

              {project.field.length > 0 && (
                <div>
                  <p className="mono" style={{ marginBottom: 12 }}>
                    From the field
                  </p>
                  <ul className="rail-list" role="list">
                    {project.field.map((entry) => (
                      <li key={entry.slug}>
                        <span className="k body">{entry.kind}</span>
                        <Link href={`/field/${entry.slug}`} className="v link-quiet">
                          {entry.title}
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
                    <Link href="/projects" className="link">
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
                      <Link href={`/projects/${next.slug}`} className="stretch-l">
                        {next.name}
                      </Link>
                    </h3>
                    <p className="body trunc-3">{next.tagline}</p>
                    <div className="card-foot">
                      <span className="mono">{next.technologies.join(' · ')}</span>
                      <span className="mono tnum">
                        {next.docPageCount > 0 ? formatCount(next.docPageCount, 'doc page') : 'Repository only'}
                      </span>
                    </div>
                  </li>

                  <li className="lift stretch" data-r style={{ '--rd': '65ms' }}>
                    <p className="mono">Prepare</p>
                    <h3 className="d3">
                      <Link href="/learn" className="stretch-l">
                        Learn the ideas underneath
                      </Link>
                    </h3>
                    <p className="body trunc-3">
                      Four preparation tracks covering the architecture, API, retrieval and agent work these
                      projects are built on.
                    </p>
                    <div className="card-foot">
                      <span className="mono">Tracks and lessons</span>
                      <span className="link">
                        Browse <Chevron />
                      </span>
                    </div>
                  </li>
                </ul>
              </div>
            </section>
          </div>
        )}

        <NextPage href="/projects" title="Projects" label="Back to" />
      </main>

      <Footer />
    </div>
  )
}
