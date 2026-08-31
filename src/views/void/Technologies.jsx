import AppShell from '@/components/void/AppShell'
import Link from 'next/link'
import NextPage from '@/components/void/NextPage'
import TechExplorer from '@/components/learn/TechExplorer'
import { PageHead } from '@/components/learn/ui'
import { getSettings, getTechnologies } from '@/lib/content'

export default async function Technologies() {
  const [technologies, settings] = await Promise.all([getTechnologies(), getSettings()])

  return (
    <AppShell>
        <PageHead
          eyebrow="Topics"
          plate="deep-field"
          title={
            <>
              What should <span className="dim">I learn?</span>
            </>
          }
          lede="One page per subject: what it is, why it matters, and everything we have published on it. Where a subject is worth learning properly, the page points at the course that teaches it."
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
      </AppShell>
  )
}
