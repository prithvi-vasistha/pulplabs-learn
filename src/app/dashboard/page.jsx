import DashboardView from '@/views/void/DashboardView'

export const metadata = {
  title: 'Your dashboard',
  description:
    'Preparation progress, mock exam history, and recommended next steps — derived from your activity and stored in your browser.',
  alternates: { canonical: '/dashboard' },
}

export default function Page() {
  return <DashboardView />
}
