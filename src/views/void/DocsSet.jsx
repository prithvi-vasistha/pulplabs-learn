import Link from 'next/link'
import Nav from '@/components/void/Nav'
import Footer from '@/components/void/Footer'
import Chevron from '@/components/void/Icons'
import DocsNav from '@/components/learn/DocsNav'
import { Crumbs } from '@/components/learn/ui'
import { formatCount } from '@/lib/format'

/** The landing page for one documentation set. */
export default function DocsSet({ set }) {
  const first = set.groups[0]?.pages[0]

  return (
    <div className="grain">
      <Nav />

      <main id="main">
        <div className="shell-wide docs-shell">
          <aside className="docs-side" aria-label={`${set.name} navigation`}>
            <DocsNav set={set} currentSlug={null} />
          </aside>

          <article className="reader-main">
            <Crumbs items={[{ label: 'Docs', href: '/docs' }, { label: set.name }]} />

            <header className="lesson-head">
              <p className="mono" style={{ marginTop: 20 }}>
                {set.version} · {formatCount(set.pageCount, 'page')}
              </p>
              <h1 className="d2">{set.name}</h1>
              <p className="lede">{set.tagline}</p>

              <div className="btn-row" style={{ marginTop: 26 }}>
                {first && (
                  <Link href={`/docs/${set.slug}/${first.slug}`} className="btn">
                    Start reading <Chevron />
                  </Link>
                )}
                {set.project && (
                  <Link href={`/builds/${set.project.slug}`} className="btn btn-ghost">
                    Project overview
                  </Link>
                )}
              </div>
            </header>

            {set.versionNote && (
              <aside className="callout callout-warn">
                <p className="mono">Warning</p>
                <p className="h4">Pre-release documentation</p>
                <p className="body">{set.versionNote}</p>
              </aside>
            )}

            <div className="docs-index">
              {set.groups.map((group) => (
                <section key={group.title} aria-labelledby={`g-${group.title.replace(/\s+/g, '-')}`}>
                  <p className="mono" id={`g-${group.title.replace(/\s+/g, '-')}`}>
                    {group.title}
                  </p>
                  <ul className="index" role="list">
                    {group.pages.map((page) => (
                      <li key={page.slug}>
                        <Link href={`/docs/${set.slug}/${page.slug}`} className="index-row">
                          <span className="index-n" aria-hidden="true">
                            →
                          </span>
                          <span className="index-b">
                            <span className="h4" style={{ display: 'block' }}>
                              {page.title}
                            </span>
                            <span className="body" style={{ display: 'block' }}>
                              {page.summary}
                            </span>
                          </span>
                          <span className="index-m" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </article>

          <div className="reader-toc" />
        </div>
      </main>

      <Footer />
    </div>
  )
}
