/**
 * Builds — the open-source products and contributions PulpLabs works on.
 *
 * These are real repositories. `repository` is the canonical link and is what
 * the UI surfaces; where a field cannot be verified from the repository it is
 * left out rather than guessed. Where a project has no documentation set in
 * the Learn Lab, `docs` is null and the UI says so instead of linking nowhere.
 */

export const CATALOGUE_NOTE =
  'Every project here is a public repository. Where the Learn Lab has not written a documentation set yet, the project page links to the repository instead of pretending one exists.'

export const projects = [
  {
    slug: 'openlcm',
    name: 'OpenLCM',
    tagline: 'Unbounded memory. Bounded context.',
    category: 'Agent infrastructure',
    status: 'Active',
    repository: 'https://github.com/akshay-eng/OpenLCM',
    docs: 'openlcm',
    technologies: ['python', 'context-engineering', 'agent-loops'],
    description:
      'OpenLCM is a memory system for AI agents. Every message is stored verbatim in SQLite and compressed into a hierarchical summary structure, so an agent can recover any past moment while the context it actually sends stays inside a bounded window. It ships framework adapters, a set of agent-callable memory tools, and a live dashboard for inspecting the compression state.',
    problem:
      'Agents forget. A sliding window drops the decision made forty turns ago; summarisation loses it unpredictably; sending the whole history is unaffordable and eventually impossible. The usual result is an assistant that contradicts itself the longer you talk to it.',
    features: [
      {
        title: 'Verbatim message persistence',
        text: 'Every message is stored in SQLite with full-text search over it. Nothing is discarded to make room, so history remains auditable as well as recallable.',
      },
      {
        title: 'Hierarchical summary DAG',
        text: 'Leaf nodes compress into session-level summaries and then into durable history. Recall walks the structure rather than replaying a transcript, which is what keeps the context bounded.',
      },
      {
        title: 'Fact store',
        text: 'A persistent key-value memory for decisions, constraints and preferences — the facts that must survive compression rather than being paraphrased away.',
      },
      {
        title: 'Lossless Semantic Tree for code',
        text: 'Repositories are parsed into a code graph so an agent can navigate a codebase semantically instead of grepping through it.',
      },
      {
        title: 'Framework adapters',
        text: 'Built-in support for LangGraph, CrewAI, AutoGen, Google ADK and the OpenAI and Anthropic clients, so the memory layer is not a rewrite.',
      },
      {
        title: 'Agent-callable tools',
        text: 'Memory recall, history search, semantic search and code navigation are exposed as tools an agent can call directly, rather than as an API only the host application can reach.',
      },
    ],
    architecture: [
      {
        title: 'Pure Python, SQLite backend',
        text: 'No compiled extensions and no separate service to operate. It runs on macOS, Linux and Windows, and the store is a file you can inspect.',
      },
      {
        title: 'Compression as a directed graph',
        text: 'Summaries reference the nodes they compress, so any summary can be expanded back to the messages underneath it. That is what makes the compression recoverable rather than lossy.',
      },
      {
        title: 'Benchmarked, not asserted',
        text: 'The repository includes runs against long-context memory benchmarks, which is the right way to make a claim about recall quality.',
      },
    ],
    learn: [
      { label: 'Context strategy', href: '/learn/claude-certified-architect/context-strategy' },
      { label: 'Memory and state', href: '/learn/agent-systems-professional/agent-memory' },
      { label: 'The loop, and its bounds', href: '/learn/agent-systems-professional/agent-loop' },
      { label: 'Context engineering', href: '/technologies/context-engineering' },
    ],
    exams: ['agent-systems', 'claude-architect'],
  },

  {
    slug: 'wheatear',
    name: 'Wheatear',
    tagline: 'Migrating agents between orchestration platforms without a rebuild.',
    category: 'Migration accelerator',
    status: 'Active',
    repository: 'https://github.com/akshay-eng/Wheatear',
    docs: 'wheatear',
    technologies: ['orchestration', 'agent-loops', 'typescript'],
    description:
      'Wheatear is an accelerator for moving AI agents and workflows between orchestration platforms. It parses a source workflow into a canonical intermediate representation, then generates the target — turning what is normally a full rebuild into a reviewable, testable migration. Correctness-critical transformation is deterministic; model assistance is reserved for recovering intent that the source never stated.',
    problem:
      'Agent workflows are locked to the platform they were built on. Moving between Copilot Studio, watsonx Orchestrate, Vertex AI, Bedrock AgentCore, n8n or a code framework normally means re-deriving intent from a design nobody documented, then rebuilding and hoping the behaviour matches.',
    features: [
      {
        title: 'Canonical intermediate representation',
        text: 'Workflows are parsed into a platform-neutral IR of steps, tools, transitions and conditions. The IR is diffable, so a migration can be reviewed as a workflow rather than as generated code.',
      },
      {
        title: 'Deterministic where it matters',
        text: 'Structural transformation is deterministic. Model assistance is applied only to the genuinely ambiguous part — inferring intent where the source design left it implicit.',
      },
      {
        title: 'Multiple source and target platforms',
        text: 'One parser per source and one generator per target, rather than a bespoke path per pair.',
      },
      {
        title: 'Built for evaluation',
        text: 'The same case set can be run against source and target, so "it behaves the same" becomes a measurement instead of an assertion.',
      },
    ],
    architecture: [
      {
        title: 'Parse, transform, generate',
        text: 'Three stages with the IR as the seam. Adding a platform means adding a parser or a generator, not touching the middle.',
      },
      {
        title: 'Artefacts over adjectives',
        text: 'The project documents itself with real IR snippets and pipeline traces rather than diagrams of boxes — which is also the fastest way to judge whether it fits your workflow.',
      },
    ],
    learn: [
      { label: 'Portability and migration', href: '/learn/agent-systems-professional/agent-portability' },
      { label: 'Orchestration platforms', href: '/technologies/orchestration' },
      { label: 'Tools, MCP, and integration boundaries', href: '/learn/claude-certified-architect/integration-boundaries' },
    ],
    exams: ['agent-systems'],
  },

  {
    slug: 'zig',
    name: 'ZiG — Zen i Guess',
    tagline: 'On-device notification filtering, with the model running on your phone.',
    category: 'Mobile / on-device ML',
    status: 'Active',
    repository: 'https://github.com/prithvi-vasistha/zen-i-guess',
    docs: null,
    technologies: ['guardrails'],
    description:
      'ZiG intercepts Android notifications and decides which ones deserve your attention, entirely on the device. Deterministic rule layers run first — managed apps, a contacts whitelist, keyword rules — and anything they do not settle goes to an on-device classifier combined with a personal memory of your past overrides. Approved notifications are republished as high-priority alerts.',
    problem:
      'Notification filtering is a privacy problem before it is a machine-learning problem. Sending the contents of every notification to a server to decide whether it matters is exactly the trade most people would refuse if asked.',
    features: [
      {
        title: 'Everything stays on the device',
        text: 'Classification runs locally with TensorFlow Lite and an on-device text embedder. Notification content is not sent anywhere.',
      },
      {
        title: 'Rules before the model',
        text: 'Deterministic layers run first and settle most cases cheaply and predictably. Inference is what happens when the rules do not decide.',
      },
      {
        title: 'Personal memory',
        text: 'Embeddings of your past decisions are searched by nearest neighbour, so corrections change future behaviour rather than being forgotten.',
      },
      {
        title: 'Exact-match cache',
        text: 'A repeated notification replays your previous override instantly, without inference.',
      },
      {
        title: 'Full pipeline logging',
        text: 'Every decision is inspectable — which layer decided, and why. A filter you cannot audit is a filter you stop trusting.',
      },
    ],
    architecture: [
      {
        title: 'Kotlin UI, Rust engine',
        text: 'Jetpack Compose and Room on the Kotlin side; the filter engine and contact synchronisation are Rust, reached through JNI.',
      },
      {
        title: 'An ensemble, not a single model',
        text: 'A base text classifier is combined with the personal memory index, so the system is useful on day one and personalised by week two.',
      },
    ],
    learn: [
      { label: 'Guardrails & safety', href: '/technologies/guardrails' },
      { label: 'Evaluation', href: '/technologies/evaluation' },
    ],
    exams: ['responsible-ai'],
  },

  {
    slug: 'presoai',
    name: 'PresoAI',
    tagline: 'Generating presentations from a brief, as a proper pipeline rather than a prompt.',
    category: 'Applied AI product',
    status: 'In development',
    repository: 'https://github.com/akshay-eng/PresoAI',
    docs: null,
    technologies: ['typescript', 'structured-output', 'messages-api'],
    description:
      'PresoAI turns a brief into a deck. It is a TypeScript monorepo — a web application, shared packages and background workers — built around structured generation, image processing and a persisted document model, so a deck is an editable artefact rather than a one-shot output.',
    problem:
      'Asking a model for a presentation in one call produces something that looks plausible and cannot be revised. Useful generation needs structure: an outline that can be edited, slides that can be regenerated individually, and assets produced by a pipeline rather than described in prose.',
    features: [
      {
        title: 'Structured document model',
        text: 'Decks are persisted through an ORM rather than held as generated text, which is what makes per-slide regeneration and revision possible.',
      },
      {
        title: 'Background workers',
        text: 'Generation and rendering run as jobs rather than inside a request, so long work does not sit behind an HTTP timeout.',
      },
      {
        title: 'Server-side image pipeline',
        text: 'Image processing and canvas rendering happen on the server, with an ONNX runtime available for local inference where a hosted call would be wasteful.',
      },
    ],
    architecture: [
      {
        title: 'pnpm monorepo',
        text: 'A web app, shared packages and workers in one repository, with Docker compose for local development and database migrations checked in.',
      },
      {
        title: 'Jobs, not request-time generation',
        text: 'The unit of work is a job with a status, which is what allows retries, partial results and progress in the interface.',
      },
    ],
    learn: [
      { label: 'Structured output you can rely on', href: '/learn/claude-certified-developer/structured-json' },
      { label: 'Prompt caching and batch processing', href: '/learn/claude-certified-developer/caching-and-batching' },
      { label: 'Errors, rate limits and resilience', href: '/learn/claude-certified-developer/errors-and-retries' },
    ],
    exams: ['claude-developer'],
  },
]

export const projectBySlug = Object.fromEntries(projects.map((p) => [p.slug, p]))
