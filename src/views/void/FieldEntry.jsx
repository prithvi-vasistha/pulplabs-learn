import AppShell from '@/components/void/AppShell'
import Link from 'next/link'
import Cover from '@/components/void/Cover'
import Logo from '@/components/void/Logo'
import NextPage from '@/components/void/NextPage'
import Chevron from '@/components/void/Icons'
import Prose from '@/components/learn/Prose'
import VideoEmbed from '@/components/learn/VideoEmbed'
import { Badge, Crumbs, MetaRow, SectionHead } from '@/components/learn/ui'
import { formatDate, formatMinutes } from '@/lib/format'

export default function FieldEntry({ entry, next, fieldNote }) {
  /*
   * A client's own colour, on the client's own page.
   *
   * §1 keeps the interface black and white, and the marketing site already
   * carries the one exception this follows: where a client is the subject —
   * their mark, their words — their brand is allowed in, because that section
   * is somebody else speaking. It is scoped to this entry and nothing else:
   * the shell, the nav and every other page stay monochrome.
   *
   * It tints hairlines rather than replacing them. A rule at 45% of a brand
   * colour still reads as the site's hairline (§6) and cannot be mistaken for
   * a status; a solid coloured border would be chrome carrying hue, which is
   * the thing §1 actually forbids.
   */
  const accent = entry.logoAccent ?? null

  return (
    <AppShell>
      <div
        className={accent ? 'fe fe-accent' : 'fe'}
        style={accent ? { '--accent': accent } : undefined}
      >
        <section className="phead grid-bg">
          <div className="phead-light" aria-hidden="true">
            <Cover seed={entry.slug} ratio="auto" />
          </div>

          <div className="shell phead-in">
            <Crumbs items={[{ label: 'Field', href: '/field' }, { label: entry.title }]} />

            <p className="mono" style={{ marginTop: 18 }}>
              {entry.kind} · {entry.sector}
            </p>

            {entry.client && (
              <div style={{ marginTop: 16 }}>
                <Logo
                  name={entry.client}
                  src={entry.logo}
                  ground={entry.logoGround}
                  shape={entry.logoShape}
                  size="lg"
                />
              </div>
            )}

            <h1 className="d1 phead-h" style={{ marginTop: 14 }}>
              {entry.title}
            </h1>

            <p className="lede phead-l">{entry.summary}</p>

            <div className="phead-meta">
              <MetaRow
                items={[
                  <span key="d" className="tnum">
                    {entry.published ? formatDate(entry.published) : 'Not yet published'}
                  </span>,
                  <span key="m" className="tnum">
                    {formatMinutes(entry.minutes)}
                  </span>,
                  entry.hasVideo ? <span key="v">{entry.videoReady ? 'Video' : 'Video to come'}</span> : null,
                ]}
              />
            </div>
          </div>
        </section>

        <section className="sec-sm">
          <div className="shell split">
            <div>
              {entry.video && (
                <div data-r style={{ marginBottom: 'clamp(32px, 4vw, 48px)' }}>
                  <VideoEmbed video={entry.video} plate={entry.plate} />
                </div>
              )}

              <Prose blocks={entry.body} />

              {entry.quote && (
                <blockquote className="field-quote" data-r>
                  <p>“{entry.quote.text}”</p>
                  <p className="mono">
                    {entry.quote.name} · {entry.quote.role}
                  </p>
                </blockquote>
              )}

              {entry.learn.length > 0 && (
                <section style={{ marginTop: 'clamp(40px, 5vw, 60px)' }} aria-labelledby="learn-h">
                  <p className="mono" id="learn-h">
                    Learn the ideas behind this
                  </p>
                  <ul className="related-list" role="list">
                    {entry.learn.map((item) => (
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
            </div>

            <aside className="rail" aria-label="Entry details">
              <div>
                <p className="mono" style={{ marginBottom: 12 }}>
                  Detail
                </p>
                <ul className="rail-list" role="list">
                  <li>
                    <span className="k body">Kind</span>
                    <span className="v">{entry.kind}</span>
                  </li>
                  {entry.client && (
                    <li>
                      <span className="k body">Client</span>
                      <span className="v">{entry.client}</span>
                    </li>
                  )}
                  {entry.facts.map((fact) => (
                    <li key={fact.k}>
                      <span className="k body">{fact.k}</span>
                      <span className="v">{fact.v}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {entry.people.length > 0 && (
                <div>
                  <p className="mono" style={{ marginBottom: 12 }}>
                    In this conversation
                  </p>
                  <ul className="people" role="list">
                    {entry.people.map((person) => (
                      <li key={person.name}>
                        <strong>{person.name}</strong>
                        <span className="mono">{person.role}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {entry.technologyDetail.length > 0 && (
                <div>
                  <p className="mono" style={{ marginBottom: 12 }}>
                    Technologies
                  </p>
                  <ul className="tags" role="list">
                    {entry.technologyDetail.map((tech) => (
                      <li key={tech.slug}>
                        <Link href={`/technologies/${tech.slug}`}>{tech.name}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="note">{fieldNote}</p>
            </aside>
          </div>
        </section>

        {next && (
          <div className="flow">
            <section className="sec">
              <div className="shell-wide">
                <SectionHead
                  eyebrow="More from the field"
                  title="Next entry."
                  action={
                    <Link href="/field" className="link">
                      All entries <Chevron />
                    </Link>
                  }
                />

                <ul className="tiles tiles-2" role="list">
                  <li>
                    <article className="tile" data-r>
                      <div className="tile-media">
                        <Cover seed={next.slug} ratio="16 / 9" />
                        <span className="tile-badge">
                          <Badge quiet>{next.kind}</Badge>
                        </span>
                      </div>
                      <div className="tile-in">
                        <p className="mono">{next.client ?? next.sector}</p>
                        <h3 className="d3">
                          <Link href={`/field/${next.slug}`} className="stretch-l">
                            {next.title}
                          </Link>
                        </h3>
                        <p className="body trunc-2">{next.summary}</p>
                      </div>
                    </article>
                  </li>

                  <li>
                    <article className="tile">
                      <div className="tile-media">
                        <img src="/void/grid-horizon.webp" alt="" loading="lazy" decoding="async" />
                      </div>
                      <div className="tile-in">
                        <p className="mono">Prepare</p>
                        <h3 className="d3">
                          <Link href="/learn" className="stretch-l">
                            Learn the material behind it
                          </Link>
                        </h3>
                        <p className="body trunc-2">
                          Four preparation tracks covering the architecture, API, retrieval and agent work these
                          engagements are built on.
                        </p>
                      </div>
                    </article>
                  </li>
                </ul>
              </div>
            </section>
          </div>
        )}

        <NextPage href="/field" title="Field" label="Back to" />
      </div>
    </AppShell>
  )
}
