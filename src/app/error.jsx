'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Nav from '@/components/void/Nav'
import Footer from '@/components/void/Footer'
import { StateBlock } from '@/components/learn/ui'

/**
 * Route-level error boundary.
 *
 * It names what failed and offers a retry that actually retries — `reset()`
 * re-renders the segment rather than reloading the page.
 */
export default function Error({ error, reset }) {
  useEffect(() => {
    // Contained failures should still be visible failures.
    console.error('Route error:', error)
  }, [error])

  return (
    <div className="grain">
      <Nav />

      <main id="main">
        <section className="sec">
          <div className="shell">
            <StateBlock
              eyebrow="Something failed to render"
              title="This page did not load."
              body={
                error?.digest
                  ? `The section stopped while rendering. Reference ${error.digest}. Retrying re-renders just this part of the page.`
                  : 'The section stopped while rendering. Retrying re-renders just this part of the page — the rest of the Lab is unaffected.'
              }
              actions={
                <>
                  <button type="button" className="btn" onClick={() => reset()}>
                    Try again
                  </button>
                  <Link href="/" className="btn btn-ghost">
                    Back to the home page
                  </Link>
                  <Link href="/search" className="btn btn-ghost">
                    Search instead
                  </Link>
                </>
              }
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
