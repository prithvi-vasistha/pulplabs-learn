import Home from '@/views/void/Home'

export const metadata = {
  title: 'PulpLabs Learn Lab — prepare, practise, build',
  description:
    'AI certification preparation: structured tracks, mock exams that point at what to study next, technology references, and documentation for the tools PulpLabs builds in the open.',
  alternates: { canonical: '/' },
}

// The daily question turns over in UTC, so this cannot be fully static.
export const revalidate = 3600

export default function Page() {
  return <Home />
}
