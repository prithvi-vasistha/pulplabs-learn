import Link from 'next/link'
import Nav from '@/components/void/Nav'
import Footer from '@/components/void/Footer'
import NextPage from '@/components/void/NextPage'
import TechExplorer from '@/components/learn/TechExplorer'
import { PageHead } from '@/components/learn/ui'
import { getSettings, getTechnologies } from '@/lib/content'

export default async function Technologies() {
  const [technologies, settings] = await Promise.all([getTechnologies(), getSettings()])

  return (
    <div className="grain">
      <Nav />

      <main id="main">
        <PageHead
          eyebrow="Learn · Subjects"
          plate="deep-field"
          title={
            <>
              What should <span className="dim">I learn?</span>
            </>
          }
          lede="Every subject page gathers each lesson, exam, project, guide and case study that touches it — one place per subject, whatever type the material happens to be."
          actions={
            <Link href="/learn" className="btn btn-ghost">
              Preparation tracks
            </Link>
          }
        />

        <section className="sec-sm">
          <div className="shell-wide">
            <TechExplorer technologies={technologies} categories={settings.technologyCategories ?? []} />
          </div>
        </section>

        <NextPage href="/learn" title="Preparation tracks" label="Back to" />
      </main>

      <Footer />
    </div>
  )
}
