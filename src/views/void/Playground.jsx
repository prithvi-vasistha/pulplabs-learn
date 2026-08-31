import Link from 'next/link'
import AppShell from '@/components/void/AppShell'
import Cover from '@/components/void/Cover'
import NextPage from '@/components/void/NextPage'
import { Lock, Soon } from '@/components/void/Icons'
import { PageHead, SectionHead } from '@/components/learn/ui'
import { currentUser } from '@/lib/auth'

/**
 * The playground.
 *
 * Every demo here computes its result on our server from the inputs you give
 * it. That is the reason this is the one section behind a sign-in: a run costs
 * something, and a lease has to belong to somebody.
 *
 * The catalogue itself is public. Deciding whether an account is worth it
 * should not require the account.
 */
export default async function Playground({ demos, note }) {
  const user = await currentUser()

  const live = demos.filter((d) => d.status !== 'planned')
  const planned = demos.filter((d) => d.status === 'planned')

  return (
    <AppShell>
      <PageHead
        eyebrow="Playground"
        plate="playground"
        title={
          <>
            Run it yourself. <span className="dim">Nothing here is a recording.</span>
          </>
        }
        lede="Three working demos of the things this portal teaches: a retriever you can watch fail, a context window you can overspend, and an eval harness that grades your rules against held-back labels."
        jump={[
          { href: '#demos', label: 'Demos', count: live.length },
          planned.length > 0 ? { href: '#planned', label: 'Being built', count: planned.length } : null,
        ]}
      />

      <section className="sec-sm" id="demos" style={{ scrollMarginTop: 'calc(var(--nav-h) + 24px)' }}>
        <div className="shell-wide">
          {!user && (
            <div className="pg-gate" data-r>
              <div>
                <p className="mono">
                  <Lock size={12} /> Sign-in required
                </p>
                <p className="body">
                  A demo runs on a leased instance, so it needs an account to lease it to. Reading about them does not —
                  everything below describes exactly what each one does before you decide.
                </p>
              </div>
              <Link href="/login?next=%2Fplayground" className="btn">
                Sign in
              </Link>
            </div>
          )}

          <ul className="pg-grid" role="list">
            {live.map((demo, i) => (
              <li key={demo.slug} data-r style={{ '--rd': `${Math.min(i, 5) * 60}ms` }}>
                <Link href={`/playground/${demo.slug}`} className="pg-card">
                  <Cover seed={`playground-${demo.slug}`} className="pg-cv" ratio="16 / 9" />
                  <div className="pg-in">
                    <p className="mono">
                      {demo.kind} · {demo.minutes} min
                    </p>
                    <h2 className="h4">{demo.title}</h2>
                    <p className="body">{demo.tagline}</p>
                    <p className="pg-cta mono">{user ? 'Open' : 'Sign in to run'}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {note && <p className="note" style={{ marginTop: 28 }}>{note}</p>}
        </div>
      </section>

      {/* Announced, not pretended. These are not links, because there is
          nothing behind them yet, and no date is claimed because we do not
          have one. */}
      {planned.length > 0 && (
        <section className="sec-sm" id="planned" style={{ scrollMarginTop: 'calc(var(--nav-h) + 24px)' }}>
          <div className="shell-wide">
            <SectionHead
              eyebrow="Being built"
              title={
                <>
                  Next in the playground. <span className="dim">Not yet.</span>
                </>
              }
              lede="Each of these is a demo we intend to build in the same shape as the three above — deterministic, computed on our own server, and showing its working. None of them has a date."
            />

            <ul className="pg-grid" role="list">
              {planned.map((demo, i) => (
                <li key={demo.slug} data-r style={{ '--rd': `${Math.min(i, 5) * 60}ms` }}>
                  <article className="pg-card pg-card-soon" aria-label={`${demo.title} — coming soon`}>
                    <Cover seed={`playground-${demo.slug}`} className="pg-cv" ratio="16 / 9" />
                    <div className="pg-in">
                      <p className="mono">
                        {demo.kind} · {demo.minutes} min
                      </p>
                      <h3 className="h4">{demo.title}</h3>
                      <p className="body">{demo.tagline}</p>
                      <p className="soon">
                        <Soon size={12} />
                        Coming soon
                      </p>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <NextPage href="/learn" title="Courses" label="Learn the theory" />
    </AppShell>
  )
}
