import Link from 'next/link'
import { levelRank } from '@/lib/format'

/**
 * Shared product primitives. Each one is a thin composition of classes from
 * void.css and learn.css — they exist so a meter or a breadcrumb is built the
 * same way on every page, not to introduce a second layer of styling.
 */

/** Page head with a corner light plate (§5). Same markup as the main site. */
export function PageHead({ eyebrow, title, lede, plate = 'deep-field', wide = true, children }) {
  return (
    <section className="phead grid-bg">
      <div className="phead-light" aria-hidden="true">
        <img src={`/void/${plate}.webp`} alt="" fetchPriority="high" decoding="async" />
      </div>
      <div className={`${wide ? 'shell-wide' : 'shell'} phead-in`}>
        {eyebrow && <p className="mono">{eyebrow}</p>}
        <h1 className="d1 phead-h">{title}</h1>
        {lede && <p className="lede phead-l">{lede}</p>}
        {children}
      </div>
    </section>
  )
}

/** Section opener (§5). */
export function SectionHead({ eyebrow, title, lede, action, reveal = true }) {
  const inner = (
    <>
      {eyebrow && <p className="mono">{eyebrow}</p>}
      <h2 className="d2">{title}</h2>
      {lede && <p className="lede">{lede}</p>}
    </>
  )

  if (action) {
    return (
      <header className="sec-h sec-h-row" {...(reveal ? { 'data-r': true } : {})}>
        <div>{inner}</div>
        {action}
      </header>
    )
  }

  return (
    <header className="sec-h" {...(reveal ? { 'data-r': true } : {})}>
      {inner}
    </header>
  )
}

export function Meter({ value, label, valueLabel, large = false, quiet = false, id }) {
  const clamped = Math.max(0, Math.min(100, Math.round(value ?? 0)))

  return (
    <div>
      {(label || valueLabel) && (
        <div className="meter-row">
          {label && (
            <span className="mono" id={id}>
              {label}
            </span>
          )}
          {valueLabel && <span className="mono tnum">{valueLabel}</span>}
        </div>
      )}
      <div
        className={`meter${large ? ' meter-lg' : ''}${quiet ? ' meter-quiet' : ''}`}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-labelledby={id}
        aria-label={id ? undefined : label || 'Progress'}
      >
        <i style={{ width: `${clamped}%` }} />
      </div>
    </div>
  )
}

/** Difficulty as filled hairline bars. No hue — three bars, n filled. */
export function Difficulty({ level }) {
  const rank = levelRank(level)
  return (
    <span className="diff">
      <i aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <span key={n} data-on={n <= rank ? '1' : '0'} />
        ))}
      </i>
      {level}
    </span>
  )
}

export function Crumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="crumbs mono">
        {items.map((item, i) => {
          const last = i === items.length - 1
          return (
            <li key={item.href ?? item.label}>
              {last || !item.href ? (
                <span aria-current={last ? 'page' : undefined}>{item.label}</span>
              ) : (
                <Link href={item.href}>{item.label}</Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export function MetaRow({ items }) {
  return (
    <ul className="meta mono" role="list">
      {items.filter(Boolean).map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  )
}

export function Badge({ children, solid = false, quiet = false, pip = false }) {
  const className = ['badge', solid && 'badge-solid', quiet && 'badge-quiet'].filter(Boolean).join(' ')
  return (
    <span className={className}>
      {pip && <span className="pip" aria-hidden="true" />}
      {children}
    </span>
  )
}

/** Empty, error, and not-found states all use this shape. */
export function StateBlock({ eyebrow, title, body, actions, align = 'center' }) {
  return (
    <div className={`state${align === 'left' ? ' state-l' : ''}`}>
      {eyebrow && <p className="mono">{eyebrow}</p>}
      <h2 className="d3">{title}</h2>
      {body && <p className="body">{body}</p>}
      {actions && <div className="btn-row">{actions}</div>}
    </div>
  )
}

/** Closing section with a full-bleed plate (§8). */
export function CloseSection({ title, lede, children, plate = 'aperture-glow' }) {
  return (
    <section className="close">
      <div className="close-img" aria-hidden="true">
        <img src={`/void/${plate}.webp`} alt="" loading="lazy" decoding="async" />
      </div>
      <div className="shell center">
        <h2 className="d2 measure" data-r>
          {title}
        </h2>
        {lede && (
          <p className="lede measure-w close-l" data-r style={{ '--rd': '80ms' }}>
            {lede}
          </p>
        )}
        {children && (
          <div className="close-cta" data-r style={{ '--rd': '160ms' }}>
            {children}
          </div>
        )}
      </div>
    </section>
  )
}
