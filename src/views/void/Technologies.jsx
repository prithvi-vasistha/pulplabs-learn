import Nav from '@/components/void/Nav'
import Footer from '@/components/void/Footer'
import NextPage from '@/components/void/NextPage'
import TechExplorer from '@/components/learn/TechExplorer'
import { PageHead } from '@/components/learn/ui'
import { getTechnologies, technologyCategories } from '@/lib/content'

export default async function Technologies() {
  const technologies = await getTechnologies()

  return (
    <div className="grain">
      <Nav />

      <main id="main">
        <PageHead
          eyebrow="Technologies"
          plate="deep-field"
          title={
            <>
              What should <span className="dim">I learn?</span>
            </>
          }
          lede="Every subject here gets the same treatment: what it actually is, what learning it buys you, what it assumes, and where it connects to everything else in the Lab."
        />

        <section className="sec-sm">
          <div className="shell-wide">
            <TechExplorer technologies={technologies} categories={technologyCategories} />
          </div>
        </section>

        <NextPage href="/exams" title="Mock exams" />
      </main>

      <Footer />
    </div>
  )
}
