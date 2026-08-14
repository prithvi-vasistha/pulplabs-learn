import Link from 'next/link'

/* A slim hand-off, not a section: a label, the destination, and a rule that
   fills the space between them. Identical to the marketing site's. */
export default function NextPage({ href, title, label = 'Next' }) {
  return (
    <nav className="next" aria-label="Next page">
      <Link href={href} className="next-row">
        <span className="mono next-k">{label}</span>
        <span className="next-rule" aria-hidden="true" />
        <span className="next-t">{title}</span>
        <svg className="next-arrow" width="22" height="10" viewBox="0 0 22 10" fill="none" aria-hidden="true">
          <path
            d="M0 5h20M16 1l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>
    </nav>
  )
}
