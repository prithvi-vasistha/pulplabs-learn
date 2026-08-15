import Link from 'next/link'
import AppShell from '@/components/void/AppShell'
import Cover from '@/components/void/Cover'
import NextPage from '@/components/void/NextPage'
import { Lock } from '@/components/void/Icons'
import PlaygroundConsole from '@/components/learn/PlaygroundConsole'
import { Crumbs, MetaRow } from '@/components/learn/ui'
import { currentUser } from '@/lib/auth'

/**
 * One demo.
 *
 * The brief is above the console for everybody, signed in or not. A reader who
 * cannot run it should still leave knowing what it does — that is the argument
 * for signing in, and it is more persuasive than a locked door.
 */
export default async function PlaygroundDemo({ demo }) {
  const user = await currentUser()

  return (
    <AppShell>
      <article className="pgd">
        <header className="pgd-h grid-bg">
          <div className="pgd-light" aria-hidden="true">
            <Cover seed={`playground-${demo.slug}`} ratio="auto" />
          </div>
          <div className="shell-wide pgd-h-in">
            <Crumbs
              items={[
                { label: 'Playground', href: '/playground' },
                { label: demo.title },
              ]}
            />
            <h1 className="d2">{demo.title}</h1>
            <p className="lede">{demo.tagline}</p>
            <MetaRow items={[demo.kind, `${demo.minutes} min`, `runs on our server`]} />
          </div>
        </header>

        <section className="sec-sm">
          <div className="shell-wide pgd-grid">
            <div className="pgd-brief">
              {(demo.brief ?? []).map((paragraph, i) => (
                <p key={i} className="body">
                  {paragraph}
                </p>
              ))}

              {demo.learn?.length > 0 && (
                <ul className="pgd-learn" role="list">
                  {demo.learn.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="link">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="pgd-run">
              {user ? (
                <PlaygroundConsole demo={demo} />
              ) : (
                <div className="pg-gate pg-gate-lg">
                  <p className="mono">
                    <Lock size={12} /> Sign-in required
                  </p>
                  <h2 className="h4">This one runs on a leased instance</h2>
                  <p className="body">{demo.summary}</p>
                  <p className="body">
                    An instance is held for 45 minutes and runs entirely in our own service — no third-party model is
                    called, and nothing you type here is kept once the lease ends.
                  </p>
                  <Link href={`/login?next=${encodeURIComponent(`/playground/${demo.slug}`)}`} className="btn">
                    Sign in to run it
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      </article>

      <NextPage href="/playground" title="All demos" label="Playground" />
    </AppShell>
  )
}
