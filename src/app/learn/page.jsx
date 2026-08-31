import Learn from '@/views/void/Learn'

/* Content lives in Postgres, so this route is rendered on demand: adding a
   row makes a page appear without a rebuild. Prerendering the whole catalogue
   at build time would need the database up during `next build` and would go
   stale the moment anything changed. */
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Courses',
  description:
    'Structured preparation tracks for AI certifications — architecture, developer, retrieval and agent systems — each an ordered sequence with prerequisites, outcomes and time estimates.',
  alternates: { canonical: '/learn' },
}

export default function Page() {
  return <Learn />
}
