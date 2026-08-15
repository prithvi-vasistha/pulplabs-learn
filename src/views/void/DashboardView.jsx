import AppShell from '@/components/void/AppShell'
import NextPage from '@/components/void/NextPage'
import Dashboard from '@/components/learn/Dashboard'
import { PageHead } from '@/components/learn/ui'
import { getExamCatalogue, getProgressCatalogue } from '@/lib/content'

export default async function DashboardView() {
  const [catalogue, exams] = await Promise.all([getProgressCatalogue(), getExamCatalogue()])

  return (
    <AppShell>
        <PageHead
          eyebrow="Dashboard"
          plate="deep-field"
          title={
            <>
              Where you are. <span className="dim">What is next.</span>
            </>
          }
          lede="Progress, assessment history, and the topics your results say to work on. All of it derived from what you have actually done — and all of it stored in this browser."
        />

        <Dashboard catalogue={catalogue} exams={exams} />

        <NextPage href="/learn" title="Preparation tracks" label="Keep going" />
      </AppShell>
  )
}
