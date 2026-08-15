import Profile from '@/views/void/Profile'

/* Reads the session cookie, so it can never be static. */
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Profile',
  description:
    'Your account, the demo instances you have running, and your preparation progress — lessons completed, exams sat, and what your results say to work on.',
  alternates: { canonical: '/profile' },
  robots: { index: false },
}

export default function Page() {
  return <Profile />
}
