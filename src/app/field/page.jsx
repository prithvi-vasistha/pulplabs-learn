import Field from '@/views/void/Field'

/* Content lives in Postgres, so this route is rendered on demand: adding a
   row makes a page appear without a rebuild. Prerendering the whole catalogue
   at build time would need the database up during `next build` and would go
   stale the moment anything changed. */
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Field',
  description:
    'Client case studies, the shape of a PulpLabs engagement, and recorded conversations with the engineers who build these systems.',
  alternates: { canonical: '/field' },
}

export default function Page() {
  return <Field />
}
