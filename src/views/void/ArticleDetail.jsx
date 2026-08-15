import AppShell from '@/components/void/AppShell'
import Link from 'next/link'
import Chevron from '@/components/void/Icons'
import Prose from '@/components/learn/Prose'
import Toc from '@/components/learn/Toc'
import { Crumbs, MetaRow } from '@/components/learn/ui'
import { formatDate } from '@/lib/format'
import { tableOfContents } from '@/lib/toc'

export default function ArticleDetail({ article, next }) {
  const headings = tableOfContents(article.body)

  return (
    <AppShell>
      <article className="art">
        <header className="art-head">
          <Crumbs items={[{ label: 'Articles', href: '/articles' }, { label: article.title }]} />

          <h1 className="art-h">{article.title}</h1>
          <p className="lede">{article.summary}</p>

          <div className="phead-meta">
            <MetaRow
              items={[
                <span key="topic">{article.topic}</span>,
                article.author ? <span key="by">{article.author}</span> : null,
                <span key="d" className="tnum">
                  {article.published ? formatDate(article.published) : 'Undated'}
                </span>,
                <span key="m" className="tnum">
                  {article.minutes} min read
                </span>,
              ]}
            />
          </div>
        </header>

        <div className="art-grid">
          <div className="art-main">
            <Prose blocks={article.body} />

            {article.related.length > 0 && (
              <section className="anchored" aria-labelledby="rel-h">
                <p className="mono" id="rel-h">
                  Go deeper
                </p>
                <ul className="related-list" role="list">
                  {article.related.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href}>
                        <span className="h4">{item.label}</span>
                        <Chevron />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {next && (
              <nav className="pager" aria-label="More articles">
                <div className="pg-prev" />
                <Link href={`/articles/${next.slug}`} className="pg-next">
                  <span className="mono">
                    Next article <Chevron />
                  </span>
                  <span className="h4">{next.title}</span>
                </Link>
              </nav>
            )}
          </div>

          <aside className="art-side" aria-label="Article details">
            <Toc headings={headings} />

            {article.technologyDetail.length > 0 && (
              <div style={{ marginTop: 28 }}>
                <p className="mono" style={{ marginBottom: 12 }}>
                  Topics
                </p>
                <ul className="tags" role="list">
                  {article.technologyDetail.map((tech) => (
                    <li key={tech.slug}>
                      <Link href={`/technologies/${tech.slug}`}>{tech.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </article>
    </AppShell>
  )
}
