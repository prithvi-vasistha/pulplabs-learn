import Link from 'next/link'
import Nav from '@/components/void/Nav'
import Footer from '@/components/void/Footer'
import Chevron, { ChevronLeft, ChevronDown } from '@/components/void/Icons'
import DocsNav from '@/components/learn/DocsNav'
import Prose from '@/components/learn/Prose'
import Toc from '@/components/learn/Toc'
import { Crumbs } from '@/components/learn/ui'
import { tableOfContents } from '@/lib/toc'

/** One documentation page: sidebar, content, contents, and a pager. */
export default function DocsPage({ data }) {
  const { set, page, previous, next } = data
  const headings = tableOfContents(page.body)

  return (
    <div className="grain">
      <Nav />

      <main id="main">
        <div className="shell-wide docs-shell">
          <aside className="docs-side" aria-label={`${set.name} navigation`}>
            <DocsNav set={set} currentSlug={page.slug} />
          </aside>

          <article className="reader-main">
            <Crumbs
              items={[
                { label: 'Projects', href: '/projects' },
                { label: set.name, href: `/projects/${set.slug}` },
                { label: page.group },
                { label: page.title },
              ]}
            />

            <header className="lesson-head">
              <p className="mono" style={{ marginTop: 20 }}>
                {page.group} · {set.version}
              </p>
              <h1 className="d2">{page.title}</h1>
              {page.summary && <p className="lede">{page.summary}</p>}
            </header>

            <details className="outline-mob">
              <summary>
                {set.name} contents
                <ChevronDown />
              </summary>
              <div className="outline-mob-in">
                <DocsNav set={set} currentSlug={page.slug} />
              </div>
            </details>

            <Prose blocks={page.body} />

            <nav className="pager" aria-label="Documentation navigation">
              {previous ? (
                <Link href={`/projects/${set.slug}/${previous.slug}`} className="pg-prev">
                  <span className="mono">
                    <ChevronLeft /> Previous
                  </span>
                  <span className="h4">{previous.title}</span>
                </Link>
              ) : (
                <Link href={`/projects/${set.slug}`} className="pg-prev">
                  <span className="mono">
                    <ChevronLeft /> Overview
                  </span>
                  <span className="h4">{set.name}</span>
                </Link>
              )}

              {next ? (
                <Link href={`/projects/${set.slug}/${next.slug}`} className="pg-next">
                  <span className="mono">
                    Next <Chevron />
                  </span>
                  <span className="h4">{next.title}</span>
                </Link>
              ) : (
                <Link href={`/projects/${set.slug}`} className="pg-next">
                  <span className="mono">
                    End of set <Chevron />
                  </span>
                  <span className="h4">{set.name} overview</span>
                </Link>
              )}
            </nav>

            {set.project && (
              <p className="mono" style={{ marginTop: 28 }}>
                <Link href={`/projects/${set.project.slug}`} className="link-quiet">
                  ← {set.project.name} project overview
                </Link>
              </p>
            )}
          </article>

          <div className="reader-toc">
            <Toc headings={headings} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
