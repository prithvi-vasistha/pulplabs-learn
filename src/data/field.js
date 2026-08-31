/**
 * Field — case studies, engagements and interviews.
 *
 * HONESTY NOTE — read before editing.
 *
 * Client work is the easiest thing in a product like this to overstate, so the
 * rules here are strict:
 *
 *  1. Client names appear only where PulpLabs already publishes them on
 *     pulplabs.ai. Nothing here introduces a customer who is not already named
 *     publicly.
 *  2. Quoted testimony is reproduced as it is published, including the
 *     `Name Surname` attribution placeholders the main site uses. Do not invent
 *     a person to attach a quote to.
 *  3. No metric appears here that is not already published. Where an engagement
 *     write-up would normally carry numbers, it describes the shape of the work
 *     instead.
 *  4. `video.id` is null until a real recording exists. The player renders an
 *     explicit "not published" state rather than an empty frame — set the id and
 *     the embed appears everywhere the entry is surfaced.
 *
 * Engagement entries describe PulpLabs' own published engagement model, so they
 * carry no client-specific claims at all.
 */

export const FIELD_NOTE =
  'Client entries reproduce only what PulpLabs already publishes. Interview recordings appear here once they are released.'

export const KINDS = ['Case study', 'Engagement', 'Interview']

export const fieldEntries = [
  {
    slug: 'quote-turnaround',
    kind: 'Case study',
    title: 'Quote turnaround, from two days to twenty minutes',
    client: 'Power & Pack Solutions',
    /* The client's own mark, the same file the marketing site shows, on the
       ground it was drawn for. Never recoloured: a trademark repainted to fit
       our palette stops being the trademark. `small` because the artwork is
       143x39 of real detail — scaling it up only produces a bigger blur. */
    logo: '/logos/client-pps.webp',
    logoGround: '#f8f8f8',
    logoShape: 'small',
    // Sampled from the artwork, not guessed — the same value the marketing
    // site's clients.js carries, so one company reads the same on both.
    logoAccent: '222, 0, 13',
    sector: 'Manufacturing · Power and packaging',
    summary:
      'A quoting workflow that depended on a handful of people holding the pricing rules in their heads, rebuilt so the rules live in the system and the people review the output.',
    published: '2026-03-04',
    minutes: 6,
    plate: 'grid-horizon',
    video: null,
    facts: [
      { k: 'Engagement', v: 'Discovery, then build' },
      { k: 'Shape', v: 'Operational accelerator' },
      { k: 'Deployment', v: 'Inside the client estate' },
    ],
    quote: {
      text: 'Quotes that took our team two days now go out in twenty minutes. The PulpLabs team understood our pricing rules better than some of our own hires.',
      name: 'Name Surname',
      role: 'Director, Power & Pack Solutions',
    },
    body: [
      {
        type: 'p',
        text: 'Quoting was a bottleneck that looked like a staffing problem. Requests arrived in several formats, pricing depended on rules that existed mostly as institutional memory, and every quote waited for one of a small number of people who could apply them correctly.',
      },
      {
        type: 'h2',
        text: 'What the discovery found',
      },
      {
        type: 'p',
        text: 'The rules were not ambiguous — they were undocumented. Once written down they were largely deterministic, with a smaller set of genuinely judgement-based exceptions. That split is the whole design: the deterministic majority belongs in code, and the model\'s job is reading an unstructured request into the shape those rules expect.',
      },
      {
        type: 'figure',
        caption: 'Where the model sits, and where it does not',
        art: `inbound request (email, spreadsheet, PDF)
        ↓
extract to a structured requirement        ← model, schema-constrained
        ↓
apply pricing rules                        ← ordinary code, deterministic
        ↓
flag exceptions for a human                ← rules decide what escalates
        ↓
draft quote for review                     ← a person still signs it`,
      },
      {
        type: 'p',
        text: 'Nothing about this removes the reviewer. The change is that the reviewer starts from a drafted quote with its assumptions listed, rather than from an inbox.',
      },
      {
        type: 'h2',
        text: 'What made it stick',
      },
      {
        type: 'list',
        items: [
          '**The rules became an artefact.** Written down, versioned, and testable independently of the model.',
          '**Extraction was validated at the boundary.** A requirement that does not satisfy the schema is escalated, not guessed at.',
          '**Exceptions were designed first.** The interesting cases were the ones the old process handled by asking someone — those became explicit escalation paths.',
          '**It runs inside their estate.** Deployment matters to a business whose pricing is competitive information.',
        ],
      },
      {
        type: 'callout',
        kind: 'note',
        title: 'The lesson that generalises',
        text: 'Most "AI workflow" projects are two projects: writing down a process nobody had written down, and then automating the deterministic part of it. The second is easy once the first is done.',
      },
    ],
    learn: [
      { label: 'Structured output you can rely on', href: '/learn/claude-certified-developer/structured-json' },
      { label: 'Designing tools an agent can use', href: '/learn/agent-systems-professional/tool-design' },
      { label: 'Evaluation and rollout', href: '/learn/claude-certified-architect/evaluation-and-rollout' },
    ],
    technologies: ['structured-output', 'evaluation', 'guardrails'],
  },

  {
    slug: 'research-coding',
    kind: 'Case study',
    title: 'Keeping a research coding framework, losing the tagging',
    client: 'Urban Ethnographers',
    // Yellow is the mark's own ground, in both themes — the navy wordmark is
    // invisible on our black and nearly so on our paper.
    logo: '/logos/client-ue.webp',
    logoGround: '#f6c809',
    logoAccent: '246, 200, 9',
    sector: 'Research · Urban ethnography',
    summary:
      'Qualitative researchers were spending their time applying a coding framework to transcripts by hand. The framework stayed theirs; the repetitive application did not.',
    published: '2026-04-22',
    minutes: 5,
    plate: 'deep-field',
    video: null,
    facts: [
      { k: 'Engagement', v: 'Discovery, then build' },
      { k: 'Shape', v: 'Research acceleration' },
      { k: 'Constraint', v: 'The framework must not drift' },
    ],
    quote: {
      text: 'Our researchers stopped tagging transcripts and started interpreting them. The coding framework is still ours — the machine just keeps up with it now.',
      name: 'Name Surname',
      role: 'Principal, Urban Ethnographers',
    },
    body: [
      {
        type: 'p',
        text: 'A qualitative coding framework is a research instrument. It is developed deliberately, it evolves slowly, and its consistency is what makes findings comparable across a study. Any system that quietly reinterprets it is worse than no system.',
      },
      {
        type: 'h2',
        text: 'The constraint that shaped everything',
      },
      {
        type: 'p',
        text: 'The framework had to remain the researchers\'. That ruled out an approach where the model invents its own categories from the data, and it made the codebook the specification rather than the training data — the categories, their definitions, and their boundary cases are the prompt.',
      },
      {
        type: 'h2',
        text: 'How drift was kept visible',
      },
      {
        type: 'list',
        items: [
          '**Every applied code carries the passage it came from**, so a researcher can check the application rather than trust it.',
          '**A held-out set of researcher-coded transcripts** is the evaluation set. Agreement with the humans is the metric, per code, not overall.',
          '**Codebook changes re-run the set.** A refined definition that improves one code and degrades two is visible before it is adopted.',
          '**Disagreements are surfaced, not resolved.** Where the model and the codebook are in tension, that is a finding about the codebook.',
        ],
      },
      {
        type: 'callout',
        kind: 'warning',
        title: 'What this deliberately does not do',
        text: 'It does not discover themes, and it does not merge codes it judges similar. Both are research decisions, and a system that made them would be making claims the researchers had not.',
      },
    ],
    learn: [
      { label: 'Prompt engineering', href: '/technologies/prompt-engineering' },
      { label: 'Measuring retrieval separately', href: '/learn/rag-systems-specialist/rag-evaluation' },
      { label: 'Evaluation', href: '/technologies/evaluation' },
    ],
    technologies: ['prompt-engineering', 'evaluation', 'structured-output'],
  },

  {
    slug: 'discovery',
    kind: 'Engagement',
    title: 'Discovery: finding out where AI pays back',
    client: null,
    sector: 'How PulpLabs engages',
    summary:
      'A structured audit of a workflow, the data behind it, and what a win would measurably look like — before anything is built and before anyone commits to a scope.',
    published: '2026-01-15',
    minutes: 5,
    plate: 'flare-column',
    video: null,
    facts: [
      { k: 'Typical length', v: 'Weeks, not months' },
      { k: 'Output', v: 'A scope, a timeline, an estimate' },
      { k: 'Decision', v: 'Including "do not build this"' },
    ],
    body: [
      {
        type: 'p',
        text: 'Discovery exists to answer one question honestly: is there a workflow here where a model earns its cost, and what would have to be true for that to hold? A discovery that concludes "not yet" is a successful discovery.',
      },
      {
        type: 'h2',
        text: 'What gets audited',
      },
      {
        type: 'table',
        head: ['Area', 'What we are looking for'],
        rows: [
          ['The workflow', 'Who does it, how often, what the variation actually is'],
          ['The data', 'Whether it exists, whether it is reachable, and who may see it'],
          ['The rules', 'What is deterministic and undocumented versus genuinely judgement-based'],
          ['The failure cost', 'What happens when the system is wrong, and who notices'],
          ['The measure', 'What a win looks like as a number that already exists'],
        ],
      },
      {
        type: 'p',
        text: 'The last row is the one that most often ends a project early, and it should. If nobody can say what improvement would look like in a number the business already tracks, there is nothing to evaluate against later.',
      },
      {
        type: 'h2',
        text: 'What comes out',
      },
      {
        type: 'p',
        text: 'A fixed scope, a timeline and an estimate built from the requirement rather than from a rate card — and, where the answer is that the workflow is not ready, what would have to change first.',
      },
    ],
    learn: [
      { label: 'Choosing a model for the workload', href: '/learn/claude-certified-architect/model-selection' },
      { label: 'Evaluation and rollout', href: '/learn/claude-certified-architect/evaluation-and-rollout' },
    ],
    technologies: ['evaluation', 'claude'],
  },

  {
    slug: 'build-and-evaluate',
    kind: 'Engagement',
    title: 'Build and evaluate: weekly increments, gates before production',
    client: null,
    sector: 'How PulpLabs engages',
    summary:
      'Delivery in weekly increments with evaluation gates, so quality is a measurement rather than an opinion by the time anything touches production.',
    published: '2026-01-29',
    minutes: 5,
    plate: 'aperture-glow',
    video: null,
    facts: [
      { k: 'Cadence', v: 'Weekly increments' },
      { k: 'Gate', v: 'Evaluation before production' },
      { k: 'Handover', v: 'Your code, your documentation' },
    ],
    body: [
      {
        type: 'p',
        text: 'The failure mode of an AI build is not that it does not work — it is that nobody can say whether it works better than last week. Evaluation is therefore the first deliverable rather than the last.',
      },
      {
        type: 'steps',
        items: [
          '**Week one produces an evaluation set**, drawn from real inputs, before there is anything to evaluate.',
          '**Each increment reports against it**, per tag rather than as one average.',
          '**A gate before production**: no case regresses, and the production signal that matters has been agreed.',
          '**Rollout is staged** behind a flag, compared live, and reversible by configuration.',
          '**Handover is the plan**, not an afterthought: your code, your documentation, your team trained on it.',
        ],
      },
      {
        type: 'callout',
        kind: 'note',
        title: 'Why the evaluation set comes first',
        text: 'It is the artefact that outlives the engagement. Long after the delivery team has gone, it is what tells the client whether a prompt change, a model upgrade or a new corpus made things better.',
      },
      {
        type: 'p',
        text: 'Managed operation afterwards is available and optional. The default assumption is that the client owns and runs what was built.',
      },
    ],
    learn: [
      { label: 'Evaluation and rollout', href: '/learn/claude-certified-architect/evaluation-and-rollout' },
      { label: 'Cost, latency and reliability', href: '/learn/claude-certified-architect/cost-latency-reliability' },
    ],
    technologies: ['evaluation', 'guardrails'],
  },

  {
    slug: 'agent-migration',
    kind: 'Engagement',
    title: 'Agent migration: moving workflows off a platform',
    client: null,
    sector: 'How PulpLabs engages',
    summary:
      'Recovering evaluation sets from production traces, translating workflows through a canonical representation, and proving equivalence before any traffic moves.',
    published: '2026-05-20',
    minutes: 6,
    plate: 'hero-bleed',
    video: null,
    facts: [
      { k: 'Accelerator', v: 'Wheatear' },
      { k: 'First deliverable', v: 'Evaluation sets' },
      { k: 'Switch', v: 'Staged, on evidence' },
    ],
    body: [
      {
        type: 'p',
        text: 'A platform migration is usually presented as a code problem and is almost always an intent problem: the workflow encodes decisions nobody wrote down, and the risk is changing them without noticing.',
      },
      {
        type: 'h2',
        text: 'Sequence',
      },
      {
        type: 'steps',
        items: [
          'Inventory every workflow and its dependants. A meaningful share are usually dormant and do not need migrating at all.',
          'Recover evaluation sets from production traces — without them, equivalence is an opinion.',
          'Translate through a canonical intermediate representation rather than rebuilding, so the migration is reviewable as a workflow.',
          'Shadow-run against live traffic with side effects disabled.',
          'Switch a share of traffic, compare production signals, then move the rest.',
        ],
      },
      {
        type: 'p',
        text: 'The parts that never transfer — connectors, managed memory, identity and secrets — are named at inventory time, because they are the difference between an estimate and a surprise.',
      },
      {
        type: 'callout',
        kind: 'note',
        title: 'The accelerator is open',
        text: 'The intermediate representation and pipeline are [Wheatear](/projects/wheatear), which is public. The engagement is the migration; the tool is not the deliverable.',
      },
    ],
    learn: [
      { label: 'Portability and migration', href: '/learn/agent-systems-professional/agent-portability' },
      { label: 'Orchestration platforms', href: '/technologies/orchestration' },
    ],
    technologies: ['orchestration', 'agent-loops'],
  },

  {
    slug: 'memory-that-lasts',
    kind: 'Interview',
    title: 'Memory that lasts longer than the context window',
    client: null,
    sector: 'Engineering interview',
    summary:
      'A conversation about why agents forget, what a summary DAG buys over a running summary, and the design decisions behind OpenLCM.',
    published: null,
    minutes: 28,
    plate: 'aperture-glow',
    /* SAMPLE VIDEO — not a PulpLabs recording.
       A third-party talk on the same subject, wired up so the player can be
       seen working end to end. `external: true` makes the interface say so on
       the frame, because an unlabelled third-party video sitting under a
       PulpLabs interview heading would read as ours. Replace `id` with the
       real recording and drop `external`/`credit` when the edit is done. */
    video: {
      provider: 'youtube',
      id: 'YL8KsWTlCKI',
      external: true,
      credit: 'Sample — third-party video on the same subject',
      title: 'Solving Claude Code’s short-term memory problem',
      duration: '28 min',
      note: 'Our own recording publishes once the edit is finished.',
    },
    people: [{ name: 'Name Surname', role: 'Engineering, PulpLabs' }],
    facts: [
      { k: 'Format', v: 'Recorded conversation' },
      { k: 'Length', v: '28 minutes' },
      { k: 'Project', v: 'OpenLCM' },
    ],
    body: [
      {
        type: 'p',
        text: 'The starting point of the conversation is a complaint every team building assistants eventually makes: the thing contradicts itself the longer you talk to it, and the length of the conversation predicts the failure better than its difficulty does.',
      },
      {
        type: 'h2',
        text: 'Topics covered',
      },
      {
        type: 'list',
        items: [
          'Why a sliding window fails silently, and why that is worse than failing loudly.',
          'What a running summary loses on each rewrite, and why the loss is invisible at the time.',
          'The summary DAG: compressing into a graph so any summary can be expanded back to what was said.',
          'Which facts deserve promotion to a durable store, and who decides.',
          'What a memory system owes the person whose conversation it holds.',
        ],
      },
      {
        type: 'callout',
        kind: 'note',
        title: 'Read it instead',
        text: 'The same ground is covered in writing by the memory lessons and the OpenLCM guide, both linked below.',
      },
    ],
    learn: [
      { label: 'Context strategy', href: '/learn/claude-certified-architect/context-strategy' },
      { label: 'Memory and state', href: '/learn/agent-systems-professional/agent-memory' },
      { label: 'OpenLCM — the memory model', href: '/projects/openlcm/memory-model' },
    ],
    technologies: ['context-engineering', 'agent-loops'],
  },

  {
    slug: 'evaluation-first',
    kind: 'Interview',
    title: 'Why the evaluation set is the first deliverable',
    client: null,
    sector: 'Delivery interview',
    summary:
      'On writing the measurement before the system, what a good golden set looks like, and how to tell a real improvement from a moved average.',
    published: null,
    minutes: 22,
    plate: 'flare-column',
    video: {
      provider: 'youtube',
      id: null,
      title: 'Why the evaluation set is the first deliverable',
      duration: '22 min',
      note: 'Scheduled. The recording appears here when it is published.',
    },
    people: [{ name: 'Name Surname', role: 'Delivery, PulpLabs' }],
    facts: [
      { k: 'Format', v: 'Recorded conversation' },
      { k: 'Length', v: '22 minutes' },
      { k: 'Theme', v: 'Evaluation and rollout' },
    ],
    body: [
      {
        type: 'p',
        text: 'Most delivery arguments about AI features are really arguments about evidence. This conversation is about producing the evidence first, so the argument does not need to happen.',
      },
      {
        type: 'h2',
        text: 'Topics covered',
      },
      {
        type: 'list',
        items: [
          'Why fifty real inputs beat five hundred invented ones.',
          'Choosing a grader that matches the task, and the known biases of a model judge.',
          'Reporting per tag, and why an average can rise while the product gets worse.',
          'Gating a rollout on a production signal the offline set cannot see.',
          'Turning every incident into a permanent case.',
        ],
      },
    ],
    learn: [
      { label: 'Evaluation and rollout', href: '/learn/claude-certified-architect/evaluation-and-rollout' },
      { label: 'Evaluation', href: '/technologies/evaluation' },
      { label: 'AI Engineering Foundations — mock exam', href: '/exams/ai-foundations' },
    ],
    technologies: ['evaluation'],
  },
]

export const fieldBySlug = Object.fromEntries(fieldEntries.map((e) => [e.slug, e]))
