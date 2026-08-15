import Field from '@/views/void/Field'

/* Content lives in Postgres, so this route is rendered on demand. */
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'PulpLabs Learn',
  description:
    'Client case studies, how a PulpLabs engagement runs, and recorded conversations with the people who build these systems — plus the courses, exams and articles behind them.',
  alternates: { canonical: '/' },
}

export default function Page() {
  return <Field />
}
