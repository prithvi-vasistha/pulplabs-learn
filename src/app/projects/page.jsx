import Projects from '@/views/void/Projects'

export const metadata = {
  title: 'Projects',
  description:
    'The open-source products and contributions PulpLabs works on — each with its source, what it is for, and the documentation written for it.',
  alternates: { canonical: '/projects' },
}

export default function Page() {
  return <Projects />
}
