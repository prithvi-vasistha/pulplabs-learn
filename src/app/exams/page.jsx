import Exams from '@/views/void/Exams'

export const metadata = {
  title: 'Mock exams',
  description:
    'Mock exams for AI certifications — graded on the server, broken down by topic, and linked back to the lessons behind each gap.',
  alternates: { canonical: '/exams' },
}

export default function Page() {
  return <Exams />
}
