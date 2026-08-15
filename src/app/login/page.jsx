import { redirect } from 'next/navigation'
import Login from '@/views/void/Login'
import { currentUser, safeNext } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Sign in',
  description:
    'Sign in to PulpLabs Learn to run playground demos. Reading — field notes, articles, courses and exams — needs no account.',
  alternates: { canonical: '/login' },
  robots: { index: false },
}

export default async function Page({ searchParams }) {
  const params = (await searchParams) ?? {}
  const next = safeNext(params.next, '/profile')

  // Already signed in: the form would be a dead end.
  if (await currentUser()) redirect(next)

  return <Login next={next} error={params.error ?? null} />
}
