import {
  getAllDocParams,
  getAllLessonParams,
  getDocSetSlugs,
  getExamSlugs,
  getFieldSlugs,
  getPaths,
  getProjects,
  getTechnologies,
} from '@/lib/content'

const BASE = 'https://learn.pulplabs.dev'

export default async function sitemap() {
  const [paths, lessons, technologies, exams, projects, docSets, docPages, fieldSlugs] = await Promise.all([
    getPaths(),
    getAllLessonParams(),
    getTechnologies(),
    getExamSlugs(),
    getProjects(),
    getDocSetSlugs(),
    getAllDocParams(),
    getFieldSlugs(),
  ])

  const routes = [
    { url: '/', priority: 1 },
    { url: '/learn', priority: 0.9 },
    { url: '/technologies', priority: 0.8 },
    { url: '/exams', priority: 0.8 },
    { url: '/builds', priority: 0.7 },
    { url: '/docs', priority: 0.7 },
    { url: '/field', priority: 0.7 },
    { url: '/dashboard', priority: 0.4 },
    { url: '/search', priority: 0.4 },
    ...paths.map((p) => ({ url: `/learn/${p.slug}`, priority: 0.8 })),
    ...lessons.map((l) => ({ url: `/learn/${l.path}/${l.lesson}`, priority: 0.7 })),
    ...technologies.map((t) => ({ url: `/technologies/${t.slug}`, priority: 0.6 })),
    ...exams.map((slug) => ({ url: `/exams/${slug}`, priority: 0.6 })),
    ...projects.map((p) => ({ url: `/builds/${p.slug}`, priority: 0.6 })),
    ...docSets.map((slug) => ({ url: `/docs/${slug}`, priority: 0.6 })),
    ...docPages.map((d) => ({ url: `/docs/${d.project}/${d.page.join('/')}`, priority: 0.5 })),
    ...fieldSlugs.map((slug) => ({ url: `/field/${slug}`, priority: 0.6 })),
  ]

  const lastModified = new Date()

  return routes.map((route) => ({
    url: `${BASE}${route.url}`,
    lastModified,
    priority: route.priority,
  }))
}
