import Link from 'next/link'
import Nav from '@/components/void/Nav'
import Footer from '@/components/void/Footer'
import NextPage from '@/components/void/NextPage'
import Chevron from '@/components/void/Icons'
import FieldGrid from '@/components/learn/FieldGrid'
import { PageHead, SectionHead } from '@/components/learn/ui'
import { fieldKinds, fieldNote, getFieldEntries } from '@/lib/content'

export default async function Field() {
  const entries = await getFieldEntries()
  const interviews = entries.filter((e) => e.kind === 'Interview')

  return (
    <div className="grain">
      <Nav />

      <main id="main">
        <PageHead
          eyebrow="Field"
          plate="hero-bleed"
          title={
            <>
              What this looks like
              <br />
              <span className="dim">outside a lesson.</span>
            </>
          }
          lede="Client case studies, the shape of a PulpLabs engagement, and recorded conversations with the people who build these systems."
          jump={[
            { href: '#entries', label: 'All entries', count: entries.length },
            { href: '#interviews', label: 'Interviews', count: interviews.length },
          ]}
        />

        <section className="sec-sm" id="entries" style={{ scrollMarginTop: 'calc(var(--nav-h) + 24px)' }}>
          <div className="shell-wide">
            <FieldGrid entries={entries} kinds={fieldKinds} />

            <p className="note" style={{ marginTop: 28 }}>
              {fieldNote}
            </p>
          </div>
        </section>

        <div className="flow">
          <section className="sec" id="interviews" style={{ scrollMarginTop: 'calc(var(--nav-h) + 24px)' }}>
            <div className="shell">
              <SectionHead
                eyebrow="Interviews"
                title={
                  <>
                    Conversations, <span className="dim">not conference talks.</span>
                  </>
                }
                lede="Recorded discussions about decisions that were actually hard. Each one links to the lessons that cover the same ground in writing, so you can read it instead if you would rather."
                action={
                  <Link href="/learn" className="link">
                    Preparation tracks <Chevron />
                  </Link>
                }
              />

              <ul className="index" role="list">
                {interviews.map((entry, i) => (
                  <li key={entry.slug} data-r style={{ '--rd': `${i * 65}ms` }}>
                    <Link href={`/field/${entry.slug}`} className="index-row">
                      <span className="index-n">{String(i + 1).padStart(2, '0')}</span>
                      <span className="index-b">
                        <span className="h4" style={{ display: 'block' }}>
                          {entry.title}
                        </span>
                        <span className="body" style={{ display: 'block' }}>
                          {entry.summary}
                        </span>
                      </span>
                      <span className="index-m">
                        <span className="mono tnum">{entry.minutes} min</span>
                        <span className="mono">{entry.videoReady ? 'Watch' : 'Not published'}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        <NextPage href="/projects" title="Projects" />
      </main>

      <Footer />
    </div>
  )
}
