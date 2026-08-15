import AppShell from '@/components/void/AppShell'
import Link from 'next/link'
import NextPage from '@/components/void/NextPage'
import Chevron from '@/components/void/Icons'
import { ProjectCard } from '@/components/learn/cards'
import { PageHead, SectionHead } from '@/components/learn/ui'
import { getDocSets, getProjects, getSettings } from '@/lib/content'
import { formatCount } from '@/lib/format'

/**
 * Builds and Docs were two sections describing the same four objects from two
 * sides, which forced the docs index to list *absences* to explain why it was
 * shorter than the builds index. One section, and a project simply carries its
 * documentation or says it has none.
 */
export default async function Projects() {
  const [projects, docSets, settings] = await Promise.all([getProjects(), getDocSets(), getSettings()])
  const documented = projects.filter((p) => p.docs)
  const totalPages = docSets.reduce((total, set) => total + set.pageCount, 0)

  return (
    <AppShell>
        <PageHead
          eyebrow="Projects"
          plate="grid-horizon"
          title={
            <>
              What we ship <span className="dim">in the open.</span>
            </>
          }
          lede="We are a services firm with a couple of products. These are them — source and documentation, both public."
          jump={[
            { href: '#catalogue', label: 'Projects', count: projects.length },
            { href: '#documentation', label: 'Documentation', count: totalPages },
          ]}
        />

        <section className="sec-sm" id="catalogue" style={{ scrollMarginTop: 'calc(var(--nav-h) + 24px)' }}>
          <div className="shell-wide">
            <SectionHead
              eyebrow={`${projects.length} projects · ${documented.length} documented`}
              title="The catalogue."
              action={
                <a href="#documentation" className="link">
                  Jump to documentation <Chevron />
                </a>
              }
            />

            <ul className="grid-h grid-h-2" role="list">
              {projects.map((project, i) => (
                <ProjectCard key={project.slug} project={project} index={i} />
              ))}
            </ul>

            <p className="note" style={{ marginTop: 28 }}>
              {settings.catalogueNote}
            </p>
          </div>
        </section>

        <div className="flow">
          <section className="sec" id="documentation" style={{ scrollMarginTop: 'calc(var(--nav-h) + 24px)' }}>
            <div className="shell-wide">
              <SectionHead
                eyebrow={`${formatCount(totalPages, 'page')} across ${formatCount(docSets.length, 'project')}`}
                title="Documentation."
                lede="Conceptual guides written here. Each set points at its repository as the authority on exact signatures."
              />

              <div className="doc-sets">
                {docSets.map((set, i) => (
                  <section className="panel doc-set" key={set.slug} data-r style={{ '--rd': `${i * 65}ms` }}>
                    <div className="card-top">
                      <div>
                        <p className="mono">{set.version}</p>
                        <h3 className="d3" style={{ marginTop: 10 }}>
                          <Link href={`/projects/${set.slug}`}>{set.name}</Link>
                        </h3>
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
                                <Link href={`/projects/${set.slug}/${page.slug}`} className="link-quiet">
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
        </div>

        <NextPage href="/field" title="Field" />
      </AppShell>
  )
}
