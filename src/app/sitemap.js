import {
  getAllDocParams,
  getAllLessonParams,
  getExamSlugs,
  getFieldSlugs,
  getPaths,
  getProjects,
  getTechnologies,
} from '@/lib/content'

const BASE = 'https://learn.pulplabs.dev'

/* Built from the database, so it is generated per request rather than at build
   time — a sitemap frozen at build would stop listing new content. */
export const dynamic = 'force-dynamic'

export default async function sitemap() {
  const [paths, lessons, technologies, exams, projects, docPages, fieldSlugs] = await Promise.all([
    getPaths(),
    getAllLessonParams(),
    getTechnologies(),
    getExamSlugs(),
    getProjects(),
    getAllDocParams(),
    getFieldSlugs(),
  ])

  const routes = [
    { url: '/', priority: 1 },
    { url: '/learn', priority: 0.9 },
    { url: '/technologies', priority: 0.8 },
    { url: '/practice', priority: 0.9 },
    { url: '/projects', priority: 0.7 },
    { url: '/field', priority: 0.7 },
    { url: '/dashboard', priority: 0.4 },
    { url: '/search', priority: 0.4 },
    ...paths.map((p) => ({ url: `/learn/${p.slug}`, priority: 0.8 })),
    ...lessons.map((l) => ({ url: `/learn/${l.path}/${l.lesson}`, priority: 0.7 })),
    ...technologies.map((t) => ({ url: `/technologies/${t.slug}`, priority: 0.6 })),
    ...exams.map((slug) => ({ url: `/exams/${slug}`, priority: 0.6 })),
    ...projects.map((p) => ({ url: `/projects/${p.slug}`, priority: 0.6 })),
    ...docPages.map((d) => ({ url: `/projects/${d.project}/${d.page.join('/')}`, priority: 0.5 })),
    ...fieldSlugs.map((slug) => ({ url: `/field/${slug}`, priority: 0.6 })),
  ]

  const lastModified = new Date()

  return routes.map((route) => ({
    url: `${BASE}${route.url}`,
    lastModified,
    priority: route.priority,
  }))
}
