import { notFound } from 'next/navigation'
import ProjectDetail from '@/views/void/ProjectDetail'
import { getProject, getProjects } from '@/lib/content'

/* Content lives in Postgres, so this route is rendered on demand: adding a
   row makes a page appear without a rebuild. Prerendering the whole catalogue
   at build time would need the database up during `next build` and would go
   stale the moment anything changed. */
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  const { project: slug } = await params
  const project = await getProject(slug)
  if (!project) return { title: 'Project not found' }

  return {
    title: project.name,
    description: project.tagline,
    alternates: { canonical: `/projects/${project.slug}` },
  }
}

export default async function Page({ params }) {
  const { project: slug } = await params
  const project = await getProject(slug)
  if (!project) notFound()

  const all = await getProjects()
  const index = all.findIndex((p) => p.slug === slug)
  const next = all[(index + 1) % all.length]

  return <ProjectDetail project={project} next={next.slug === slug ? null : next} />
}
