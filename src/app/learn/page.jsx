import Learn from '@/views/void/Learn'

export const metadata = {
  title: 'Preparation tracks',
  description:
    'Structured preparation tracks for AI certifications — architecture, developer, retrieval and agent systems — each an ordered sequence with prerequisites, outcomes and time estimates.',
  alternates: { canonical: '/learn' },
}

export default function Page() {
  return <Learn />
}
