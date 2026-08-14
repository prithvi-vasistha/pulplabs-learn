import { coverFor } from '@/lib/covers'

/**
 * One generated cover. Server-rendered — no client JS, no image request.
 *
 * The colours are CSS custom properties rather than literals, so the same SVG
 * is a soft pastel on paper and a deeper, more saturated version of itself on
 * black. One composition, two palettes, no second asset.
 */
export default function Cover({ seed, palette, className = '', ratio = '16 / 9', children }) {
  const { palette: family, shapes, id } = coverFor(seed, palette)

  return (
    <div className={`cv cv-${family} ${className}`.trim()} style={{ aspectRatio: ratio }}>
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
        <defs>
          <filter id={id} x="-40%" y="-40%" width="180%" height="180%" colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation="34" />
          </filter>
        </defs>

        <rect width="400" height="300" fill="var(--cv-bg)" />

        <g filter={`url(#${id})`}>
          {shapes.map((s, i) => (
            <ellipse
              key={i}
              cx={s.cx}
              cy={s.cy}
              rx={s.rx}
              ry={s.ry}
              fill={`var(--cv-${s.tone})`}
              opacity={s.o}
              transform={`rotate(${s.rot} ${s.cx} ${s.cy})`}
            />
          ))}
        </g>
      </svg>

      {children}
    </div>
  )
}
