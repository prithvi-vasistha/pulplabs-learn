import Practice from '@/views/void/Practice'

/* Content lives in Postgres, so this route is rendered on demand: adding a
   row makes a page appear without a rebuild. Prerendering the whole catalogue
   at build time would need the database up during `next build` and would go
   stale the moment anything changed. */
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Exams',
  description:
    'Mock exams grouped by what they prepare you for, scored by topic and pointing at the lesson behind each gap.',
  alternates: { canonical: '/practice' },
}

export default function Page() {
  return <Practice />
}
