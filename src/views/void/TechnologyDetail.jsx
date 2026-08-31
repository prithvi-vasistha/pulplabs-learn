import AppShell from '@/components/void/AppShell'
import Link from 'next/link'
import Cover from '@/components/void/Cover'
import NextPage from '@/components/void/NextPage'
import Chevron from '@/components/void/Icons'
import { Crumbs, Difficulty, JumpBar, MetaRow, SectionHead, StateBlock } from '@/components/learn/ui'
import { formatCount, formatDate, formatMinutes, padIndex } from '@/lib/format'

/**
 * A topic.
 *
 * This is the editorial surface — our take on a subject, and everything we
 * have written about it. It is usually somebody's first page on this site,
 * arrived at from a search for the subject rather than from the nav, so it
 * answers "what is this and what do you think of it" before it offers
 * anything to buy into.
 *
 * It used to re-list every lesson, exam, project, doc page and case study that
 * touched the subject. That made a topic page a second copy of the course
 * catalogue: the same material described twice, under two names, in two
 * sections. Courses owns the sequenced material and the quizzes; a topic links
 * to the one course that teaches it and otherwise stays out of the way.
 */
export default function TechnologyDetail({ tech, next }) {
  const hasArticles = tech.articles.length > 0
  const course = tech.paths[0] ?? null

  const jump = [
    { href: '#our-take', label: 'Our take' },
    hasArticles ? { href: '#writing', label: 'Articles', count: tech.articles.length } : null,
    tech.outline.length > 0 ? { href: '#progression', label: 'Where to start', count: tech.outline.length } : null,
  ]

  return (
    <AppShell>
      <section className="phead grid-bg">
        <div className="phead-light" aria-hidden="true">
          <Cover seed={tech.slug} ratio="auto" />
        </div>

        <div className="shell-wide phead-in">
          <Crumbs items={[{ label: 'Topics', href: '/technologies' }, { label: tech.name }]} />

          <h1 className="d1 phead-h" style={{ marginTop: 18 }}>
            {tech.name}
          </h1>

          <p className="lede phead-l">{tech.tagline}</p>

          <div className="phead-meta">
            <MetaRow
              items={[
                <span key="cat">{tech.category}</span>,
                <Difficulty key="level" level={tech.level} />,
                <span key="writing" className="tnum">
                  {hasArticles ? `${formatCount(tech.articles.length, 'article')}` : 'No articles yet'}
                </span>,
              ]}
            />
          </div>

          <JumpBar items={jump} />
        </div>
      </section>

      <section className="sec-sm">
        <div className="shell-wide split">
          <div>
            <div className="prose" data-r>
              <h2 id="our-take">What it is</h2>
              <p>{tech.what}</p>
              <h2>Why it matters</h2>
              <p>{tech.why}</p>
            </div>

            {/* The reason this page exists. Newest first, because a reader who
                found us through this subject wants what we think now. */}
            <section className="anchored" id="writing" aria-labelledby="writing-h">
              <header className="sec-h" data-r>
                <p className="mono" id="writing-h">
                  Our writing
                </p>
                <h2 className="d2">
                  {hasArticles ? (
                    <>
                      What we have published <span className="dim">on this.</span>
                    </>
                  ) : (
                    'Nothing published on this yet.'
                  )}
                </h2>
              </header>

              {hasArticles ? (
                <ul className="art-list" role="list" data-r>
                  {tech.articles.map((article) => (
                    <li key={article.slug}>
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
              ) : (
                <StateBlock
                  align="left"
                  eyebrow="Honest status"
                  title="We have not written about this one yet."
                  body="The overview above is what we hold on the subject today. When we publish on it, the piece appears here."
                  actions={
                    <Link href="/articles" className="btn btn-ghost">
                      Everything we have written <Chevron />
                    </Link>
                  }
                />
              )}
            </section>

            {tech.outline.length > 0 && (
              <section className="anchored" id="progression" aria-labelledby="progression-h">
                <header className="sec-h" data-r>
                  <p className="mono" id="progression-h">
                    Where to start
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
            )}

            {/* One line out to the taught material, not a catalogue. Courses
                owns that, and owning it in one place is the point. */}
            {(course || tech.demos.length > 0) && (
              <section className="anchored" aria-labelledby="learn-h">
                <header className="sec-h" data-r>
                  <p className="mono" id="learn-h">
                    Go further
                  </p>
                  <h2 className="d2">
                    Reading is one thing. <span className="dim">Doing it is another.</span>
                  </h2>
                </header>

                <ul className="index" role="list" data-r>
                  {course && (
                    <li>
                      <Link href={`/learn/${course.slug}`} className="index-row">
                        <span className="index-n res-type">Course</span>
                        <span className="index-b">
                          <span className="h4" style={{ display: 'block' }}>
                            {course.title}
                          </span>
                          <span className="body" style={{ display: 'block' }}>
                            {course.summary}
                          </span>
                        </span>
                        <span className="index-m">
                          <span className="mono tnum">
                            {formatCount(course.lessonCount, 'lesson')} · {formatMinutes(course.minutes)}
                          </span>
                        </span>
                      </Link>
                    </li>
                  )}
                  {tech.demos.map((demo) => (
                    <li key={demo.slug}>
                      <Link href={`/playground/${demo.slug}`} className="index-row">
                        <span className="index-n res-type">Demo</span>
                        <span className="index-b">
                          <span className="h4" style={{ display: 'block' }}>
                            {demo.title}
                          </span>
                          <span className="body" style={{ display: 'block' }}>
                            {demo.tagline}
                          </span>
                        </span>
                        <span className="index-m">
                          <span className="mono tnum">{demo.minutes} min</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside className="rail" aria-label="About this topic">
            {tech.prerequisites.length > 0 && (
              <div className="panel panel-sm">
                <p className="mono">Read first</p>
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
                  Related topics
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
          </aside>
        </div>
      </section>

      {next.length > 0 && (
        <section className="sec-sm">
          <div className="shell-wide">
            <SectionHead eyebrow="Keep reading" title="Next topic." />
            <ul className="grid-h grid-h-3" role="list">
              {next.map((item) => (
                <li key={item.slug} className="lift stretch">
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
      )}

      <NextPage href="/articles" title="Articles" label="Everything we write" />
    </AppShell>
  )
}
