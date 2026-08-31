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
        text: 'Quoting was a bottleneck that looked like a staffing problem. It was not one.',
      },
      {
        type: 'pullquote',
        text: 'Quotes that took our team two days now go out in twenty minutes. The PulpLabs team understood our pricing rules better than some of our own hires.',
        name: 'Name Surname',
        role: 'Director, Power & Pack Solutions',
      },
      { type: 'h2', text: 'The situation' },
      {
        type: 'p',
        text: "Every shipment arrives with its own equipment dimensions, weights, handling requirements and packaging constraints. Turning those details into a crate specification and an accurate quote takes experienced people: somebody has to interpret the customer's request, decide the right materials and construction, and work out what it costs.",
      },
      {
        type: 'p',
        text: 'Much of the knowledge that makes those decisions correct lived in spreadsheets, in past quotes, and in the heads of a few long-serving members of the team. That is not a criticism of how the business was run — it is how most estimating functions grow. It did mean quoting was slow, inconsistent between estimators, and hard to scale beyond the people who held it.',
      },
      { type: 'h2', text: 'The problem' },
      {
        type: 'p',
        text: 'A request could sit waiting not because the work was hard, but because the one person who could price it confidently was busy with another one. Two customers asking for a similar crate could receive different numbers depending on who answered. Every new estimator had to acquire the rules by apprenticeship, because there was nowhere to read them.',
      },
      {
        type: 'p',
        text: 'The cost of that is easy to underrate. It is not only the quotes that go out late; it is the ones never chased, and the senior estimator spending an afternoon on a specification the rules could have priced without them.',
      },
      { type: 'h2', text: 'The insight' },
      {
        type: 'p',
        text: '**The rules were not ambiguous. They were undocumented.** Written down with the estimators, most of the work turned out to be deterministic — material selection, construction, handling class, cost build-up — with a much smaller set of genuinely judgement-based exceptions around it.',
      },
      {
        type: 'p',
        text: 'That split decided the whole design. The deterministic majority belongs in code, where it can be read, versioned and tested. What actually needed intelligence sat earlier: reading an unstructured request — an email, a spreadsheet, a photographed dimension sheet — into the shape those rules expect.',
      },
      { type: 'h2', text: 'What we built' },
      {
        type: 'p',
        text: 'Agentic workflows that sit around the existing quoting process rather than replacing it. They read the incoming request, structure it into a requirement, apply the estimating rules, and prepare a draft quote with its assumptions written out. What they cannot decide, they escalate — with the reason attached.',
      },
      {
        type: 'journey',
        label: 'From request to quote',
        steps: ['Request', 'Understand', 'Specify', 'Price', 'Review', 'Quote'],
      },
      {
        type: 'p',
        text: 'Nothing here removes the reviewer. The change is where the reviewer starts: from a drafted quote with its assumptions listed, rather than from an inbox and an empty spreadsheet.',
      },
      { type: 'h2', text: 'Who does what' },
      {
        type: 'duo',
        emphasis: 'right',
        left: {
          title: 'The workflow handles',
          items: [
            'Reading requests in whatever format they arrive in',
            'Extracting dimensions, weights and handling requirements',
            'Applying the documented estimating rules',
            'Building the cost line by line, with each rule cited',
            'Flagging what it could not decide, and why',
            'Drafting the quote for review',
          ],
        },
        right: {
          title: 'The estimators handle',
          items: [
            'The exceptions the rules deliberately escalate',
            'Judgement on unusual construction and handling',
            'The customer relationship and the negotiation',
            'Deciding when a rule itself needs to change',
            'Signing the quote — every one of them',
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
            'Request arrives in one of several formats',
            'Waits for an estimator who can price it',
            'Details re-keyed from an email into a spreadsheet',
            'Rules applied from memory and past quotes',
            'The number varies with who answered',
            'Quote goes out',
          ],
        },
        right: {
          title: 'After',
          items: [
            'Request arrives in one of several formats',
            'Details are extracted and structured immediately',
            'Documented rules are applied the same way every time',
            'Exceptions are raised with the reason attached',
            'A drafted quote reaches an estimator, assumptions listed',
            'An estimator reviews, adjusts and signs',
          ],
        },
      },
      { type: 'h2', text: 'What it was worth' },
      {
        type: 'p',
        text: 'The client reports quotes that took two days going out in twenty minutes. Beyond the turnaround, the estimating rules are now something the business owns outright: written down, versioned, and testable independently of anything we built. A new estimator can read them.',
      },
      {
        type: 'list',
        items: [
          '**The rules became an artefact.** Written down, versioned, and testable on their own.',
          '**Extraction is validated at the boundary.** A requirement that does not satisfy the schema never reaches the pricing rules.',
          '**Escalation is a rule, not a feeling.** What the workflow refuses to decide is defined in the same place as everything else it does.',
          '**A person still signs every quote.** The workflow drafts; it does not send.',
        ],
      },
      {
        type: 'p',
        text: 'The technology is the least interesting part of the outcome. What changed is that knowledge which used to live with a few people now lives in the business, and those people spend their time on the quotes that actually need them.',
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
    /* No quote here yet. The testimony Urban Ethnographers have published is
       about transcript coding, and attaching it to a story about qualifying
       enquiries would put words in their mouth about work it does not
       describe. The margin slot is ready for a line about this engagement
       when they give us one. */
    quote: null,
    body: [
      {
        type: 'p',
        text: 'The problem was never a shortage of enquiries. It was the amount of manual work between an enquiry arriving and an engagement beginning.',
      },
      { type: 'h2', text: 'The situation' },
      {
        type: 'p',
        text: 'Good opportunities do not always arrive as good briefs. An enquiry might describe a research question precisely, or it might describe a business worry and leave the research question to be discovered. It might name a timeline, a budget and a population, or none of the three. Two enquiries of equal value can look nothing like each other.',
      },
      {
        type: 'p',
        text: 'Before any of them can become an engagement, somebody has to read what arrived, work out what is really being asked, decide whether it is a fit, notice what is missing, ask for it, and keep the conversation moving while the answers come back.',
      },
      { type: 'h2', text: 'The problem' },
      {
        type: 'p',
        text: 'That reading and chasing was being done by the people whose judgement the firm sells. Interpreting an ambiguous enquiry is genuinely expert work; collecting a missing sample size and following it up twice is not, and both were landing on the same desks.',
      },
      {
        type: 'p',
        text: 'This is a capacity and process problem rather than a staffing one. Hiring another researcher adds capacity to the part that was never the constraint, and adds another person to the operational work around it. Meanwhile opportunities move at the speed of whoever last had time to look at them, and what is happening across all of them is hard to see at a glance.',
      },
      { type: 'h2', text: 'The insight' },
      {
        type: 'p',
        text: '**Their expertise was not the bottleneck. Getting to it was.** Every enquiry had to pass through hours of interpretation, structuring and chasing before an expert could apply the thing the client is actually paying for.',
      },
      {
        type: 'p',
        text: 'That is the point at which this becomes an AI problem rather than a hiring one. The groundwork is repetitive, high-volume and rule-shaped; the judgement at the end of it is neither.',
      },
      { type: 'h2', text: 'What we built' },
      {
        type: 'p',
        text: 'Custom agentic workflows that sit around the existing lead-to-engagement process. They do not replace a stage of it — they do the preparation each stage used to require, so a person arrives at a decision already able to make it.',
      },
      {
        type: 'journey',
        label: 'From enquiry to engagement',
        steps: ['Enquiry', 'Understand', 'Qualify', 'Prepare', 'Progress', 'Engagement'],
      },
      {
        type: 'p',
        text: 'An enquiry arriving in any shape is read and organised into the same structure as every other. What is missing is identified as missing rather than discovered three emails later. Fit is assessed against the firm\'s own criteria, and the opportunity arrives at a researcher as a picture rather than a thread.',
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
          title: 'The workflows handle',
          items: [
            'Understanding what an incoming enquiry is asking for',
            'Structuring it the same way every time',
            'Identifying what is missing before anyone chases it',
            'Assessing fit against the firm’s own criteria',
            'Coordinating the next step and keeping it moving',
            'Keeping every open opportunity visible',
          ],
        },
        right: {
          title: 'The researchers handle',
          items: [
            'Judgement about what is worth doing',
            'The client relationship, start to finish',
            'Research expertise and method',
            'Deciding the right approach for the question',
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
            'Follow-ups are repeated until answers come back',
            'Expert time is spent on coordination',
            'The opportunity progresses',
          ],
        },
        right: {
          title: 'After',
          items: [
            'Enquiry arrives',
            'It is understood and organised on arrival',
            'Gaps are identified and requested',
            'The opportunity is qualified against real criteria',
            'The team receives a clearer picture',
            'Experts join for the conversation that needs them',
            'The opportunity progresses',
          ],
        },
      },
      { type: 'h2', text: 'What it was worth' },
      {
        type: 'p',
        text: 'We are not putting numbers on this one. What the firm reports is operational: enquiries move faster from arrival to a decision about them, qualification is consistent rather than dependent on who read it first, and there is far less repetitive work sitting between an enquiry and the person who should see it.',
      },
      {
        type: 'list',
        items: [
          '**Less depends on individuals.** Routine processing no longer waits for a particular person to be free.',
          '**Qualification is consistent.** The same criteria are applied to every enquiry, in the same order.',
          '**Opportunities are visible.** What is open, and what each one is waiting for, can be seen without assembling it from inboxes.',
          '**Expert time moved.** It is spent on client conversations and research rather than on chasing detail.',
        ],
      },
      {
        type: 'p',
        text: 'The result is a lead-to-engagement process that scales with the volume of enquiries rather than with the number of experienced people available to read them — which is what makes growth a decision rather than a hiring problem.',
      },
      {
        type: 'p',
        text: '**The technology became invisible. The expertise became more available.** That was the whole objective, and it is the only part of this the client should have to care about.',
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
