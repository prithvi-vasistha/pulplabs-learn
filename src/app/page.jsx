import Field from '@/views/void/Field'

/* Content lives in Postgres, so this route is rendered on demand. */
export const dynamic = 'force-dynamic'

export const metadata = {
  /* No `title` here: the root layout's default already names the site, and a
     title set on this page would run through the template and print the name
     twice — "PulpLabs Learn — PulpLabs Learn". */
  description:
    'Client case studies, how a PulpLabs engagement runs, and recorded conversations with the people who build these systems — plus the courses, exams and articles behind them.',
  alternates: { canonical: '/' },
}

export default function Page() {
  return <Field />
}
