import Builds from '@/views/void/Builds'

export const metadata = {
  title: 'Builds',
  description:
    'The open-source products and contributions PulpLabs works on: what each one is for, how it is built, and the lessons that explain the ideas underneath it.',
  alternates: { canonical: '/builds' },
}

export default function Page() {
  return <Builds />
}
