import Projects from '@/views/void/Projects'

/* Content lives in Postgres, so this route is rendered on demand: adding a
   row makes a page appear without a rebuild. Prerendering the whole catalogue
   at build time would need the database up during `next build` and would go
   stale the moment anything changed. */
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Projects',
  description:
    'The open-source products and contributions PulpLabs works on — each with its source, what it is for, and the documentation written for it.',
  alternates: { canonical: '/projects' },
}

export default function Page() {
  return <Projects />
}
