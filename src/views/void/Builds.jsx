import Link from 'next/link'
import Nav from '@/components/void/Nav'
import Footer from '@/components/void/Footer'
import NextPage from '@/components/void/NextPage'
import Chevron from '@/components/void/Icons'
import { ProjectCard } from '@/components/learn/cards'
import { PageHead, SectionHead } from '@/components/learn/ui'
import { catalogueNote, getDocSets, getProjects } from '@/lib/content'

export default async function Builds() {
  const [projects, docSets] = await Promise.all([getProjects(), getDocSets()])
  const documented = projects.filter((p) => p.docs)

  return (
    <div className="grain">
      <Nav />

      <main id="main">
        <PageHead
          eyebrow="Builds"
          plate="grid-horizon"
          title={
            <>
              What we ship
              <br />
              <span className="dim">in the open.</span>
            </>
          }
          lede="The open-source products and contributions PulpLabs works on. Each page explains the problem the project exists for, how it is put together, and which lessons cover the ideas underneath it."
        />

        <section className="sec-sm">
          <div className="shell-wide">
            <SectionHead
              eyebrow={`${projects.length} projects · ${documented.length} with a documentation set`}
              title="The catalogue."
              lede={catalogueNote}
              action={
                <Link href="/docs" className="link">
                  Documentation <Chevron />
                </Link>
              }
            />

            <ul className="grid-h grid-h-2" role="list">
              {projects.map((project, i) => (
                <ProjectCard key={project.slug} project={project} index={i} />
              ))}
            </ul>
          </div>
        </section>

        <div className="flow">
          <section className="sec">
            <div className="shell">
              <SectionHead
                eyebrow="The loop"
                title={
                  <>
                    Prepare, practise, build, <span className="dim">then read the source.</span>
                  </>
                }
                lede="Every project links back to the lessons that explain its ideas, and those lessons link forward to the projects that use them. It is the same content graph from both directions."
              />

              <figure className="figure" data-r>
                <pre>{`Learn a concept          →  /learn/agent-systems-professional/agent-memory
  ↓
Test what stuck          →  /exams/agent-systems
  ↓
See it applied           →  /builds/openlcm
  ↓
Read the documentation   →  /docs/openlcm/summary-dag
  ↓
Hit the next question    →  back to the lesson that answers it`}</pre>
                <figcaption>How the sections connect</figcaption>
              </figure>
            </div>
          </section>

          {docSets.length > 0 && (
            <section className="sec">
              <div className="shell-wide">
                <SectionHead
                  eyebrow="Documentation"
                  title="Guides written for the projects."
                  action={
                    <Link href="/docs" className="link">
                      All documentation <Chevron />
                    </Link>
                  }
                />

                <ul className="grid-h grid-h-2" role="list">
                  {docSets.map((set, i) => (
                    <li key={set.slug} className="lift stretch" data-r style={{ '--rd': `${i * 65}ms` }}>
                      <div className="card-top">
                        <p className="mono">{set.version}</p>
                        <span className="mono tnum">{set.pageCount} pages</span>
                      </div>
                      <h3 className="d3">
                        <Link href={`/docs/${set.slug}`} className="stretch-l">
                          {set.name}
                        </Link>
                      </h3>
                      <p className="body">{set.tagline}</p>
                      <div className="card-foot">
                        <span className="mono">{set.groups.map((g) => g.title).join(' · ')}</span>
                        <span className="link">
                          Read <Chevron />
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}
        </div>

        <NextPage href="/docs" title="Documentation" />
      </main>

      <Footer />
    </div>
  )
}
