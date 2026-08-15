import Playground from '@/views/void/Playground'
import { getPlaygroundDemos, getSettings } from '@/lib/content'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Playground',
  description:
    'Working demos of the things this portal teaches: a lexical retriever with its scores exposed, a context budget planner, and an eval harness that grades your routing rules against held-back labels.',
  alternates: { canonical: '/playground' },
}

export default async function Page() {
  const [demos, settings] = await Promise.all([getPlaygroundDemos(), getSettings()])
  return <Playground demos={demos} note={settings.playgroundNote} />
}
