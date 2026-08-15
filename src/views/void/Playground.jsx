import Link from 'next/link'
import AppShell from '@/components/void/AppShell'
import Cover from '@/components/void/Cover'
import NextPage from '@/components/void/NextPage'
import { Lock } from '@/components/void/Icons'
import { PageHead } from '@/components/learn/ui'
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
        jump={[{ href: '#demos', label: 'Demos', count: demos.length }]}
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
            {demos.map((demo, i) => (
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

      <NextPage href="/learn" title="Courses" label="Learn the theory" />
    </AppShell>
  )
}
