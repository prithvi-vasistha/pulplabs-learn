import DashboardView from '@/views/void/DashboardView'

/* Content lives in Postgres, so this route is rendered on demand: adding a
   row makes a page appear without a rebuild. Prerendering the whole catalogue
   at build time would need the database up during `next build` and would go
   stale the moment anything changed. */
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Your dashboard',
  description:
    'Preparation progress, mock exam history, and recommended next steps — derived from your activity and stored in your browser.',
  alternates: { canonical: '/dashboard' },
}

export default function Page() {
  return <DashboardView />
}
