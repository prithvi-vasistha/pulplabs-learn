# PulpLabs Learn Lab

Certification preparation for AI engineers: structured tracks, mock exams that report by topic and
point back at the lesson behind each gap, technology references, case studies and interviews from
real engagements, and documentation for the projects PulpLabs builds in the open.

## Run it

```bash
docker build -t pulplabs-learn .
docker run --rm -p 3000:3000 -v pulplabs-learn-db:/var/lib/postgresql/data pulplabs-learn
```

One container: Postgres, the content service and the UI. It creates the
cluster, applies the schema, seeds the content and comes up on
**http://localhost:3000**. The volume keeps the database across restarts; drop
it and the next boot rebuilds from the seed.

`docker-compose.yml` runs the same three processes as three containers, which
is the shape to deploy — Postgres becomes a managed instance, and the service
and UI scale separately.

### Without Docker

```bash
npm install && (cd service && npm install)

# postgres somewhere, then
DATABASE_URL=postgres://localhost/learn npm start --prefix service   # :4000
CONTENT_API_URL=http://localhost:4000 npm run dev                    # :3000
```

Requires Node 20+. The UI's only runtime dependencies are `next`, `react` and
`react-dom`; the service's is `pg`.

---

## Architecture

```
browser ──▶ Next.js (UI)  ──▶ service (JSON over HTTP) ──▶ Postgres
                                    │
                              the only process that
                              ever reads an answer key
```

Three processes, one image. The split matters for one reason above the others:
`questions.correct` and `questions.explanation` are columns the candidate
routes do not select, so the answer key is not stripped in transit — it never
enters the process that renders the page.

**`src/data/*.js` is still the authoring source.** It is readable, reviewable
and diffable in a way a SQL dump is not. `npm run export:content` turns it into
`service/seed/content.json`, and the service seeds from that on every boot.
Content travels one way:

```
src/data/*.js  →  service/seed/content.json  →  postgres  →  service  →  UI
```

Schema and seed are both idempotent, so a cold start and a restart take the
same path — the path that runs in production is the one exercised in
development. `npm run seed:prune` is the only thing that deletes.

### The database

Anything *queried* — slugs, levels, relationships, topics — is a column.
Anything *authored* — a lesson body, a doc page, a feature list — is JSONB.
Normalising block-structured prose into rows buys nothing: it is always read
whole, never filtered on, and its shape is already validated by the renderer.

### Why the pages are dynamic

Every data route is `force-dynamic` and every fetch is `no-store`. Edit a row,
reload, see it. Prerendering the catalogue would need Postgres up during
`next build` and would go stale the moment anything changed — which is the
opposite of what putting content in a database is for.

---

## Design — one system, two properties

**[`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md) is the authority**, and the marketing site is the reference
implementation.

- **`src/styles/void.css` is a byte-for-byte copy of `pulplabsmainsite/src/styles/void.css`.** It is
  never edited here. Keeping the two in sync is a file copy, in that direction.
- **`src/styles/learn.css`** is everything the Learn Lab adds: the reader, the exam surface, the docs
  layout, the dashboard, and the generalised hairline grid and dense index from §6.
- **`public/void/`** holds the same light plates and hero loop as the marketing site. The colour on
  every page comes from those images and from nowhere else (§1).
- `Nav`, `Footer` and `NextPage` are the marketing site's components with different destinations —
  same mark, same material, same sheet, same hand-off row.

Two rules shape the code:

- **No hue anywhere.** Syntax highlighting is weight and opacity (`src/lib/highlight.js` emits
  tokens; `.t-key`, `.t-str`, `.t-com` style them). Difficulty is three hairline bars. Correct and
  incorrect answers are distinguished by border, fill, and words.
- **Every hover is gated** behind `@media (hover: hover) and (pointer: fine)`, and every animation
  has a `prefers-reduced-motion` branch.

### There is no landing page

`/` is the academy, not a page about it. The band above the catalogue is
deliberately short and the first section carries no top padding of its own,
because the certifications are the product: three course cards are readable at
1280×720 without scrolling.

### Generated covers, not one photograph

`src/lib/covers.js` derives a palette and four blurred shapes from an item's
slug, and `Cover.jsx` renders them as inline SVG — server-side, no client JS, no
image request. A new lesson has cover art the moment it has a name.

Eight families, each defined twice: a soft pastel on paper and a deeper, more
saturated reading of the same hues on black. **Colour lives only in the covers.**
The interface around them stays achromatic, which is what keeps a grid of them
reading as a catalogue rather than as noise.

### Themes

The system's colour comes entirely from spectral plates `screen`-blended onto
black, which on a light ground produces nothing at all. So the light theme is
not a palette inversion — it inverts the *mechanic*: the same photographs are
read as pigment rather than light (`invert(1) hue-rotate(180deg)` under
`multiply`), which is what `--plate-blend` and `--plate-filter` express.

Two states, resolved in `src/lib/theme.js`: **Dark** is the default for
everyone and **Light** is opted into and remembered (`data-theme="light"` on
`<html>`). The OS preference is deliberately not consulted — there is no
`prefers-color-scheme` rule in either stylesheet — so the product looks the
same to a first-time visitor whatever their machine is set to.

`THEME_SCRIPT` is inlined in `<head>` ahead of any stylesheet. Resolving the
theme in an effect instead would paint one frame of the wrong ground on every
navigation, and a black flash is exactly what a light-theme reader is escaping.

The palette lives in `void.css` and was authored in the marketing site, so both
properties change together — a light-capable portal beside a dark-only site is
the uniformity problem in a new form.

### Two deliberate deviations, both documented in the code

**No webfont is loaded.** §12.1 of the design document notes that Inter Tight and Berkeley Mono are
named but never fetched, so the marketing site renders in the system stack. Loading them here — and
only here — would make the two properties look different side by side. Load them in both, in the
same commit, or in neither.

**Three class names could not be reused.** The system defines `.num` as a display numeral, `.stack`
as a hairline grid container, and `.nums` as a three-column statistic band. The Lab needs a
small-text tabular numeral, a chip row, and a four-column band, so it adds `.tnum`, `.tags` and
`.stat-band` rather than redefining the originals.

---

## Architecture

```
src/
├── app/          routes only — metadata, params, and a view
├── views/void/   page composition
├── components/
│   ├── void/     the design system: Nav, Footer, NextPage, LoopVideo, Reveal, Icons
│   └── learn/    product components: reader, exam, docs, dashboard, search
├── data/         content entities
├── lib/          content API, exam engine, progress store, highlighting, motion
└── styles/       void.css (copied) + learn.css (this product)
```

### Four sections, not six

Technologies is an axis through Learn rather than a sibling of it, and Builds
and Docs were two names for the same four objects — which is why the old docs
index had to list *absences* to explain why it was shorter. A project now owns
its documentation (`/projects/<project>/<page>`), and `/builds/*` and `/docs/*`
redirect permanently.

A technology page is the cross-type hub: every lesson, exam, project, guide and
case study that touches the subject, in one list, type first. Those joins always
existed in the data; `technologyJoins()` in `src/lib/content.js` is what finally
surfaces them.

Search is navigation, not a shortcut. `CommandPalette` sits in the nav on every
page, opens on `/` or `⌘K`, groups results by type and fetches the index once
from `/api/search-index` — so visitors who never search pay nothing for it.

Every index page carries a `JumpBar` under its head: what is on the page and how
much of it there is, so a reader can choose without first reading the lede.

### Content is modelled, not duplicated

Every entity is defined once and referenced by slug everywhere else. A lesson is authored in
`src/data/lessons/*.js` and surfaced from the track page, the technology page, search, the
dashboard, exam recommendations and related links — always by reference.

```
Technology ──┬── Track ── Module ── Lesson ── Exercise
             ├── MockExam ── Question ── Topic ──→ links back to a Lesson
             └── Build ── DocumentationSet ── DocumentationPage
```

`src/lib/content.js` is the only thing pages talk to. Every accessor was `async` from the start on
the bet that "replacing the imports with `fetch` does not touch a single call site" — that bet was
collected when the content moved to Postgres, and no page component changed.

Lessons and documentation share one block model (`p`, `h2`, `h3`, `list`, `code`, `callout`,
`table`, `figure`, `steps`, `quote`) and one renderer (`components/learn/Prose.jsx`). That is why a
lesson and a documentation page are typographically identical.

### The assessment engine

`service/src/content.js` owns both halves: `getCandidateExam()` runs a query that does not select
`correct` or `explanation`, and `gradeAttempt()` is the only query that does.

Answers are **not** in the browser during an attempt, and they are not in the web process either.
Submission calls a server action (`src/app/exams/actions.js`) which asks the service to grade, and
gets back the result with explanations attached. Adding a question bank means adding rows.

### Progress

Explicitly modelled as `not_started | in_progress | completed` per lesson, with track progress
**derived** from lesson completion — never stored, never invented. Attempts are stored whole so
results can be reopened.

Storage is `localStorage`, and the product says so wherever progress appears. There is no
authentication and nothing is uploaded; `src/lib/progress-store.js` isolates the two functions an
API would replace.

---

## Content

Four preparation tracks, 24 lessons, six mock exams, 66 questions, 15 technology references, seven
field entries, four builds and two documentation sets.

| Track | Level | Lessons |
| --- | --- | --- |
| Claude Certified Architect | Advanced | 6 |
| Claude Certified Developer | Intermediate | 6 |
| RAG Systems Specialist | Intermediate | 6 |
| Agent Systems Professional | Advanced | 6 |

### The catalogue

`/learn` is a visual catalogue rather than a list, following the product structure of a course
platform: filter by level, search across tracks *and* individual lessons, and a "start here" card
for readers who do not know which track they want.

The card covers are the system's own light plates (§8) — screened onto black, masked into the card,
one per track — because the design system has no illustration budget and no second colour. That is
also why a grid of them reads as a catalogue rather than as repeated furniture.

### Field

`/field` holds client case studies, write-ups of how a PulpLabs engagement is actually run, and
recorded interviews. Interviews carry a video; see below.

### Video

`components/learn/VideoEmbed.jsx` renders a facade, not an iframe. Nothing reaches the video host —
no request, no cookie — until the reader activates it, which is the same principle `LoopVideo`
applies to our own bytes. YouTube loads through the privacy-enhanced domain, the facade is a real
`<button>` so it works from the keyboard, and `provider: 'file'` plays a self-hosted source instead.

`video.id` of `null` is a real state, not a bug: the recording does not exist yet, and the frame
says so rather than showing a play button that does nothing. Set the id in `src/data/field.js` and
the embed appears everywhere that entry is surfaced.

**Adding content.** A lesson is an entry in `src/data/lessons/` plus its slug in a module in
`src/data/paths.js` — route, navigation, previous/next, search and progress all follow. An exam is a
bank in `src/data/exams/` exported from `index.js`; give each question a `topic` and map every topic
in `topicLinks` to the lesson that covers it, because that map is what turns a score into a study
list.

---

## Honesty notes

- **These are independent preparation tracks.** PulpLabs is not a certification body and is not
  affiliated with any awarding organisation. No official blueprint, question bank or scoring rule is
  reproduced, and no track claims a pass rate. `DISCLOSURE` in `src/data/paths.js` is rendered on
  the home page and on every track page.
- **The mock exams are practice papers written by PulpLabs**, not official questions and not a
  predictor of a real result.
- **The builds are real repositories**, linked directly. Where the Learn Lab has not written a
  documentation set for one — ZiG and PresoAI — the project page links to the repository and the
  docs index lists the absence rather than implying coverage.
- **The documentation sets are conceptual guides** written here. Each one says so, and points at the
  repository as the authority on exact API signatures.
- **Field entries name a client only where PulpLabs already names them publicly.** Quoted testimony
  is reproduced as published, including the `Name Surname` attribution placeholders the marketing
  site uses, and no metric appears that is not already published. Engagement entries describe
  PulpLabs' own published engagement model and carry no client claims at all. The rules are written
  at the top of `src/data/field.js`.
- **One sample video is wired up** — a third-party talk on the interview's own subject, so the
  player can be seen working end to end. It carries `external: true` and a credit, and the frame
  says "Sample — third-party video on the same subject" so it never reads as a PulpLabs recording.
  Every other `video.id` is still null and renders the "not published" state.
- **Client marks are generated placeholders**, never an approximation of a real logo — a wrong
  version of somebody's mark is worse than an obvious stand-in. Drop a real file in `public/logos/`
  and set `logo:` on the entry to replace it.
- **Progress and attempts are browser-local.** No account exists, and the interface never implies
  one.

---

## Verified

Checked in a real browser at 390px, 768px and 1440px across every route, and side by side against
the marketing site at matching viewports:

- No console errors, no page errors, no broken routes, and no page that scrolls sideways.
- Exam flow end to end: start, answer, flag, navigate, confirm, server grading, results, retake —
  with an assertion that no answer key reaches the attempt page's HTML.
- Progress persistence: completing a lesson updates the track page and the dashboard.
- One `h1` and one `main` per page, no heading-level skips, no duplicate ids, every control has an
  accessible name, every decorative image has `alt=""`, and focus rings are present on tab stops.
- Mobile navigation is the system's sheet: it locks scroll, closes on Escape, and returns focus.
- **The containerised stack, end to end**: the image builds, boots Postgres, applies the schema,
  seeds 15 technologies / 4 courses / 24 lessons / 6 exams / 66 questions / 4 projects / 20 doc
  pages / 7 field entries, and serves every route. A restart reuses the volume and reseeds
  idempotently.
- **The answer key is not in the attempt page** — asserted against the rendered HTML of the running
  container, and the candidate API response carries only `id, type, topic, difficulty, prompt,
  options`.
- Rendered counts match the seed on every index page.
- The video facade contacts no video host before activation, is keyboard-operable, and loads a
  titled `youtube-nocookie.com` embed on demand — asserted in a browser, not assumed.
- **Both themes**, across every route and viewport: the ground is actually painted, the toggle
  moves Dark → Light → Dark, the stored choice survives a reload, `data-theme` is already correct
  at first paint, and an OS set to light still renders the dark default.
- Light-theme contrast measured against the rendered ground with alpha composited: body 7.3:1,
  mono and breadcrumbs 5.1:1 — `--w-3` was raised from 0.54 to 0.62 because it measured 3.94:1.
- The command palette opens on `/` and `⌘K`, groups across content types, moves with the arrow
  keys, opens with Enter, traps Tab, and closes on Escape from anywhere in the dialog.
- The marketing site builds and renders in both themes with the same toggle, from the same
  `void.css`.
