import Link from 'next/link'
import Nav from '@/components/void/Nav'
import Footer from '@/components/void/Footer'
import NextPage from '@/components/void/NextPage'
import Chevron from '@/components/void/Icons'
import { PageHead, SectionHead, StateBlock } from '@/components/learn/ui'
import { getDocSets, getProjects } from '@/lib/content'
import { formatCount } from '@/lib/format'

export default async function Docs() {
  const [docSets, projects] = await Promise.all([getDocSets(), getProjects()])
  const undocumented = projects.filter((p) => !p.docs)

  return (
    <div className="grain">
      <Nav />

      <main id="main">
        <PageHead
          eyebrow="Documentation"
          plate="flare-column"
          title={
            <>
              Reference, <span className="dim">written for the person using it.</span>
            </>
          }
          lede="Concepts, guides and references for the projects PulpLabs builds in the open — organised around what you are trying to do rather than the shape of the codebase."
        />

        <section className="sec-sm">
          <div className="shell-wide">
            <SectionHead
              eyebrow={`${docSets.length} documentation sets`}
              title="Documentation sets."
              action={
                <Link href="/builds" className="link">
                  All projects <Chevron />
                </Link>
              }
            />

            <div className="doc-sets">
              {docSets.map((set, i) => (
                <section className="panel doc-set" key={set.slug} data-r style={{ '--rd': `${i * 65}ms` }}>
                  <div className="card-top">
                    <div>
                      <p className="mono">{set.version}</p>
                      <h2 className="d3" style={{ marginTop: 10 }}>
                        <Link href={`/docs/${set.slug}`}>{set.name}</Link>
                      </h2>
                      <p className="body" style={{ marginTop: 10, maxWidth: '52ch' }}>
                        {set.tagline}
                      </p>
                    </div>
                    <span className="mono tnum">{formatCount(set.pageCount, 'page')}</span>
                  </div>

                  <div className="doc-groups">
                    {set.groups.map((group) => (
                      <div key={group.title}>
                        <p className="mono">{group.title}</p>
                        <ul role="list">
                          {group.pages.map((page) => (
                            <li key={page.slug}>
                              <Link href={`/docs/${set.slug}/${page.slug}`} className="link-quiet">
                                {page.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </section>

        {undocumented.length > 0 && (
          <div className="flow">
            <section className="sec">
              <div className="shell">
                <SectionHead
                  eyebrow="Not here yet"
                  title="Builds without a documentation set."
                  lede="These have public repositories but no Learn Lab guide yet."
                />

                <div data-r>
                  <StateBlock
                    align="left"
                    eyebrow={`${undocumented.length} projects`}
                    title={undocumented.map((p) => p.name).join(' and ')}
                    body="Their repositories are public and linked from the project pages; what does not exist yet is a written guide here. They are listed so the absence is visible rather than implied."
                    actions={undocumented.map((project) => (
                      <Link key={project.slug} href={`/builds/${project.slug}`} className="btn btn-ghost">
                        {project.name} overview
                      </Link>
                    ))}
                  />
                </div>
              </div>
            </section>
          </div>
        )}

        <NextPage href="/dashboard" title="Your dashboard" />
      </main>

      <Footer />
    </div>
  )
}
