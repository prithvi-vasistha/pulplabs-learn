import AppShell from '@/components/void/AppShell'
import Cover from '@/components/void/Cover'
import LoginForm from '@/components/learn/LoginForm'

/**
 * Sign in.
 *
 * The page states what an account is for and what it is not for, because the
 * honest answer is "almost nothing on this site needs one" and hiding that
 * would make the form feel like a toll gate.
 */
export default function Login({ next = '/profile', error = null }) {
  return (
    <AppShell>
      <section className="auth grid-bg">
        <div className="auth-light" aria-hidden="true">
          <Cover seed="sign-in-plate" ratio="auto" />
        </div>

        <div className="shell auth-in">
          <div className="auth-copy">
            <p className="mono">Account</p>
            <h1 className="d2">
              Sign in <span className="dim">to run things.</span>
            </h1>
            <p className="lede">
              Reading is open. An account exists for the one part of this portal that has to run something on a
              server for you: the playground.
            </p>

            <ul className="auth-list" role="list">
              <li>
                <span className="mono">Playground</span>
                <p>A demo instance is leased to your account for 45 minutes at a time.</p>
              </li>
              <li>
                <span className="mono">Progress</span>
                <p>Lessons and exam results stay in this browser for now; signing in does not sync them yet.</p>
              </li>
              <li>
                <span className="mono">What we store</span>
                <p>
                  Your email and name, encrypted at rest. Passwords are stored as a scrypt digest — not encrypted,
                  because a password we could decrypt is one an attacker could decrypt.
                </p>
              </li>
            </ul>
          </div>

          <LoginForm next={next} oauthError={error} />
        </div>
      </section>
    </AppShell>
  )
}
