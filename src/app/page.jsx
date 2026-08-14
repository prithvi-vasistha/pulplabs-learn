import Home from '@/views/void/Home'

/* Content lives in Postgres, so this route is rendered on demand: adding a
   row makes a page appear without a rebuild. Prerendering the whole catalogue
   at build time would need the database up during `next build` and would go
   stale the moment anything changed. */
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'PulpLabs Learn Lab — prepare, practise, build',
  description:
    'AI certification preparation: structured tracks, mock exams that point at what to study next, technology references, and documentation for the tools PulpLabs builds in the open.',
  alternates: { canonical: '/' },
}

export default function Page() {
  return <Home />
}
