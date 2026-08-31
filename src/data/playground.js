/**
 * Playground demos.
 *
 * Every demo here runs for real. There is no recorded output and no canned
 * response: the service computes each result from the inputs, which is the
 * only kind of demo worth signing in for.
 *
 * The engines are deliberately deterministic — lexical retrieval, a token
 * budget, a keyword router. A demo that called a model would cost money per
 * click, need a key we cannot ship, and teach less: the failure modes below
 * are the ones people actually hit, and they are easier to see when nothing
 * is stochastic.
 *
 * `spec` is the private half — corpora, answer keys, grading rules. The
 * service never sends it to a browser; the same boundary the exam answer key
 * lives behind. `preview` is what a reader may see before running anything.
 */

export const PLAYGROUND_NOTE =
  'Demos run on a shared instance with a 45-minute lease. Nothing you type is kept after the lease ends, and no third-party model is called — every result is computed in our own service.'

export const demos = [
  {
    slug: 'retrieval-lab',
    status: 'live',
    title: 'Retrieval lab',
    tagline: 'Watch a retriever succeed, and watch it fail for reasons you can name.',
    kind: 'Sandbox',
    engine: 'retrieval',
    summary:
      'A small corpus and a BM25 ranker. Query it, change the ranking parameters, and see the scores that produced the answer — including the queries where lexical matching has nothing to offer.',
    minutes: 8,
    technologies: ['retrieval', 'embeddings'],
    brief: [
      'Most retrieval bugs are not model bugs. They are a query whose terms do not appear in the corpus, a chunk that split a definition away from its term, or a ranker whose length normalisation is fighting the document mix.',
      'This lab makes that visible. Every result carries the term-by-term contribution that produced its score, so a bad answer has an explanation rather than a shrug.',
    ],
    controls: {
      query: 'how do I stop the retriever returning irrelevant chunks',
      k: 5,
      expand: false,
      b: 0.75,
      k1: 1.2,
    },
    learn: [
      { label: 'Reading a retrieval system’s failure modes', href: '/articles/retrieval-failures' },
      { label: 'Retrieval', href: '/technologies/retrieval' },
    ],
    spec: {
      synonyms: {
        rag: ['retrieval', 'augmented', 'generation'],
        embedding: ['vector', 'embeddings'],
        chunk: ['chunking', 'passage', 'segment'],
        eval: ['evaluation', 'evals', 'grading'],
        latency: ['slow', 'p95', 'timeout'],
        hallucination: ['fabricated', 'invented', 'unsupported'],
      },
      corpus: [
        {
          id: 'c1',
          title: 'Chunking splits definitions from their terms',
          source: 'Field note — discovery',
          text: 'A fixed 500-token split will regularly separate a term from the sentence that defines it. The chunk containing the definition scores badly for the term, because the term is in the previous chunk. Overlap of 10 to 15 percent fixes most of it; splitting on headings fixes more.',
        },
        {
          id: 'c2',
          title: 'Lexical retrieval cannot match what is not written',
          source: 'Article — retrieval failures',
          text: 'BM25 scores the words present in the query against the words present in the document. If a user asks about irrelevant results and the corpus only ever says precision or noise, the retriever returns nothing useful and reports a confident zero.',
        },
        {
          id: 'c3',
          title: 'Length normalisation and the b parameter',
          source: 'Reference — BM25',
          text: 'The b parameter controls how hard BM25 penalises long documents. At b equals zero, length is ignored and long documents dominate. At b equals one, normalisation is full and short documents win. Mixed corpora — a one-line FAQ next to a manual — are where this hurts.',
        },
        {
          id: 'c4',
          title: 'Term frequency saturation',
          source: 'Reference — BM25',
          text: 'The k1 parameter decides how quickly repeated terms stop helping. Low k1 means the second occurrence of a term adds almost nothing. High k1 lets keyword-stuffed documents climb the ranking, which is exactly what a spam page is built to exploit.',
        },
        {
          id: 'c5',
          title: 'Hybrid retrieval is two rankings, not one',
          source: 'Lesson — retrieval design',
          text: 'Running a vector search and a keyword search and fusing the ranks with reciprocal rank fusion recovers most of what either misses alone. The fusion constant matters less than people expect; the recall of each leg matters far more.',
        },
        {
          id: 'c6',
          title: 'Reranking is where the budget goes',
          source: 'Lesson — retrieval design',
          text: 'A cross-encoder reranker over the top fifty candidates usually buys more accuracy than a better first-stage retriever, and it costs latency in exactly the place a user notices. Measure the p95 before you promise it.',
        },
        {
          id: 'c7',
          title: 'Irrelevant results usually mean a recall problem',
          source: 'Field note — evaluation first',
          text: 'When a system returns irrelevant chunks, teams reach for a better ranker. Half the time the right chunk was never a candidate: the retriever pulled ten passages and the answer lived in the eleventh. Raise k, measure recall at k, then rerank.',
        },
        {
          id: 'c8',
          title: 'Stale indexes fail silently',
          source: 'Field note — memory that lasts',
          text: 'An index that is rebuilt nightly answers yesterday’s questions with yesterday’s documents and no error. Write the index build time into every response payload during development; you will find the stale ones in a day.',
        },
        {
          id: 'c9',
          title: 'Metadata filters beat clever queries',
          source: 'Lesson — retrieval design',
          text: 'If a question is about one customer, filter to that customer before ranking anything. A filter is exact, cheap and explainable, and it removes the class of failure where a confident answer comes from the wrong tenant’s data.',
        },
        {
          id: 'c10',
          title: 'Evaluation sets should come from production',
          source: 'Article — evals from production',
          text: 'Queries invented by the team cluster around what the team already knows works. The queries that break a retriever are the ones real users type: misspelled, abbreviated, three words long, and about something the documentation never quite says.',
        },
        {
          id: 'c11',
          title: 'Embeddings drift when the model changes',
          source: 'Reference — vector databases',
          text: 'Vectors from two different embedding models are not comparable. Re-embedding the corpus is the only migration; a partial re-embed leaves a index where distance means two different things and recall quietly collapses.',
        },
        {
          id: 'c12',
          title: 'Citations are a retrieval feature, not a prose feature',
          source: 'Lesson — grounded answers',
          text: 'If the generator has to guess which passage supported which sentence, it will guess wrong often enough to matter. Pass ids through the prompt and require them in the output structure, then check them mechanically.',
        },
        {
          id: 'c13',
          title: 'Latency budget for a retrieval call',
          source: 'Field note — build and evaluate',
          text: 'A p95 of 400 milliseconds for first-stage retrieval, 250 for the rerank, and whatever is left for generation. If the retriever is slow, users learn to avoid the feature long before anyone files a ticket about quality.',
        },
        {
          id: 'c14',
          title: 'Hallucination is usually missing context',
          source: 'Article — retrieval failures',
          text: 'A model asked a question with no supporting passage in the prompt will answer anyway. Most fabricated answers in a retrieval system are a recall failure wearing a generation costume — check what was retrieved before you blame the model.',
        },
      ],
      preview: {
        corpusSize: 14,
        sources: ['Field notes', 'Articles', 'Lessons', 'Reference'],
        samples: [
          'why is my retriever returning irrelevant chunks',
          'what does the b parameter do',
          'is hallucination a model problem',
          'quarterly revenue forecast',
        ],
      },
    },
  },

  {
    slug: 'context-budget',
    status: 'live',
    title: 'Context budget planner',
    tagline: 'Decide what to cut before the model decides for you.',
    kind: 'Lab',
    engine: 'budget',
    summary:
      'Paste a prompt, set a window and a reserve, and see the arithmetic: what fits, what is evicted, and how much of the window the instructions are quietly eating.',
    minutes: 6,
    technologies: ['prompt-engineering', 'context-engineering'],
    brief: [
      'A context window is a budget with a hard ceiling and no overdraft. Every token spent on a system prompt is a token unavailable for retrieved context, and every token spent on context is one unavailable for the answer.',
      'This lab does the arithmetic in front of you. Nothing here is a model call — it is counting, which is precisely the part teams skip.',
    ],
    controls: {
      text: 'Answer the customer question using only the passages provided. Cite the passage id for every claim. If the passages do not contain the answer, say so and stop.',
      // Opens slightly over the window on purpose: the first run should show
      // eviction happening, not a comfortable margin.
      window: 8000,
      reserve: 1500,
      system: 600,
      history: 2400,
      chunk: 400,
      overlap: 40,
      topK: 10,
    },
    learn: [
      { label: 'Treat the context window as a budget', href: '/articles/context-window-budget' },
      { label: 'Prompt engineering', href: '/technologies/prompt-engineering' },
    ],
    spec: {
      preview: {
        note: 'Token counts are estimated with a character-and-word heuristic, not a tokeniser. It runs within a few percent of BPE on English prose and is wrong on code, JSON and non-Latin scripts — which is itself the point.',
      },
    },
  },

  {
    slug: 'router-evals',
    status: 'live',
    title: 'Routing eval harness',
    tagline: 'Write a classifier as rules, then find out what it costs you.',
    kind: 'Lab',
    engine: 'evals',
    summary:
      'Twelve real-shaped support tickets with held-back labels. Write keyword rules, run them, and read accuracy, per-label recall, and every case you got wrong.',
    minutes: 10,
    technologies: ['evaluation', 'guardrails'],
    brief: [
      'Before a routing problem is worth a model, it is worth a baseline. A keyword rule takes ten minutes and sets the number any model has to beat — and the exercise of writing it tells you whether your labels mean anything.',
      'The labels are held on the server until you run. You are grading a real prediction against a real key, not marking your own homework.',
    ],
    controls: {
      rules: {
        billing: 'invoice, refund, charge, card, price',
        bug: 'error, crash, broken, 500, fails',
        access: 'login, password, sso, locked, permission',
        feature: 'would like, feature, support for, roadmap',
      },
      fallback: 'bug',
      caseSensitive: false,
    },
    learn: [
      { label: 'Your evaluation set should come from production', href: '/articles/evals-from-production' },
      { label: 'Evaluation', href: '/technologies/evaluation' },
    ],
    spec: {
      labels: ['billing', 'bug', 'access', 'feature'],
      /*
       * Three of these are written to defeat the keyword rules the demo ships
       * with — a bug report full of billing words, and two tickets that match
       * no rule at all and fall through to the default. A starting point that
       * already scores 100% would teach nothing; this one opens at 75% and the
       * work is finding out why.
       */
      cases: [
        { id: 't1', text: 'Charged twice for the July invoice, please refund the duplicate.', label: 'billing' },
        { id: 't2', text: 'Export button throws a 500 every time on the reports page.', label: 'bug' },
        { id: 't3', text: 'SSO redirect loops back to the login screen for our whole team.', label: 'access' },
        { id: 't4', text: 'Any chance of a Slack integration on the roadmap this year?', label: 'feature' },
        { id: 't5', text: 'Card on file expired and the retry failed — how do we update it?', label: 'billing' },
        { id: 't6', text: 'App is broken since this morning, nothing loads past the spinner.', label: 'bug' },
        { id: 't7', text: 'Locked out after too many attempts, need a password reset.', label: 'access' },
        { id: 't8', text: 'We would like support for exporting to Parquet as well as CSV.', label: 'feature' },
        { id: 't9', text: 'Price went up mid-term and the invoice totals do not add up.', label: 'billing' },
        { id: 't10', text: 'Card charge at checkout returns a 500 since the upgrade.', label: 'bug' },
        { id: 't11', text: 'Nobody on the team can get into the shared workspace since yesterday.', label: 'access' },
        { id: 't12', text: 'Can you add an audit trail showing who exported what, and when?', label: 'feature' },
      ],
      preview: {
        cases: 12,
        labels: ['billing', 'bug', 'access', 'feature'],
        note: 'Ticket text is shown before you run; the label for each one is revealed with your result.',
      },
    },
  },
  /*
   * Planned. These are rows like any other, marked `planned`, so the service
   * refuses to lease an instance for one and the card does not pretend to be a
   * link. Announcing them is deliberate: the playground is three demos today,
   * and a reader deciding whether this portal is worth returning to should be
   * able to see where it is going. Nothing here claims a date, because we do
   * not have one.
   */
  {
    slug: 'chunking-lab',
    title: 'Chunking lab',
    tagline: 'Split the same document five ways and watch which answers survive.',
    kind: 'Sandbox',
    engine: 'chunking',
    status: 'planned',
    summary:
      'Fixed windows, sentence boundaries, headings, recursive splits and semantic grouping over one document — with the retrieval scores each strategy produces side by side.',
    minutes: 10,
    technologies: ['retrieval', 'embeddings'],
    brief: [
      'Most retrieval failures are decided at chunk time, long before anything is ranked. This will let you make that decision badly on purpose and see what it costs.',
    ],
    controls: {},
    learn: [{ label: 'Retrieval', href: '/technologies/retrieval' }],
    spec: {},
  },
  {
    slug: 'tool-schema-sandbox',
    title: 'Tool schema sandbox',
    tagline: 'Write a tool definition, then see which calls it invites and which it forbids.',
    kind: 'Lab',
    engine: 'tools',
    status: 'planned',
    summary:
      'A schema editor with a validator behind it: required fields, enums, defaults and descriptions, checked against a set of calls a model would plausibly attempt.',
    minutes: 12,
    technologies: ['tool-use', 'structured-output'],
    brief: [
      'A tool is a contract written for a reader that does not ask questions. This will show which parts of yours are ambiguous before a model finds out for you.',
    ],
    controls: {},
    learn: [{ label: 'Tool use', href: '/technologies/tool-use' }],
    spec: {},
  },
  {
    slug: 'guardrail-bench',
    title: 'Guardrail bench',
    tagline: 'Run a policy against the prompts that are meant to break it.',
    kind: 'Lab',
    engine: 'guardrails',
    status: 'planned',
    summary:
      'A written policy, a set of adversarial prompts, and a report of what got through — the same shape as the routing eval harness, pointed at safety rather than accuracy.',
    minutes: 12,
    technologies: ['guardrails', 'evaluation'],
    brief: [
      'A guardrail nobody has attacked is a guardrail nobody has tested. This will attack yours with the prompts that usually work.',
    ],
    controls: {},
    learn: [{ label: 'Guardrails', href: '/technologies/guardrails' }],
    spec: {},
  },
]

export const playgroundBySlug = Object.fromEntries(demos.map((d) => [d.slug, d]))
