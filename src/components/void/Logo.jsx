/**
 * A client mark.
 *
 * These are **generated sample marks**, not anybody's real logo: a monogram
 * built from the initials plus the name set in the interface's own type. That
 * is deliberate — a wrong or approximated version of a real company's logo is
 * worse than an obvious placeholder, and this one is obviously a placeholder.
 *
 * To use the real thing, drop an SVG or PNG in `public/logos/` and set
 * `logo: '/logos/<file>.svg'` on the entry in `src/data/field.js`. The `src`
 * branch below renders it and the monogram disappears.
 */
export default function Logo({ name, src, size = 'md', className = '' }) {
  if (!name) return null

  if (src) {
    return (
      <span className={`lg lg-${size} ${className}`.trim()}>
        <img src={src} alt={`${name} logo`} loading="lazy" decoding="async" />
      </span>
    )
  }

  const initials = name
    .replace(/[^\p{L}\p{N} &]/gu, '')
    .split(/\s+/)
    .filter((w) => w && w !== '&' && w.length > 1)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')

  return (
    <span className={`lg lg-${size} ${className}`.trim()}>
      <span className="lg-mark" aria-hidden="true">
        {initials}
      </span>
      <span className="lg-name">{name}</span>
    </span>
  )
}
