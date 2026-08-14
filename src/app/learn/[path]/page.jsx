import { notFound } from 'next/navigation'
import PathDetail from '@/views/void/PathDetail'
import { getExams, getPath, getPaths, getProjects, getTechnologies } from '@/lib/content'

export async function generateStaticParams() {
  const paths = await getPaths()
  return paths.map((p) => ({ path: p.slug }))
}

export async function generateMetadata({ params }) {
  const { path: slug } = await params
  const path = await getPath(slug)
  if (!path) return { title: 'Path not found' }

  return {
    title: path.title,
    description: `${path.summary.slice(0, 150)}`,
    alternates: { canonical: `/learn/${path.slug}` },
  }
}

export default async function Page({ params }) {
  const { path: slug } = await params
  const path = await getPath(slug)
  if (!path) notFound()

  const [allPaths, allExams, allProjects, allTechnologies] = await Promise.all([
    getPaths(),
    getExams(),
    getProjects(),
    getTechnologies(),
  ])

  const exams = path.exams.map((s) => allExams.find((e) => e.slug === s)).filter(Boolean)
  const projects = path.projects.map((s) => allProjects.find((p) => p.slug === s)).filter(Boolean)
  const technologies = path.technologies.map((s) => allTechnologies.find((t) => t.slug === s)).filter(Boolean)

  const index = allPaths.findIndex((p) => p.slug === path.slug)
  const nextPath = allPaths[(index + 1) % allPaths.length]

  return (
    <PathDetail
      path={path}
      exams={exams}
      projects={projects}
      technologies={technologies}
      nextPath={nextPath?.slug === path.slug ? null : nextPath}
    />
  )
}

export const dynamicParams = false
