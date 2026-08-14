import { notFound } from 'next/navigation'
import ProjectDetail from '@/views/void/ProjectDetail'
import { getProject, getProjects } from '@/lib/content'

export async function generateStaticParams() {
  const projects = await getProjects()
  return projects.map((p) => ({ project: p.slug }))
}

export async function generateMetadata({ params }) {
  const { project: slug } = await params
  const project = await getProject(slug)
  if (!project) return { title: 'Project not found' }

  return {
    title: project.name,
    description: project.tagline,
    alternates: { canonical: `/builds/${project.slug}` },
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

export const dynamicParams = false
