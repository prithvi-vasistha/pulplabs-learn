import Reveal from '@/components/void/Reveal'
import { ProgressProvider } from '@/components/learn/ProgressProvider'

/* void.css is a byte-for-byte copy of the marketing site's stylesheet — the
   two are kept in sync by copying the file, never by editing this one.
   learn.css is everything the Learn Lab adds on top. */
import '@/styles/void.css'
import '@/styles/learn.css'

/* No webfont is loaded, deliberately. §12.1 of DESIGN_SYSTEM.md notes that
   Inter Tight and Berkeley Mono are named but never fetched, so the marketing
   site renders in the system stack. Loading them here — and only here — would
   make the two properties look different side by side, which matters more
   than closing the gap. Load them in both places, in the same commit, or in
   neither. */

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://learn.pulplabs.ai'

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'PulpLabs Learn Lab — prepare for AI certifications',
    template: '%s — PulpLabs Learn Lab',
  },
  description:
    'Certification preparation for AI engineers: structured tracks, mock exams that report by topic, technology references, and documentation for the tools PulpLabs builds in the open.',
  applicationName: 'PulpLabs Learn Lab',
  icons: { icon: '/favicon.svg' },
  openGraph: { type: 'website', siteName: 'PulpLabs Learn Lab', url: SITE_URL },
  alternates: { canonical: '/' },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [{ color: '#000000' }],
  colorScheme: 'dark',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Keyboard users should never have to tab the whole nav on every page */}
        <a className="skip" href="#main">
          Skip to content
        </a>
        <Reveal />
        <ProgressProvider>{children}</ProgressProvider>
      </body>
    </html>
  )
}
