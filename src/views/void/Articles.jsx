import AppShell from '@/components/void/AppShell'
import Link from 'next/link'
import Cover from '@/components/void/Cover'
import { PageHead } from '@/components/learn/ui'
import { formatDate } from '@/lib/format'

/**
 * Writing about the stack.
 *
 * Deliberately not the course catalogue: an article makes one argument and
 * ends, so these are dated, newest first, and listed rather than gridded. A
 * card grid would imply a curriculum that does not exist.
 */
export default function Articles({ articles }) {
  const [lead, ...rest] = articles

  return (
    <AppShell>
      <PageHead
        eyebrow="Articles"
        plate="articles"
        title={
          <>
            Notes on the stack, <span className="dim">and how to learn it.</span>
          </>
        }
        lede="What we have learned building these systems for clients — what to learn first, which received ideas do not survive production, and how to tell one kind of failure from another."
      />

      {lead && (
        <Link href={`/articles/${lead.slug}`} className="art-lead" data-r>
          <Cover seed={`article-${lead.slug}`} className="art-lead-cv" ratio="21 / 9" />
          <div className="art-lead-in">
            <p className="mono">
              {lead.topic} · {lead.published ? formatDate(lead.published) : 'Undated'}
            </p>
            <h2 className="art-lead-t">{lead.title}</h2>
            <p className="body">{lead.summary}</p>
            <p className="mono tnum art-meta">{lead.minutes} min read</p>
          </div>
        </Link>
      )}

      {rest.length > 0 && (
        <ul className="art-list" role="list">
          {rest.map((article, i) => (
            <li key={article.slug} data-r style={{ '--rd': `${Math.min(i, 5) * 55}ms` }}>
              <Link href={`/articles/${article.slug}`}>
                <span className="art-topic mono">{article.topic}</span>
                <span className="art-body">
                  <span className="art-t">{article.title}</span>
                  <span className="body">{article.summary}</span>
                </span>
                <span className="art-meta mono tnum">
                  {article.published ? formatDate(article.published) : '—'} · {article.minutes} min
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {articles.length === 0 && (
        <p className="note">No articles published yet.</p>
      )}
    </AppShell>
  )
}
