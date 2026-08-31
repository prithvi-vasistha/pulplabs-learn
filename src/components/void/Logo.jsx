/**
 * A client mark.
 *
 * Two rules, and everything here follows from them.
 *
 * **Never modify the artwork.** No knocking out, no recolouring, no filters to
 * make it agree with the theme. A trademark repainted to fit our palette has
 * stopped being the trademark. So each mark carries the ground it was drawn
 * for — Urban Ethnographers is navy on yellow, and on our black page it needs
 * that yellow behind it or it disappears — and the plate is painted the same
 * colour in both themes.
 *
 * **Where there is no file, say so.** The fallback is a monogram set in the
 * interface's own type: obviously a placeholder rather than a bad guess at
 * somebody's logo. Drop a file in `public/logos/`, set `logo` and `logoGround`
 * on the entry in `src/data/field.js`, and the monogram disappears.
 *
 * `shape` sizes marks against each other. These lockups are not the same
 * proportion, so matching on height alone makes one a stamp and the next a
 * banner:
 *   wide    the default horizontal lockup
 *   small   low-resolution source, held down because scaling it only blurs it
 *   blocky  close to square, given more height so it is not a stamp
 *   xwide   very long and thin, held shorter so it does not dominate a row
 */
export default function Logo({ name, src, ground, shape = 'wide', size = 'md', decorative = false, className = '' }) {
  if (!name) return null

  if (src) {
    return (
      <span className={`lg lg-${size} ${className}`.trim()} data-shape={shape}>
        {/* The ground is inline because it belongs to the artwork, not to our
            theme — it is data about somebody else's brand, not a design token. */}
        <span className="lg-plate" style={ground ? { '--lg-ground': ground } : undefined}>
          <img src={src} alt={decorative ? '' : name} loading="lazy" decoding="async" />
        </span>
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
