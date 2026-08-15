import Articles from '@/views/void/Articles'
import { getArticles } from '@/lib/content'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Articles',
  description:
    'Notes on the AI stack from PulpLabs engineering: what to learn first, which received ideas do not survive production, and how to tell one kind of failure from another.',
  alternates: { canonical: '/articles' },
}

export default async function Page() {
  return <Articles articles={await getArticles()} />
}
