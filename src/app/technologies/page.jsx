import Technologies from '@/views/void/Technologies'

/* Content lives in Postgres, so this route is rendered on demand: adding a
   row makes a page appear without a rebuild. Prerendering the whole catalogue
   at build time would need the database up during `next build` and would go
   stale the moment anything changed. */
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Technologies',
  description:
    'The AI stack the certifications test — models, interfaces, context, retrieval, agents, evaluation and safety.',
  alternates: { canonical: '/technologies' },
}

export default function Page() {
  return <Technologies />
}
