import Practice from '@/views/void/Practice'

export const metadata = {
  title: 'Practice',
  description:
    'One real exam question a day, graded on the server and explained immediately, plus every mock paper — scored by topic and pointing at the lesson behind each gap.',
  alternates: { canonical: '/practice' },
}

// The daily question turns over in UTC, so this page cannot be fully static.
export const revalidate = 3600

export default function Page() {
  return <Practice />
}
