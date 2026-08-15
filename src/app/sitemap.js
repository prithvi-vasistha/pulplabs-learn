import {
  getAllDocParams,
  getAllLessonParams,
  getExamSlugs,
  getArticleSlugs,
  getFieldSlugs,
  getPaths,
  getPlaygroundDemos,
  getProjects,
  getTechnologies,
} from '@/lib/content'
import { SITE_URL } from './layout'

/* Built from the database, so it is generated per request rather than at build
   time — a sitemap frozen at build would stop listing new content. */
export const dynamic = 'force-dynamic'

export default async function sitemap() {
  const [paths, lessons, technologies, exams, projects, docPages, fieldSlugs, articleSlugs, demos] = await Promise.all([
    getPaths(),
    getAllLessonParams(),
    getTechnologies(),
    getExamSlugs(),
    getProjects(),
    getAllDocParams(),
    getFieldSlugs(),
    getArticleSlugs(),
    getPlaygroundDemos(),
  ])

  const routes = [
    { url: '/', priority: 1 },
    { url: '/learn', priority: 0.9 },
    { url: '/technologies', priority: 0.8 },
    { url: '/practice', priority: 0.9 },
    { url: '/projects', priority: 0.7 },
    { url: '/articles', priority: 0.8 },
    { url: '/playground', priority: 0.7 },
    { url: '/search', priority: 0.4 },
    ...paths.map((p) => ({ url: `/learn/${p.slug}`, priority: 0.8 })),
    ...lessons.map((l) => ({ url: `/learn/${l.path}/${l.lesson}`, priority: 0.7 })),
    ...technologies.map((t) => ({ url: `/technologies/${t.slug}`, priority: 0.6 })),
    ...exams.map((slug) => ({ url: `/exams/${slug}`, priority: 0.6 })),
    ...projects.map((p) => ({ url: `/projects/${p.slug}`, priority: 0.6 })),
    ...docPages.map((d) => ({ url: `/projects/${d.project}/${d.page.join('/')}`, priority: 0.5 })),
    ...fieldSlugs.map((slug) => ({ url: `/field/${slug}`, priority: 0.6 })),
    ...articleSlugs.map((slug) => ({ url: `/articles/${slug}`, priority: 0.7 })),
    ...demos.map((demo) => ({ url: `/playground/${demo.slug}`, priority: 0.6 })),
  ]

  /* /login and /profile are deliberately absent: both are noindex, and a
     sitemap entry for a page that tells crawlers to go away is noise. */

  const lastModified = new Date()

  return routes.map((route) => ({
    url: `${SITE_URL}${route.url}`,
    lastModified,
    priority: route.priority,
  }))
}
