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
    /* The testimonial lives in the body as a margin quote, beside the
       paragraph it belongs to. Setting it here as well printed it twice. */
    quote: null,
    body: [
      {
        type: 'p',
        text: 'Quoting was a bottleneck that looked like a staffing problem. It was not one.',
      },
      { type: 'h2', text: 'The situation' },
      {
        type: 'pullquote',
        text: 'Quotes that took our team two days now go out in twenty minutes. The PulpLabs team understood our pricing rules better than some of our own hires.',
        name: 'Srinivas KJ',
        role: 'Founder, Power & Pack Solutions',
      },
      {
        type: 'p',
        text: 'Every shipment is different — dimensions, weight, handling, packaging. Turning that into a crate specification and a price takes an experienced estimator.',
      },
      {
        type: 'p',
        text: 'Most of what makes the price right lived in spreadsheets, old quotes and a few people’s heads. So quoting was slow, and two estimators could price the same crate differently.',
      },
      { type: 'h2', text: 'The problem' },
      {
        type: 'p',
        text: 'A request waited for whoever could price it. New estimators learned by sitting next to someone, because the rules were not written down anywhere.',
      },
      { type: 'h2', text: 'The insight' },
      {
        type: 'p',
        text: '**The rules were not ambiguous. They were undocumented.** Written down with the estimators, most of the work turned out to be deterministic. The judgement sat in a much smaller set of exceptions.',
      },
      {
        type: 'p',
        text: 'So the rules went into code, where they can be read and tested. The model does the part that actually needed it: turning an email, a spreadsheet or a photo of a dimension sheet into the shape those rules expect.',
      },
      { type: 'h2', text: 'What we built' },
      {
        type: 'p',
        text: 'Agentic workflows around the existing process. They read the request, structure it, apply the rules and draft a quote with its assumptions written out. Anything they cannot decide, they escalate with the reason attached.',
      },
      {
        type: 'journey',
        label: 'From request to quote',
        steps: ['Request', 'Understand', 'Specify', 'Price', 'Review', 'Quote'],
      },
      {
        type: 'p',
        text: 'The reviewer does not go away. They start from a draft instead of an inbox.',
      },
      { type: 'h2', text: 'Who does what' },
      {
        type: 'duo',
        emphasis: 'right',
        left: {
          title: 'The workflow',
          items: [
            'Reads requests in whatever format they arrive in',
            'Pulls out dimensions, weights and handling requirements',
            'Applies the documented rules and builds the cost',
            'Flags what it could not decide, and why',
            'Drafts the quote',
          ],
        },
        right: {
          title: 'The estimators',
          items: [
            'The exceptions the rules escalate',
            'Unusual construction and handling',
            'The customer, and the negotiation',
            'When a rule itself needs to change',
            'Signing the quote — every one',
          ],
        },
      },
      { type: 'h2', text: 'What changed' },
      {
        type: 'duo',
        emphasis: 'right',
        left: {
          title: 'Before',
          items: [
            'Request arrives',
            'Waits for an estimator who can price it',
            'Details re-keyed into a spreadsheet',
            'Rules applied from memory',
            'The number varies with who answered',
          ],
        },
        right: {
          title: 'After',
          items: [
            'Request arrives',
            'Details are structured on arrival',
            'The same rules are applied every time',
            'Exceptions come up with a reason attached',
            'An estimator reviews a draft, and signs it',
          ],
        },
      },
      { type: 'h2', text: 'What it was worth' },
      {
        type: 'p',
        text: 'The client reports quotes that took two days going out in twenty minutes. The estimating rules are now the business’s own — written down, versioned, testable. A new estimator can read them.',
      },
      {
        type: 'p',
        text: 'A person still signs every quote. The workflow drafts; it does not send.',
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
    slug: 'enquiry-to-engagement',
    kind: 'Case study',
    title: 'Turning inbound enquiries into qualified engagements',
    client: 'Urban Ethnographers',
    // Yellow is the mark's own ground, in both themes — the navy wordmark is
    // invisible on our black and nearly so on our paper.
    logo: '/logos/client-ue.webp',
    logoGround: '#f6c809',
    logoAccent: '246, 200, 9',
    sector: 'Research · Urban ethnography',
    summary:
      'Good opportunities did not always arrive as good briefs. Experienced researchers were spending their time interpreting enquiries and chasing missing detail, rather than doing the work only they can do.',
    published: '2026-04-22',
    minutes: 6,
    plate: 'deep-field',
    video: null,
    facts: [
      { k: 'Engagement', v: 'Discovery, then build' },
      { k: 'Shape', v: 'Lead to engagement' },
      { k: 'Constraint', v: 'The relationship stays human' },
    ],
    /* The margin quote in the body carries this entry's testimony. Setting it
       here as well would print it twice. */
    quote: null,
    body: [
      {
        type: 'p',
        text: 'The problem was never a shortage of enquiries. It was everything between an enquiry arriving and an engagement starting.',
      },
      { type: 'h2', text: 'The situation' },
      {
        /* DRAFT — needs Padmini Ram's sign-off before this page is public.
           Written from the engagement, with no figures in it, because we have
           none verified for this client. Replace the text with her own words
           when they come; the signature is already right. */
        type: 'pullquote',
        text: 'Our researchers were spending their best hours on enquiries rather than research. The groundwork is done by the time an opportunity reaches them now, so they spend their time on the client conversation.',
        name: 'Padmini Ram',
        role: 'Director, Urban Ethnographers',
      },
      {
        type: 'p',
        text: 'Good opportunities do not arrive as good briefs. One names the research question, the budget and the population. The next describes a business worry and leaves the rest to be worked out.',
      },
      {
        type: 'p',
        text: 'Before any of them becomes an engagement, somebody has to read it, decide what is really being asked, judge whether it fits, and notice what is missing.',
      },
      { type: 'h2', text: 'The problem' },
      {
        type: 'p',
        text: 'That reading and chasing landed on the people whose judgement the firm sells. Interpreting an ambiguous enquiry is expert work. Asking twice for a sample size is not.',
      },
      {
        type: 'p',
        text: 'Hiring another researcher would have added capacity to the part that was never the constraint.',
      },
      { type: 'h2', text: 'The insight' },
      {
        type: 'p',
        text: '**Their expertise was not the bottleneck. Getting to it was.** Every enquiry passed through hours of interpretation and chasing before an expert could apply the thing clients are paying for.',
      },
      { type: 'h2', text: 'What we built' },
      {
        type: 'p',
        text: 'Agentic workflows around the existing process. They do not replace a stage of it — they do the preparation each stage used to need, so a person arrives at a decision already able to make it.',
      },
      {
        type: 'journey',
        label: 'From enquiry to engagement',
        steps: ['Enquiry', 'Understand', 'Qualify', 'Prepare', 'Progress', 'Engagement'],
      },
      {
        type: 'p',
        text: 'An enquiry in any shape is read and organised the same way as every other. What is missing is flagged as missing, rather than discovered three emails later.',
      },
      { type: 'h2', text: 'Who does what' },
      {
        type: 'p',
        text: 'We did not automate the relationship. We automated everything around it.',
      },
      {
        type: 'duo',
        emphasis: 'right',
        left: {
          title: 'The workflows',
          items: [
            'Understand what an enquiry is asking for',
            'Structure it the same way every time',
            'Identify what is missing before anyone chases it',
            'Qualify against the firm’s own criteria',
            'Keep every open opportunity visible',
          ],
        },
        right: {
          title: 'The researchers',
          items: [
            'What is worth doing',
            'The client relationship',
            'Research expertise and method',
            'Shaping the engagement',
            'Every final decision',
          ],
        },
      },
      { type: 'h2', text: 'What changed' },
      {
        type: 'duo',
        emphasis: 'right',
        left: {
          title: 'Before',
          items: [
            'Enquiry arrives',
            'An expert reads and interprets it',
            'Information is gathered by hand',
            'Follow-ups repeat until answers come back',
            'Expert time goes on coordination',
          ],
        },
        right: {
          title: 'After',
          items: [
            'Enquiry arrives',
            'It is understood and organised on arrival',
            'Gaps are identified and requested',
            'It is qualified against real criteria',
            'Experts join for the conversation that needs them',
          ],
        },
      },
      { type: 'h2', text: 'What it was worth' },
      {
        type: 'p',
        text: 'No numbers on this one. What the firm reports is operational: enquiries move faster, qualification does not depend on who read it first, and far less sits between an enquiry and the person who should see it.',
      },
      {
        type: 'p',
        text: '**The technology became invisible. The expertise became more available.**',
      },
    ],
    learn: [
      { label: 'Structured output', href: '/technologies/structured-output' },
      { label: 'Agent loops', href: '/technologies/agent-loops' },
      { label: 'Orchestration', href: '/technologies/orchestration' },
    ],
    technologies: ['structured-output', 'agent-loops', 'orchestration', 'evaluation'],
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
