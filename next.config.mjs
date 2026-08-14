/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  /**
   * Builds and Docs used to be two top-level sections describing the same
   * objects from two sides. They are now one — a project owns its
   * documentation — so the old URLs move permanently rather than 404.
   */
  async redirects() {
    return [
      // Exams are one half of Practice now, not a section of their own.
      { source: '/exams', destination: '/practice', permanent: true },
      { source: '/builds', destination: '/projects', permanent: true },
      { source: '/builds/:project', destination: '/projects/:project', permanent: true },
      { source: '/docs', destination: '/projects', permanent: true },
      { source: '/docs/:project', destination: '/projects/:project', permanent: true },
      { source: '/docs/:project/:page*', destination: '/projects/:project/:page*', permanent: true },
    ]
  },
}

export default nextConfig
