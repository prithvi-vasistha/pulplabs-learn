/**
 * The icon set. Every icon is a 1.4px stroke on `currentColor` so it inherits
 * the ink token of whatever it sits inside — no icon ever carries its own
 * colour (§1).
 */

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
  focusable: 'false',
}

/* The trailing chevron on "more" links — identical geometry to the marketing
   site's, so a button here and a button there carry the same mark. */
export default function Chevron() {
  return (
    <svg width="7" height="11" viewBox="0 0 7 11" fill="none" aria-hidden="true">
      <path
        d="M1 1l4.5 4.5L1 10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ChevronLeft({ size = 12 }) {
  return (
    <svg {...base} width={size} height={size} viewBox="0 0 12 12">
      <path d="M7.75 2.5 4.25 6l3.5 3.5" />
    </svg>
  )
}

export function ChevronDown({ size = 12 }) {
  return (
    <svg {...base} width={size} height={size} viewBox="0 0 12 12">
      <path d="M2.5 4.25 6 7.75l3.5-3.5" />
    </svg>
  )
}

export function ArrowRight({ size = 16 }) {
  return (
    <svg {...base} width={size} height={size} viewBox="0 0 16 16">
      <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" />
    </svg>
  )
}

export function Search({ size = 15 }) {
  return (
    <svg {...base} width={size} height={size} viewBox="0 0 16 16">
      <circle cx="7" cy="7" r="4.5" />
      <path d="M10.4 10.4 14 14" />
    </svg>
  )
}

export function Menu({ size = 16 }) {
  return (
    <svg {...base} width={size} height={size} viewBox="0 0 16 16">
      <path d="M2 5h12M2 11h12" />
    </svg>
  )
}

export function Close({ size = 16 }) {
  return (
    <svg {...base} width={size} height={size} viewBox="0 0 16 16">
      <path d="m4 4 8 8M12 4l-8 8" />
    </svg>
  )
}

export function Check({ size = 14 }) {
  return (
    <svg {...base} width={size} height={size} viewBox="0 0 16 16">
      <path d="m3 8.5 3.2 3.2L13 5" />
    </svg>
  )
}

export function Copy({ size = 12 }) {
  return (
    <svg {...base} width={size} height={size} viewBox="0 0 16 16">
      <rect x="5.5" y="5.5" width="8" height="8" rx="2" />
      <path d="M10.5 3.5A2 2 0 0 0 8.5 2h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 1.5 1.94" />
    </svg>
  )
}

export function Flag({ size = 13 }) {
  return (
    <svg {...base} width={size} height={size} viewBox="0 0 16 16">
      <path d="M3.5 14V2.5h9L10 6l2.5 3.5h-9" />
    </svg>
  )
}

export function Clock({ size = 13 }) {
  return (
    <svg {...base} width={size} height={size} viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="6" />
      <path d="M8 4.6V8l2.4 1.6" />
    </svg>
  )
}

export function Book({ size = 14 }) {
  return (
    <svg {...base} width={size} height={size} viewBox="0 0 16 16">
      <path d="M2.5 3.5h4a2 2 0 0 1 2 2v8a1.6 1.6 0 0 0-1.6-1.6H2.5zM13.5 3.5h-4a2 2 0 0 0-2 2v8a1.6 1.6 0 0 1 1.6-1.6h4.4z" />
    </svg>
  )
}

export function Terminal({ size = 14 }) {
  return (
    <svg {...base} width={size} height={size} viewBox="0 0 16 16">
      <path d="m3 4.5 3 3-3 3M8.5 11.5h4.5" />
    </svg>
  )
}

export function External({ size = 12 }) {
  return (
    <svg {...base} width={size} height={size} viewBox="0 0 16 16">
      <path d="M9 3h4v4M13 3 7.5 8.5" />
      <path d="M12 9.5V12a1.5 1.5 0 0 1-1.5 1.5h-6A1.5 1.5 0 0 1 3 12V6a1.5 1.5 0 0 1 1.5-1.5H7" />
    </svg>
  )
}
