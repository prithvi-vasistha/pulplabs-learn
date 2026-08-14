import Link from 'next/link'

/**
 * Inline formatting shared by every content surface: **bold**, `code`, and
 * [label](/href).
 *
 * It lives in its own module so client components — the exam runner, the
 * results review — can format question text without pulling in the whole
 * block renderer.
 */

const INLINE = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g

export function renderInline(text) {
  if (typeof text !== 'string') return text

  return text.split(INLINE).map((part, i) => {
    if (!part) return null

    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }

    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i}>{part.slice(1, -1)}</code>
    }

    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part)
    if (link) {
      const [, label, href] = link
      return href.startsWith('/') ? (
        <Link key={i} href={href}>
          {label}
        </Link>
      ) : (
        <a key={i} href={href} rel="noreferrer noopener" target="_blank">
          {label}
        </a>
      )
    }

    return <span key={i}>{part}</span>
  })
}
