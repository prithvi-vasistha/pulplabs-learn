# PulpLabs Design System — VOID

The single reference for building new pages on this site. Everything below is derived from
[`src/styles/void.css`](src/styles/void.css), which is the canonical source of truth. If this
document and that file ever disagree, the CSS wins — and this document is wrong and should be fixed.

---

## 0. Read this first

**The live marketing site runs on one stylesheet: `src/styles/void.css`.** It is imported once, in
[`src/app/layout.jsx`](src/app/layout.jsx), so it applies to every route. New pages get it for free.

There are three design eras in this repo. Only one is current:

| Era | Stylesheet | Status | Routes |
| --- | --- | --- | --- |
| **VOID** | `void.css` | **Current. Build here.** | `/`, `/services`, `/team`, `/contact` |
| Legacy "fruit" | `global` + `refined` + `components` + `blog` | Frozen. Do not extend. | `/blog`, `/blog/[slug]`, `/case-studies/*`, `/admin` |
| "Apple" | `apple.css` | **Dead.** Nothing imports it. | — |

The legacy stylesheets are scoped to their own route layouts precisely so the two foundations never
land on the same page. **Do not import them into a new page**, and do not import `void.css` into the
legacy routes. See §12 for the plan to close this split.

> The "Design system" section of [`README.md`](README.md) still describes the fruit era — tangerine,
> Bricolage Grotesque, 22px cards. That is the frozen legacy system, not this one. Treat this file as
> the current reference.

---

## 1. The one rule

> **The interface is strictly black and white. The only colour on the site arrives through
> generated light imagery.**

That constraint is the entire idea, and it is fragile in one direction only: the moment a button
turns blue, a badge turns green, or a chart picks up a brand hue, the effect collapses and the site
reads as an agency template rather than a lab.

What this means in practice:

- No hex colour in new CSS except `#fff`, `#000`, and `rgba(255,255,255,α)`.
- Status, emphasis, and hierarchy are carried by **opacity, weight, and hairlines** — never hue.
- Photographs are desaturated (`grayscale(0.55)` for scenes, `grayscale(1)` for portraits) so a warm
  image cannot become the loudest thing on the page.
- The one deliberate exception is the `.flow` ground (§8), where three barely-there radial tints
  sit at 9–13% alpha behind the lower half of the home page. It is invisible as colour and reads as
  atmosphere. Do not treat it as permission to add more.

If a new page needs to signal "error" or "success", use white type, a hairline, and words.

---

## 2. Tokens

All tokens are defined on `:root` at the top of `void.css`. **Use the token, never the literal.**

### Ground

```css
--void:    #000000;                      /* page ground — true black, not near-black */
--raise-1: rgba(255,255,255,0.035);      /* barely-there surface: hover states, input fills */
--raise-2: rgba(255,255,255,0.06);       /* hovered ghost button, focused input */
--raise-3: rgba(255,255,255,0.09);       /* reserved — rarely needed */
```

`--void` is `#000000` on purpose: on an OLED panel those pixels are physically off, so the light
imagery appears to float in actual darkness. Never substitute `#0a0a0a` or `#111`.

### Ink

```css
--w-1: #ffffff;                          /* headlines, buttons, active nav, key numbers */
--w-2: rgba(255,255,255,0.62);           /* body copy, ledes */
--w-3: rgba(255,255,255,0.56);           /* mono labels, inactive nav, metadata */
--w-4: rgba(255,255,255,0.50);           /* quieter metadata and secondary labels */
```

**Body text is never pure white.** At body size, `#fff` on `#000` blooms at the edges and gets
physically harder to read. `--w-2` is the default for prose; `--w-1` is reserved for display type
and controls.

### Lines

```css
--line-1: rgba(255,255,255,0.08);        /* default hairline: grids, section rules, borders */
--line-2: rgba(255,255,255,0.14);        /* interactive borders: ghost buttons, chips, pills */
--line-3: rgba(255,255,255,0.24);        /* hover/focus border */
```

### Signal

```css
--signal: #ffffff;                       /* focus rings and the live pip ONLY. Never a surface. */
```

### Motion

```css
--ease-out:    cubic-bezier(0.23, 1, 0.32, 1);      /* everything entering or responding */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);     /* long ambient loops only (drift) */
--t-press: 120ms;                                    /* press feedback */
--t-hover: 200ms;                                    /* hover, colour, border */
--t-panel: 260ms;                                    /* accordions, sheets, nav material */
```

### Layout

```css
--shell:      1140px;    /* default content width — prose, forms, accordions, steps */
--shell-wide: 1360px;    /* wide content — nav, footer, card grids, telemetry */
--gutter:     24px;      /* horizontal page padding, both shells */
--nav-h:      64px;      /* sticky nav height; sticky offsets must reference this */
```

### Adaptive overrides

The system already responds to three user preferences. New components inherit this for free if they
use tokens — which is the main reason to use tokens.

```css
@media (prefers-reduced-transparency: reduce) { --raise-1: #0d0d0d; --raise-2: #141414; }
@media (prefers-contrast: more) { --w-2: .86; --w-3: .70; --line-1: .28; --line-2: .40; }
```

### Radii — convention, not tokens

There are no radius tokens yet. The convention in use:

| Radius | Used for |
| --- | --- |
| `100px` | Buttons, pills, chips, tags, newsletter input |
| `20px` | Large framed panels (telemetry) |
| `18px` | Media frames, newsletter panel, confirmation panels, the AI dock |
| `16px` | **Hairline grid containers** (§6) — the default for a grid of cards |
| `14px` | Small grid containers, hero chips |
| `12px` | Form inputs, portrait slots |
| `8px` | Nav links, small inline tags |

Stay on this ladder. If you add radius tokens, add them for these seven values and migrate — do not
introduce a new eighth value.

---

## 3. Type

### Faces

```css
body { font-family: 'Inter Tight', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; }
.mono { font-family: 'Berkeley Mono', ui-monospace, 'SF Mono', 'JetBrains Mono', monospace; }
```

> ⚠️ **Neither webfont is actually loaded.** There is no `@font-face`, no `next/font`, and no
> stylesheet link in the App Router layout — the only Google Fonts link in the repo is in
> `dist/index.html`, a stale build of the old fruit-era site. Every visitor today sees the *system*
> fallback. See §12 before you rely on Inter Tight's metrics.

### Scale

| Class | Size | Line height | Tracking | Weight | Use |
| --- | --- | --- | --- | --- | --- |
| `.d1` | `clamp(2.9rem, 7.6vw, 6rem)` | 0.98 | −0.042em | 500 | Page headline. **One per page.** |
| `.d2` | `clamp(2.1rem, 4.8vw, 3.6rem)` | 1.04 | −0.034em | 500 | Section headline |
| `.d3` | `clamp(1.5rem, 2.6vw, 2.1rem)` | 1.15 | −0.026em | 500 | Card title, pull quote |
| `.h4` | `1.0625rem` | 1.35 | −0.014em | 500 | Sub-item title inside a list |
| `.lede` | `clamp(1.0625rem, 1.55vw, 1.3125rem)` | 1.5 | −0.014em | 400 | Paragraph under a headline (`--w-2`) |
| `.body` | `0.9375rem` | 1.62 | −0.008em | 400 | Body copy (`--w-2`) |
| `.mono` | `0.6875rem` | 1.3 | **+0.14em** | 400 | Eyebrow, label, metadata (`--w-3`, uppercase) |

Two modifiers:

- `.dim` — sets `--w-3`. Used inside a headline to demote the second clause: `Discover. Build.
  <span class="dim">Hand over.</span>` This is the house move for headline rhythm; use it rather
  than a line-height or weight change.
- `.num` / `.tel-n` — display numerals with `font-variant-numeric: tabular-nums`. Any figure that
  might change or sit in a column gets tabular numerals.

**Tracking rule:** tightens as size grows, opens as size shrinks. On black this is stronger than on
white — light type optically bleeds outward, so display sizes need *more* negative tracking than
they would on a light ground. If you add a size, follow the curve; do not reuse `-0.011em` (the body
default) at display size.

### Composition rules

- Headlines get `text-wrap: balance` (already on `.d1`/`.d2`); ledes get `text-wrap: pretty`.
- `<br />` in a headline is legitimate here and used throughout — the display sizes are set to break
  where the author decides, not where the viewport decides.
- Measure caps: `.measure` (30ch, centred) for display type, `.measure-w` (56ch, centred) for ledes.
  Body copy inside components caps at 46–62ch inline.
- The eyebrow → headline → lede stack is the standard opener. See `.sec-h` (§5).

---

## 4. Layout

### Shells

Every section is a full-bleed `<section>` containing one shell div. **Never put page padding on the
section itself** — backgrounds, plates, and hairlines need to run edge to edge.

```jsx
<section className="sec">
  <div className="shell">…</div>        {/* 1140px — prose, forms, steps, accordions */}
</section>

<section className="sec">
  <div className="shell-wide">…</div>   {/* 1360px — card grids, telemetry, footer, nav */}
</section>
```

Rule of thumb: **if the content is read left-to-right as prose, use `.shell`; if it is scanned as a
grid, use `.shell-wide`.**

### Vertical rhythm

```css
.sec     { padding-block: clamp(90px, 11vw, 168px); }   /* standard section */
.sec-sm  { padding-block: clamp(56px, 7vw, 96px); }     /* tight section, or one that follows a page head */
```

There is one adjustment already encoded: `.phead + .sec-sm { padding-top: 0 }` — a page head's
bottom padding plus a section's top padding stacked into a gap wide enough to read as a missing
element. Keep `.sec-sm` as the first section after a `.phead`.

### Helpers

```css
.center     { text-align: center; }
.measure    { max-width: 30ch; margin-inline: auto; }
.measure-w  { max-width: 56ch; margin-inline: auto; }
.rule       { height: 1px; background: var(--line-1); border: 0; }
.sr-only    { visually hidden, still announced }
```

### Breakpoints

No token, no framework — plain `max-width` queries at the point each component actually breaks:

`900px` (3-col → 2-col, prose grids collapse) · `860px` (2-col panels stack) · `760px` (nav →
sheet, 2-col → 1-col) · `700px` / `620px` / `600px` (grids → 1-col) · `560px` / `520px` (form rows
stack). Match the nearest existing value rather than inventing a new one.

---

## 5. Section openers

Every section opens the same way. This is the highest-leverage pattern for making a new page feel
native — copy it exactly.

```jsx
<header className="sec-h" data-r>
  <p className="mono">How we engage</p>
  <h2 className="d2">
    Discover. Build. <span className="dim">Hand over.</span>
  </h2>
  <p className="lede">Optional. One or two sentences, no more.</p>
</header>
```

`.sec-h` caps at 60ch and carries the bottom margin (`clamp(38px, 4.5vw, 60px)`), so **do not add
your own margin** under it. Spacing between the eyebrow, headline and lede is already set.

For a section head with a trailing link on the same baseline, add `.sec-h-row`:

```jsx
<header className="sec-h sec-h-row" data-r>
  <div>
    <p className="mono">Practice areas</p>
    <h2 className="d2">What we build.</h2>
  </div>
  <Link href="/services" className="link prac-more">All capabilities <Chevron /></Link>
</header>
```

### Page heads

A landing page opens with `.hero` (full viewport, video plate). Every *other* page opens with
`.phead` — shorter, with a corner light plate:

```jsx
<section className="phead grid-bg">
  <div className="phead-light" aria-hidden="true">
    <img src="/void/flare-column.webp" alt="" fetchPriority="high" decoding="async" />
  </div>
  <div className="shell phead-in">
    <p className="mono">Capabilities</p>
    <h1 className="d1 phead-h">Everything we build.</h1>
    <p className="lede phead-l">One or two sentences of framing.</p>
  </div>
</section>
```

`.phead-h` and `.phead-l` animate in on load (`rise`, 70ms/150ms stagger) — they are **not**
scroll-revealed, because they are above the fold. Do not add `data-r` to them.

---

## 6. The hairline grid — the signature pattern

This is the single most reused construction in the system. Nine components are built from it:
`.surfaces`, `.voices`, `.roster`, `.stack`, `.formats`, `.certs-grid`, `.prin`, `.nums`,
`.tel-grid`.

The trick: the container is filled with the hairline colour and the gap is `1px`, so the children's
own black backgrounds *become* the grid lines. There are no borders on the cells.

```css
.your-grid {
  list-style: none; margin: 0; padding: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;                              /* ← the hairline */
  background: var(--line-1);             /* ← shows through the gap */
  border: 1px solid var(--line-1);
  border-radius: 16px;
  overflow: hidden;                      /* ← required, or corners leak */
}

.your-grid > li {
  background: var(--void);               /* ← opaque, or the trick fails */
  padding: clamp(24px, 2.8vw, 36px);
  display: grid; gap: 12px;
  align-content: start;
}
```

Three variants of the cell background, chosen by what is behind the grid:

| Cell background | When |
| --- | --- |
| `var(--void)` | Default — grid sits on plain black |
| `rgba(0,0,0,0.72)` + `backdrop-filter: blur(8px)` | Grid sits **over a light plate** (`.formats`, `.certs-grid`) |
| `transparent` | Cell should let a plate show through fully (`.tel-lead`) |

**Full-bleed variant:** drop the border-radius and side borders, keep `border-block`, and the grid
becomes a band that spans the shell (`.nums`, `.prin`).

**Hover:** `.surface`, `.roster li`, `.prac li` lift to `var(--raise-1)` on hover, gated behind
`@media (hover: hover) and (pointer: fine)`. Every hover state in this system is gated that way —
touch devices must not get stuck in a hover state.

### The other list pattern: the dense index

Where a grid would be too card-like, the system uses bordered rows instead — `.proc`, `.prac`,
`.cat`. The shape is a numbered column, a flexible body column, and optional metadata:

```css
.your-list { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--line-1); }
.your-list li {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr) 280px;   /* number · body · meta */
  gap: 24px;
  padding-block: clamp(22px, 2.6vw, 30px);
  border-bottom: 1px solid var(--line-1);
  align-items: start;
}
```

Numbers are always zero-padded mono: `String(i + 1).padStart(2, '0')` in `--w-4`.

Choose the index when items are read in order or scanned for one match; choose the grid when items
are peers to be compared.

---

## 7. Components

### Buttons

```jsx
<Link href="/contact" className="btn">Book a call <Chevron /></Link>
<Link href="/services" className="btn btn-ghost">View catalogue</Link>
```

- `.btn` — white fill, black text, 100px pill, 42px min-height. **The only "primary".**
- `.btn-ghost` — transparent, `--line-2` border. The only secondary.
- There is no third variant, no destructive variant, and no size scale beyond `.nv-cta` (the smaller
  34px nav instance). If you need a third emphasis level, use `.link`.
- Press feedback is `scale(0.97)` on `:active` — **on press, not on click.**
- Trailing `<Chevron />` on forward actions; the SVG slides 3px on hover for `.link`.

### Links

```jsx
<Link href="/services" className="link">All capabilities <Chevron /></Link>
```

Inline text links inherit colour and have no underline (`a { color: inherit; text-decoration: none }`).
For a standalone emphasised link use `.contact-mail`, which adds a `--line-2` bottom border.

### Pill (announcement)

```jsx
<span className="pill"><b>New</b> Incident Intelligence is live</span>
```

The `<b>` becomes an inverted white capsule; the rest is `--w-2`.

### Tags and chips

Two shapes, both `100px`:

```jsx
<ul className="certs"><li>Anthropic</li></ul>          {/* --line-2 border, 7px 14px */}
<ul className="stack"><li><ul><li>Python</li></ul></li></ul>  {/* --line-1 border, 6px 12px, hover lifts border */}
```

### Forms

The complete pattern lives in [`src/views/void/Contact.jsx`](src/views/void/Contact.jsx). Rules:

- **Every field has a visible `<label class="f-label">`.** A placeholder is not a label — it
  disappears exactly when it is needed. Placeholders carry examples, never the field name.
- Wrap each field in `.f`; wrap side-by-side pairs in `.f-row` (collapses at 560px).
- Optional fields get `<span className="f-opt">Optional</span>` inside the label. Do not mark
  required fields with asterisks — mark the optional ones instead.
- Errors: `aria-invalid="true"` on the control, `aria-describedby` pointing at a
  `<p className="f-err" id="{id}-err">`. Error text is white, not red — the system has no red.
- On submit failure, move focus to the first invalid field.
- Clear a field's error the moment the user edits it again.
- Inputs are `--raise-1` on `--line-1`, 12px radius; focus goes to `--raise-2` + `--line-3` + a 3px
  white glow at 8%.
- Selects use `.f-select` (custom chevron, `appearance: none`, and `option { background: #0a0a0a }`
  because native dropdown options cannot be transparent).

### Nav, Footer, NextPage

Import them — do not rebuild them.

```jsx
import Nav from '@/components/void/Nav'
import Footer from '@/components/void/Footer'
import NextPage from '@/components/void/NextPage'
```

- `Nav` is self-contained: sticky, becomes glass past 10px scroll (`data-scrolled`), collapses to a
  full-screen sheet below 760px, locks body scroll when open, closes on Escape and on route change,
  and sets `aria-current="page"`. **Add a new top-level route to the `LINKS` array in
  [`Nav.jsx`](src/components/void/Nav.jsx)** — that is the only edit a new page needs.
- `NextPage` is the page-to-page hand-off: one row, `Next ——— Destination →`. Every page ends with
  one, forming a loop: Home → Capabilities → Team → Contact.

---

## 8. Light plates — where the colour comes from

The plates are the only source of colour, and they all work the same way:

```jsx
<div className="hero-light" aria-hidden="true">
  <img src="/void/aperture-glow.webp" alt="" loading="lazy" decoding="async" />
</div>
```

```css
.your-plate {
  position: absolute;
  z-index: -1;                     /* parent needs `isolation: isolate` + `overflow: hidden` */
  mix-blend-mode: screen;          /* ← the whole trick */
  opacity: 0.55;
  mask-image: radial-gradient(60% 60% at 50% 50%, #000, transparent 76%);
}
```

**`mix-blend-mode: screen` is non-negotiable.** It makes black pixels in the source contribute
nothing, so the plate genuinely *adds photons* to the page instead of laying a dark rectangle over
it. Without it, every plate becomes a visible box.

The parent section must have `position: relative; overflow: hidden; isolation: isolate` — the
isolation is what keeps `z-index: -1` from punching through the page background.

### Opacity ladder

Opacity is chosen by how much type sits on top:

| Context | Opacity | Mask |
| --- | --- | --- |
| `.close-img` — closing statement | 0.90 | none (full bleed) |
| `.hero-light` — hero | 0.85 | radial 70%/60% at 50% 55% |
| `.contact-img` | 0.75 | none |
| `.plate-img` — statement band | 0.70 | linear 90deg, fades both sides |
| `.phead-light` — page head corner | 0.55 | radial 60%/60% |
| `.tel-img`, `.enable-img` — behind a panel | 0.40 | radial ~55% |
| `.enable-img` inside `.flow` | 0.28 | (dimmed so two grounds don't stack) |

**Where a plate is bright, type needs help.** The hero's second line gets its own
`rgba(255,255,255,0.72)` plus `text-shadow: 0 2px 40px rgba(0,0,0,0.55)` — read as the type
occluding the glow rather than floating in it. Reuse that shadow if you put type over a plate above
0.6 opacity.

### Assets

`public/void/` — all pre-generated, all monochrome-to-spectral light on black:

| File | Shape | Typical use |
| --- | --- | --- |
| `hero-loop.webm` / `.mp4` + `hero-loop-poster.webp` | Video, centre bloom | Hero only |
| `hero-pause.webp` | The frame the video settles on | Hero fallback, `.close` |
| `aperture-glow.webp` | Circular bloom | Telemetry, closing sections |
| `flare-column.webp` | Vertical flare | Page head corners |
| `deep-field.webp` | Diffuse starfield | Page head corners |
| `grid-horizon.webp` | Horizontal band | Statement plates |
| `hero-bleed.webp` | Wide bleed | Full-width bands |

### Video plates

Use `<LoopVideo>`, never a raw `<video>`. It gates on three conditions before fetching a byte —
`prefers-reduced-motion`, `Save-Data`/2G, and off-screen — because a background video is pure
decoration and must never cost a visitor who did not ask for it. The poster carries the composition
on every suppressed path.

```jsx
<LoopVideo className="hero-light" src="/void/hero-loop" poster="/void/hero-pause.webp"
           opacity={0.85} once pauseAt={4.2} />
```

`once` + `pauseAt` plays through and holds one frame — a background that restarts every eight
seconds pulls the eye back repeatedly.

### Textures

Two ambient textures stop pure black reading as an empty div. Both are optional; both are cheap.

- `.grain` — a fixed SVG noise overlay at 3.5% opacity. **Put it on the page root wrapper**:
  `<div className="grain">`. Every current page does.
- `.grid-bg` — a 72px hairline grid, radially masked so it fades out at the edges and never reads as
  a table. Add to hero and page-head sections.
- `.flow` — wrap a *run* of consecutive lower-page sections in `<div className="flow">` to give them
  one continuous ground (a soft tinted wash plus an 84px grid, both masked at top and bottom). The
  point is that it does not restart per section, so the page reads as one surface rather than a
  stack of unrelated blocks.

### WebGL field

`<FieldStage />` renders a white point cloud with a wireframe lattice. It is opt-in, lazy, and self
gating: no WebGL, or `prefers-reduced-motion`, and it renders nothing at all — no fallback needed,
because the plate behind it already carries the composition. White points only; a tinted shader
would break the §1 rule.

---

## 9. Motion

### Reveal on scroll

`<Reveal />` is already mounted in the root layout. It runs **one** document-level
`IntersectionObserver` over every `[data-r]` element, plus a `MutationObserver` so client-rendered
content is picked up. You never import it in a page.

```jsx
<div data-r>…</div>
<li data-r style={{ '--rd': `${i * 65}ms` }}>…</li>   {/* stagger */}
```

- `data-r` → hidden, 20px down. The observer sets `data-r="1"` → visible.
- `--rd` is the per-item delay. Stagger step is **50–80ms**; use `i * 65` as the default and never
  exceed ~5 items in a stagger, or the last one arrives after the reader does.
- **Reveal is one-way.** It never re-animates on scroll-up — that turns reading into a slideshow the
  reader cannot control.
- Reveal *section contents*, not whole sections. Put `data-r` on the `.sec-h` and on each grid item.

### On-load rise

Above-the-fold elements animate immediately instead of on scroll: `rise` (900ms, 18px) with an 80ms
stagger. Already applied to `.hero-*` and `.phead-*`. Use these classes rather than re-implementing.

### Hover and press

- Hover transitions: `var(--t-hover) var(--ease-out)`, always inside
  `@media (hover: hover) and (pointer: fine)`.
- Press: `scale(0.97)` on `:active`, `var(--t-press)`. For a JS-driven version that fires on
  pointer-down rather than click, use `usePressable()` from
  [`src/lib/apple-motion.js`](src/lib/apple-motion.js).
- Only ever transition `transform`, `opacity`, `background-color`, `border-color`, and `color`. The
  one sanctioned exception is `grid-template-rows: 0fr → 1fr` for accordions, which animates open
  height without measuring in JS.

### Scroll-linked

`useScrollProgress()` writes a `0→1` value to `--p` on the node as a **CSS custom property**, not
React state — state would re-render the subtree every frame. CSS reads the variable and the
compositor does the rest.

```jsx
const plate = useScrollProgress()
<section className="sec" ref={plate}>   /* .plate-img img { transform: scale(calc(1.04 + var(--p) * 0.08)) } */
```

### Reduced motion

Every animation in the system already has a `prefers-reduced-motion` branch. **A new animation
without one is a bug.** The house pattern is to swap movement for a short fade, not to remove
feedback entirely:

```css
@media (prefers-reduced-motion: reduce) {
  .your-thing { animation: fade 320ms var(--ease-out) both; }
}
```

---

## 10. Building a new page

### Step 1 — the view

`src/views/void/YourPage.jsx`. Add `'use client'` only if you need hooks or state.

```jsx
import Link from 'next/link'
import Nav from '@/components/void/Nav'
import Footer from '@/components/void/Footer'
import NextPage from '@/components/void/NextPage'
import Chevron from '@/components/apple/Chevron'

export default function YourPage() {
  return (
    <div className="grain">
      <Nav />

      <main id="main">
        {/* Page head */}
        <section className="phead grid-bg">
          <div className="phead-light" aria-hidden="true">
            <img src="/void/deep-field.webp" alt="" fetchPriority="high" decoding="async" />
          </div>
          <div className="shell phead-in">
            <p className="mono">Eyebrow</p>
            <h1 className="d1 phead-h">The headline.</h1>
            <p className="lede phead-l">One or two sentences of framing.</p>
          </div>
        </section>

        {/* First section — .sec-sm because it follows a .phead */}
        <section className="sec-sm">
          <div className="shell-wide">
            <header className="sec-h" data-r>
              <p className="mono">Section eyebrow</p>
              <h2 className="d2">Section headline. <span className="dim">Second clause.</span></h2>
            </header>

            <ul className="surfaces">
              {items.map((it, i) => (
                <li className="surface" key={it.k} data-r style={{ '--rd': `${i * 65}ms` }}>
                  <div className="surface-top">
                    <h3 className="h4">{it.k}</h3>
                  </div>
                  <p className="body">{it.b}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Closing statement */}
        <section className="close">
          <div className="close-img" aria-hidden="true">
            <img src="/void/aperture-glow.webp" alt="" loading="lazy" decoding="async" />
          </div>
          <div className="shell center">
            <h2 className="d2 measure" data-r>The closing line.</h2>
            <p className="lede measure-w close-l" data-r style={{ '--rd': '80ms' }}>
              One paragraph.
            </p>
            <div className="close-cta" data-r style={{ '--rd': '160ms' }}>
              <Link href="/contact" className="btn">Start a project <Chevron /></Link>
            </div>
          </div>
        </section>

        <NextPage href="/contact" title="Contact" />
      </main>

      <Footer />
    </div>
  )
}
```

### Step 2 — the route

`src/app/your-page/page.jsx`. Thin: metadata plus the view.

```jsx
import YourPage from '@/views/void/YourPage'

export const metadata = {
  title: 'Your Page',                        // becomes "Your Page — PulpLabs" via the template
  description: 'One sentence, ~155 chars, that would make sense as a search result.',
  alternates: { canonical: '/your-page' },
}

export default function Page() {
  return <YourPage />
}
```

### Step 3 — wire it up

1. Add to `LINKS` in [`src/components/void/Nav.jsx`](src/components/void/Nav.jsx) if it is top-level.
2. Add to the relevant column in [`src/components/void/Footer.jsx`](src/components/void/Footer.jsx).
3. Point the previous page's `<NextPage>` at it if it belongs in the loop.
4. Check [`src/app/sitemap.js`](src/app/sitemap.js) picks it up.

### What you must **not** do

- ❌ Import a stylesheet. `void.css` is global; a page-level import means you are forking the system.
- ❌ Mount `<Reveal />` or `<AIDock />` — the root layout already does, once.
- ❌ Add a skip link — the layout has one.
- ❌ Write a second `<main>` or omit `id="main"` — the skip link targets it.
- ❌ Use the legacy classes (`.page`, `.hero-inner`, `.card-body`, `.filter-chip`, `.blob`,
  `.section`). Those belong to the frozen fruit system and are not loaded on VOID routes.

### Content lives in `src/data/`

Copy, metrics and lists belong in [`src/data/`](src/data/), not inline in JSX, so a copy change never
touches markup. Several void views currently hold their content in module constants at the top of
the file — acceptable for page-specific copy, but anything shared across pages goes in `src/data/`.

---

## 11. Accessibility contract

Non-negotiable, and all of it is already honoured by the existing pages:

- **Focus** — `outline: 2px solid var(--signal); outline-offset: 3px` on every interactive element.
  Never remove an outline without replacing it. Inputs use a box-shadow ring instead, plus a border
  change.
- **Contrast** — `--w-2` (62%) on `--void` is the floor for body copy. `--w-3` (56%) is for
  supporting metadata, and `--w-4` (50%) for quieter secondary labels; both retain WCAG contrast
  on the black ground. The light theme raises those ink opacities to 68% and 60% so small labels
  retain the same standard on white surfaces. `prefers-contrast: more` raises them further.
- **Decorative imagery** — every plate carries `aria-hidden="true"` on the wrapper *and* `alt=""` on
  the image. Plates are never content.
- **Motion** — see §9. Every animation needs a reduced-motion branch.
- **Hover parity** — anything reachable only by hover must also be reachable by focus. Hover styles
  stay behind `@media (hover: hover) and (pointer: fine)`.
- **Accordions** — `aria-expanded` on the button, `aria-controls` → panel id, `role="region"` and
  `hidden` on the panel. See `.cat` in `Services.jsx`.
- **Live regions** — form confirmations use `role="status"`.
- **Landmarks** — `<nav aria-label="…">` on every nav (there are four on a page: Primary, Services,
  Company, Next page). `<main id="main">` exactly once.
- **Marquee** — `aria-hidden="true"`, pauses on hover, and becomes a plain scroll container under
  reduced motion. It is decoration; never put unique content in it.

---

## 12. Known gaps

Real issues found while writing this. None of them block building new pages, but all of them affect
whether new pages look uniform.

1. **The webfonts never load.** `void.css` asks for `Inter Tight` and `Berkeley Mono`; nothing in the
   App Router provides them, so every visitor gets the system fallback. The type scale's tracking
   values were tuned for Inter Tight's metrics. Either load it via `next/font` in the root layout
   (self-hosted, no layout shift) or update the stack to name the fallback honestly. Until then,
   `-apple-system` on macOS and `Segoe UI` on Windows are what people actually see — which is also
   why the site still looks coherent.

2. **`/blog`, `/case-studies` and `/admin` are still on the fruit system.** A visitor going from the
   black home page to the cream blog crosses a hard visual seam. Closing it means rebuilding
   `PostCard`, `Navbar`, `Footer` and `blog.css` against void tokens. Until then, do not link to the
   blog from a hero — the seam is least jarring from the footer.

3. **Dead code to delete.** Nothing imports these:
   `src/styles/apple.css`, `src/styles/stock-images.css`, `src/views/apple/*`,
   `src/views/{Home,Services,Team}.jsx`, `src/components/apple/{Nav,Footer}.jsx`,
   `src/components/{HeroCore,HeroStage,Aperture,ui,Telemetry,CaseCarousel}.jsx`, and the whole
   `dist/` directory (a stale Vite build of the pre-Next site). `src/components/apple/` should keep
   only `Reveal.jsx` and `Chevron.jsx` — both live — and be renamed, since "apple" no longer means
   anything here.

4. **`README.md`'s design system section is stale** — it documents the fruit era as if current.
   Replace it with a pointer to this file.

5. **`.close-in`** is used in `Services.jsx` and `Team.jsx` but has no CSS rule. Harmless no-op;
   drop it or define it.

6. **No radius tokens.** Seven radius values are in use by convention only (§2), so a new component
   can drift without anything catching it.

---

## Quick reference

```
GROUND    --void #000 · --raise-1/2/3  .035/.06/.09 white
INK       --w-1 #fff · --w-2 .62 · --w-3 .56 · --w-4 .50
LINES     --line-1 .08 · --line-2 .14 · --line-3 .24
MOTION    --ease-out · --t-press 120 · --t-hover 200 · --t-panel 260
LAYOUT    --shell 1140 · --shell-wide 1360 · --gutter 24 · --nav-h 64

TYPE      .d1 .d2 .d3 .h4 .lede .body .mono   modifiers: .dim
SECTION   .sec (90–168) · .sec-sm (56–96) · .sec-h · .center .measure .measure-w
CONTROLS  .btn · .btn-ghost · .link · .pill
PATTERNS  hairline grid (gap 1px + --line-1 bg + r16) · dense index (bordered rows)
PLATES    mix-blend-mode: screen + mask + opacity 0.28–0.90, parent isolate/overflow
MOTION    data-r + --rd stagger 65ms · rise on load · one-way reveal
TEXTURE   .grain (root) · .grid-bg (heads) · .flow (a run of sections)

RULE      Black and white only. Colour arrives through light imagery. Nothing else.
```
