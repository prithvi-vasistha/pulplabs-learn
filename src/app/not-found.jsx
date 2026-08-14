import Link from 'next/link'
import Nav from '@/components/void/Nav'
import Footer from '@/components/void/Footer'
import Chevron from '@/components/void/Icons'
import { PageHead } from '@/components/learn/ui'

export const metadata = { title: 'Page not found' }

export default function NotFound() {
  return (
    <div className="grain">
      <Nav />

      <main id="main">
        <PageHead
          eyebrow="404"
          plate="deep-field"
          title={
            <>
              That page <span className="dim">is not here.</span>
            </>
          }
          lede="The address does not match a path, lesson, technology, exam, project or documentation page. It may have been renamed, or the link may have been typed by hand."
        />

        <section className="sec-sm">
          <div className="shell-wide">
            <ul className="grid-h grid-h-3 grid-h-sm" role="list">
              <li className="lift stretch">
                <p className="mono">Search</p>
                <h2 className="h4">
                  <Link href="/search" className="stretch-l">
                    Search everything
                  </Link>
                </h2>
                <p className="body">One index across every content type — usually the fastest way back.</p>
              </li>
              <li className="lift stretch">
                <p className="mono">Learn</p>
                <h2 className="h4">
                  <Link href="/learn" className="stretch-l">
                    Learning paths
                  </Link>
                </h2>
                <p className="body">Four structured paths through React, .NET, SQL and AI engineering.</p>
              </li>
              <li className="lift stretch">
                <p className="mono">Practice</p>
                <h2 className="h4">
                  <Link href="/exams" className="stretch-l">
                    Mock exams
                  </Link>
                </h2>
                <p className="body">Assessments that report by topic and link back to the material.</p>
              </li>
            </ul>

            <div className="btn-row" style={{ marginTop: 32 }}>
              <Link href="/" className="btn">
                Back to the Learn Lab <Chevron />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
