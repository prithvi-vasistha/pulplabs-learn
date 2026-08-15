import Link from 'next/link'
import AppShell from '@/components/void/AppShell'
import NextPage from '@/components/void/NextPage'
import Dashboard from '@/components/learn/Dashboard'
import InstanceList from '@/components/learn/InstanceList'
import SignOutButton from '@/components/learn/SignOutButton'
import { PageHead, SectionHead } from '@/components/learn/ui'
import { getExamCatalogue, getProgressCatalogue } from '@/lib/content'
import { currentUser, serviceFetch, sessionToken } from '@/lib/auth'
import { formatDate } from '@/lib/format'

/**
 * Profile.
 *
 * Progress used to be a section of its own called Dashboard, which put a
 * reader's own history at the same level as the whole course catalogue. It is
 * one part of an account, so it lives inside one — along with what we know
 * about you and what you currently have running.
 *
 * The page works signed out. Progress is browser-local either way, so there is
 * a real page to show; what changes is whether there is a name at the top.
 */
export default async function Profile() {
  const [user, catalogue, exams] = await Promise.all([currentUser(), getProgressCatalogue(), getExamCatalogue()])

  let instances = []
  if (user) {
    const token = await sessionToken()
    const { ok, payload } = await serviceFetch('/playground/sessions', { token }).catch(() => ({ ok: false }))
    if (ok && Array.isArray(payload)) instances = payload
  }

  return (
    <AppShell>
      <PageHead
        eyebrow="Profile"
        plate={user ? 'account-plate' : 'deep-field'}
        title={
          user ? (
            <>
              {user.name ?? 'Your account'}. <span className="dim">Where you are, what is next.</span>
            </>
          ) : (
            <>
              Your progress. <span className="dim">Stored in this browser.</span>
            </>
          )
        }
        lede={
          user
            ? 'Everything on this page is derived from what you have actually done — nothing is invented, and where there is no data it says so rather than showing a zero that looks like a measurement.'
            : 'Lessons you finish and exams you sit are recorded locally, so this page works without an account. That progress stays in this browser; signing in opens the playground and its leased instances.'
        }
      />

      <section className="sec-sm">
        <div className="shell-wide">
          {user ? (
            <div className="acct">
              <div className="acct-id">
                {user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar} alt="" width={56} height={56} referrerPolicy="no-referrer" />
                ) : (
                  <span className="acct-init" aria-hidden="true">
                    {(user.name ?? user.email ?? '?').trim()[0].toUpperCase()}
                  </span>
                )}
                <div>
                  <p className="h4">{user.name ?? 'Signed in'}</p>
                  <p className="mono">{user.email}</p>
                </div>
              </div>

              <dl className="acct-meta">
                <div>
                  <dt className="mono">Signs in with</dt>
                  <dd>{user.googleLinked ? (user.hasPassword ? 'Google or password' : 'Google') : 'Email and password'}</dd>
                </div>
                <div>
                  <dt className="mono">Member since</dt>
                  <dd>{formatDate(user.createdAt)}</dd>
                </div>
                <div>
                  <dt className="mono">Demo instances</dt>
                  <dd className="tnum">{instances.length}</dd>
                </div>
              </dl>

              <div className="acct-act">
                <SignOutButton />
              </div>
            </div>
          ) : (
            <div className="acct acct-out">
              <div>
                <p className="h4">You are not signed in</p>
                <p className="body">
                  This page still works — progress below is read from this browser. An account adds the playground and,
                  in time, progress that is not tied to one machine.
                </p>
              </div>
              <div className="btn-row">
                <Link href="/login?next=%2Fprofile" className="btn">
                  Sign in
                </Link>
                <Link href="/playground" className="btn btn-ghost">
                  See the playground
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {user && (
        <section className="sec-sm" id="instances">
          <div className="shell-wide">
            <SectionHead
              eyebrow="Running now"
              title="Demo instances"
              lede="Each lease is held by your account and ends by itself. Ending one early frees the slot immediately."
            />
            <InstanceList instances={instances} />
          </div>
        </section>
      )}

      <Dashboard catalogue={catalogue} exams={exams} />

      <NextPage href="/learn" title="Courses" label="Keep going" />
    </AppShell>
  )
}
