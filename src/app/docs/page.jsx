import Docs from '@/views/void/Docs'

export const metadata = {
  title: 'Documentation',
  description:
    'Documentation for PulpLabs projects: installation, concepts, guides, API reference, configuration and troubleshooting.',
  alternates: { canonical: '/docs' },
}

export default function Page() {
  return <Docs />
}
