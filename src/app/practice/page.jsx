import Practice from '@/views/void/Practice'

export const metadata = {
  title: 'Practice',
  description:
    'Mock exams grouped by what they prepare you for, scored by topic and pointing at the lesson behind each gap.',
  alternates: { canonical: '/practice' },
}

export default function Page() {
  return <Practice />
}
