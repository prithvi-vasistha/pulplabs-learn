'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

/**
 * One form, two modes.
 *
 * Sign in and create an account differ by a single field, so making them two
 * pages would mean two URLs, two layouts and a reader bouncing between them
 * after typing the wrong one. The submit target changes; nothing else does.
 *
 * Nothing here stores a token. The response sets an httpOnly cookie the
 * browser will send from then on, and this component's only job afterwards is
 * to move the reader on and refresh the server components so the shell knows
 * who they are.
 */

const OAUTH_ERRORS = {
  'google-unavailable': 'Google sign-in is not configured on this server yet. Use an email and password for now.',
  'google-cancelled': 'Google sign-in was cancelled.',
  'google-incomplete': 'Google sent us back without an authorization code. Try again.',
  'google-expired': 'That sign-in attempt took too long. Start it again.',
  'google-state': 'That sign-in attempt could not be verified, so it was rejected. Start it again from this page.',
  'google-rejected': 'Google would not complete the sign-in. Check the client configuration and try again.',
}

export default function LoginForm({ next = '/profile', oauthError = null, googleEnabled = true }) {
  const router = useRouter()
  const [mode, setMode] = useState('signin')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(oauthError ? OAUTH_ERRORS[oauthError] ?? 'That sign-in did not work.' : null)

  const creating = mode === 'create'

  async function onSubmit(event) {
    event.preventDefault()
    if (pending) return

    const form = new FormData(event.currentTarget)
    setPending(true)
    setError(null)

    try {
      const response = await fetch(creating ? '/api/auth/register' : '/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: form.get('email'),
          password: form.get('password'),
          ...(creating ? { name: form.get('name') } : {}),
        }),
      })

      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(payload.error ?? 'That did not work. Try again.')
        setPending(false)
        return
      }

      router.push(next)
      // The shell, the sidebar and every server component need to re-render
      // knowing there is a session now.
      router.refresh()
    } catch {
      setError('Could not reach the server. Check your connection and try again.')
      setPending(false)
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-switch" role="tablist" aria-label="Sign in or create an account">
        <button
          type="button"
          role="tab"
          aria-selected={!creating}
          data-on={!creating || undefined}
          onClick={() => {
            setMode('signin')
            setError(null)
          }}
        >
          Sign in
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={creating}
          data-on={creating || undefined}
          onClick={() => {
            setMode('create')
            setError(null)
          }}
        >
          Create an account
        </button>
      </div>

      {googleEnabled && (
        <>
          <a className="auth-google" href={`/api/auth/google/start?next=${encodeURIComponent(next)}`}>
            <GoogleMark />
            Continue with Google
          </a>
          <p className="auth-or" aria-hidden="true">
            <span>or</span>
          </p>
        </>
      )}

      <form onSubmit={onSubmit} noValidate>
        {creating && (
          <label className="auth-field">
            <span className="mono">Name</span>
            <input name="name" type="text" autoComplete="name" required maxLength={120} placeholder="Ada Lovelace" />
          </label>
        )}

        <label className="auth-field">
          <span className="mono">Email</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            inputMode="email"
            placeholder="you@company.com"
          />
        </label>

        <label className="auth-field">
          <span className="mono">Password</span>
          <input
            name="password"
            type="password"
            autoComplete={creating ? 'new-password' : 'current-password'}
            required
            minLength={creating ? 10 : undefined}
            placeholder={creating ? 'At least 10 characters' : ''}
          />
          {creating && <span className="auth-hint">At least 10 characters. Length beats punctuation.</span>}
        </label>

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="btn" disabled={pending}>
          {pending ? 'Working…' : creating ? 'Create account' : 'Sign in'}
        </button>
      </form>

      <p className="auth-foot">
        Reading does not need an account — <Link href="/">field notes</Link>, <Link href="/articles">articles</Link>,{' '}
        <Link href="/learn">courses</Link> and <Link href="/practice">exams</Link> are all open. Signing in is for the{' '}
        <Link href="/playground">playground</Link>.
      </p>
    </div>
  )
}

function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.6 9.2c0-.6-.1-1.2-.2-1.8H9v3.5h4.8a4.1 4.1 0 0 1-1.8 2.7v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.6z" />
      <path fill="#34A853" d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.2c-.8.5-1.8.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8H.9v2.3A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.9 10.7a5.4 5.4 0 0 1 0-3.4V5H.9a9 9 0 0 0 0 8l3-2.3z" />
      <path fill="#EA4335" d="M9 3.6c1.3 0 2.5.5 3.4 1.3l2.6-2.6A9 9 0 0 0 .9 5l3 2.3C4.6 5.2 6.6 3.6 9 3.6z" />
    </svg>
  )
}
