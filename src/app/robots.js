import { SITE_URL } from './layout'

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Attempt and result pages are personal and per-browser; there is
        // nothing there for a crawler to index.
        disallow: ['/exams/*/attempt', '/exams/*/results/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
