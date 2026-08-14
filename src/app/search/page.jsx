import { Suspense } from 'react'
import Nav from '@/components/void/Nav'
import Footer from '@/components/void/Footer'
import NextPage from '@/components/void/NextPage'
import SearchPanel from '@/components/learn/SearchPanel'
import { PageHead } from '@/components/learn/ui'
import { getSearchIndex } from '@/lib/content'

/* Content lives in Postgres, so this route is rendered on demand: adding a
   row makes a page appear without a rebuild. Prerendering the whole catalogue
   at build time would need the database up during `next build` and would go
   stale the moment anything changed. */
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Search',
  description:
    'Search across preparation tracks, lessons, technologies, mock exams, builds and documentation in one index.',
  alternates: { canonical: '/search' },
}

export default async function Page() {
  const index = await getSearchIndex()

  return (
    <div className="grain">
      <Nav />

      <main id="main">
        <PageHead
          eyebrow="Search"
          plate="grid-horizon"
          title={
            <>
              One index. <span className="dim">Every content type.</span>
            </>
          }
          lede="Paths, lessons, technologies, exams, projects and documentation are indexed together, so a result tells you what kind of thing it is as well as where it lives."
        />

        <section className="sec-sm">
          <div className="shell-wide">
            <Suspense
              fallback={
                <div aria-hidden="true">
                  <span className="skel" style={{ height: 52, borderRadius: 100 }} />
                  <span className="skel skel-b" style={{ marginTop: 24 }} />
                </div>
              }
            >
              <SearchPanel index={index} />
            </Suspense>
          </div>
        </section>

        <NextPage href="/dashboard" title="Your dashboard" />
      </main>

      <Footer />
    </div>
  )
}
