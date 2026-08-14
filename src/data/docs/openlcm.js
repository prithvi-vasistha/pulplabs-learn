/**
 * Documentation for OpenLCM, written by the Learn Lab.
 *
 * This is a conceptual guide: what the pieces are, why they exist, and how to
 * reason about them. The repository is the authority on exact API signatures
 * and current options — every page says so where it matters.
 */

export const openlcmDocs = {
  slug: 'openlcm',
  name: 'OpenLCM',
  tagline: 'Unbounded memory. Bounded context.',
  version: 'Learn Lab guide',
  versionNote:
    'Written by the Learn Lab as a conceptual guide. Check the repository README for exact signatures, options and the current release.',
  repository: 'https://github.com/akshay-eng/OpenLCM',
  groups: [
    {
      title: 'Getting started',
      pages: [
        {
          slug: 'introduction',
          title: 'Introduction',
          summary: 'What OpenLCM is for, and the failure it exists to remove.',
          body: [
            {
              type: 'p',
              text: 'OpenLCM is a memory layer for AI agents. It stores every message verbatim and compresses that history into a hierarchical structure, so an agent can recall any past moment while the context it actually sends stays inside a bounded window.',
            },
            {
              type: 'h2',
              text: 'The failure it removes',
            },
            {
              type: 'p',
              text: 'Long conversations outgrow the context window. The three usual responses each lose something: a sliding window drops old turns silently, summarisation loses specifics unpredictably, and sending everything is unaffordable and eventually impossible. The visible symptom is an assistant that contradicts a decision made forty turns ago.',
            },
            {
              type: 'table',
              head: ['Approach', 'History', 'Context size', 'Recall'],
              rows: [
                ['Sliding window', 'Lost', 'Bounded', 'Recent turns only'],
                ['Summarise as you go', 'Paraphrased', 'Bounded', 'Whatever the summariser kept'],
                ['Send everything', 'Complete', 'Unbounded', 'Complete, until it will not fit'],
                ['OpenLCM', 'Complete, verbatim', 'Bounded', 'Any moment, on demand'],
              ],
            },
            {
              type: 'h2',
              text: 'What you get',
            },
            {
              type: 'list',
              items: [
                '**Message persistence** — every message stored in SQLite with full-text search over it.',
                '**A summary DAG** — leaf nodes compressed into session summaries and then into durable history.',
                '**A fact store** — decisions, constraints and preferences held as addressable facts rather than left in prose.',
                '**A code graph** — repositories parsed into a semantic tree so agents can navigate code rather than grep it.',
                '**Framework adapters** — LangGraph, CrewAI, AutoGen, Google ADK, and the OpenAI and Anthropic clients.',
                '**Agent-callable tools** — recall and search exposed to the agent, not only to the host application.',
              ],
            },
            {
              type: 'callout',
              kind: 'note',
              title: 'When you do not need this',
              text: 'A single-turn task, or an assistant whose conversations are short by design, does not need a memory layer. Reach for it when history is long, when decisions made earlier must bind later behaviour, or when you need history to be auditable.',
            },
          ],
        },
        {
          slug: 'installation',
          title: 'Installation',
          summary: 'Install from PyPI; the store is a SQLite file.',
          body: [
            {
              type: 'p',
              text: 'OpenLCM is pure Python with a SQLite backend — no compiled extensions and no separate service to run. It works on macOS, Linux and Windows.',
            },
            {
              type: 'code',
              lang: 'bash',
              code: `pip install openlcm

# or with uv
uv add openlcm`,
            },
            {
              type: 'p',
              text: 'The store is a file. That is a deliberate property rather than a limitation: it can be inspected with ordinary SQLite tooling, copied, and committed to a fixture for tests.',
            },
            {
              type: 'callout',
              kind: 'warning',
              title: 'Treat the store as production data',
              text: 'It contains the full text of every message. Apply the same retention, redaction and access rules you would apply to any conversation log — see Privacy and retention.',
            },
            {
              type: 'p',
              text: 'For exact version requirements and optional extras, check the repository README — this guide deliberately does not restate them, because they change.',
            },
          ],
        },
        {
          slug: 'quick-start',
          title: 'Quick start',
          summary: 'Record a conversation, then recall from it without replaying the transcript.',
          body: [
            {
              type: 'p',
              text: 'The shape of every integration is the same: record messages as they happen, and ask for context when you are about to call the model. What comes back is bounded; what is stored is not.',
            },
            {
              type: 'code',
              lang: 'python',
              file: 'assistant.py',
              code: `from openlcm import Memory

memory = Memory(path="./conversations.db", session="customer-4471")

# Record as the conversation happens — verbatim, nothing dropped.
memory.add("user", "We moved off the legacy plan last year.")
memory.add("assistant", "Noted — I'll use the current plan for pricing.")

# Ask for context at call time, with a token budget you control.
context = memory.context(query=question, budget=4_000)

reply = client.messages.create(
    model=MODEL,
    max_tokens=1024,
    system=SYSTEM,
    messages=[*context.messages, {"role": "user", "content": question}],
)`,
            },
            {
              type: 'p',
              text: 'The `budget` argument is the important one. It is what makes context a bounded input rather than a growing one, and it is where the compression structure earns its place — the layer decides what to include, expand or summarise to fit.',
            },
            {
              type: 'callout',
              kind: 'note',
              title: 'Signatures',
              text: 'Argument names and return shapes are illustrative. Check the repository for the current API before writing an integration against it.',
            },
          ],
        },
      ],
    },
    {
      title: 'Concepts',
      pages: [
        {
          slug: 'memory-model',
          title: 'The memory model',
          summary: 'Three layers — messages, summaries, facts — and which question each answers.',
          body: [
            {
              type: 'p',
              text: 'OpenLCM separates memory into three layers because they answer different questions. Conflating them is what makes home-grown memory systems drift.',
            },
            {
              type: 'table',
              head: ['Layer', 'Answers', 'Retention'],
              rows: [
                ['Messages', '"What exactly was said?"', 'Verbatim, permanent'],
                ['Summaries', '"What happened in this session?"', 'Derived, regenerable'],
                ['Facts', '"What is true and binding now?"', 'Explicit, superseded rather than appended'],
              ],
            },
            {
              type: 'figure',
              caption: 'Complete history, bounded context',
              art: `every message        →  stored verbatim, full-text indexed
       ↓ compress
session summaries    →  one per session
       ↓ compress
durable history      →  the long arc
       ↓ select
this turn's context  →  facts + relevant summaries + recent turns`,
            },
            {
              type: 'p',
              text: 'Only the bottom row is sent to the model. Everything above it is available, and any summary can be expanded back to the messages beneath it — which is what makes the compression recoverable rather than lossy.',
            },
          ],
        },
        {
          slug: 'summary-dag',
          title: 'The summary DAG',
          summary: 'Why compression is a graph rather than a running summary.',
          body: [
            {
              type: 'p',
              text: 'A running summary rewritten on every turn accumulates drift: each rewrite is a paraphrase of a paraphrase, and there is no way back to what was actually said. OpenLCM compresses into a directed acyclic graph instead, where every node records the nodes it compresses.',
            },
            {
              type: 'list',
              items: [
                '**Leaf nodes** cover a small span of messages.',
                '**Session nodes** compress the leaves of one session.',
                '**Durable nodes** compress sessions into the long arc of the relationship.',
              ],
            },
            {
              type: 'h2',
              text: 'Why the edges matter',
            },
            {
              type: 'p',
              text: 'Because each node points at what it summarises, recall can start broad and descend. An agent asked about a decision can read the durable layer, identify the session, and expand to the exact messages — spending context only where it is needed rather than paying for detail up front.',
            },
            {
              type: 'callout',
              kind: 'note',
              title: 'Regenerable by design',
              text: 'Summaries are derived, so improving the summarisation prompt does not mean losing history. Messages are the source of truth; the DAG can be rebuilt.',
            },
          ],
        },
        {
          slug: 'fact-store',
          title: 'The fact store',
          summary: 'The facts that must survive compression, held as addressable keys.',
          body: [
            {
              type: 'p',
              text: 'Some statements must bind future behaviour regardless of how old they are: a plan the customer is on, a constraint they stated, a correction they issued. Those do not belong in prose that a summariser is free to paraphrase away.',
            },
            {
              type: 'code',
              lang: 'python',
              code: `memory.facts.put("billing.plan", "current", source=message_id)
memory.facts.put("comms.no_marketing", True, source=message_id)

# Included in every turn's context — small, explicit, always present.
facts = memory.facts.all(prefix="billing.")`,
            },
            {
              type: 'h2',
              text: 'Promotion is a policy',
            },
            {
              type: 'p',
              text: 'Not everything said deserves to be a fact. Decide deliberately what gets promoted — commitments, constraints, corrections — and leave the rest in ordinary history where it remains retrievable but does not occupy the window.',
            },
            {
              type: 'callout',
              kind: 'warning',
              title: 'Supersede, do not append',
              text: 'Writing a second value for the same key must replace the first, with the source recorded. A fact store that accumulates contradictory values is worse than no fact store, because the model will see both.',
            },
            {
              type: 'p',
              text: 'Every fact carries its source message, which is what makes the store auditable: "why does it think that?" resolves to a specific turn rather than to a summary.',
            },
          ],
        },
        {
          slug: 'code-graph',
          title: 'The code graph',
          summary: 'Parsing a repository into a semantic tree so an agent can navigate rather than grep.',
          body: [
            {
              type: 'p',
              text: 'A coding agent given a repository as raw text spends its context reading files to find out where things are. OpenLCM parses repositories into a Lossless Semantic Tree — a graph of definitions and their relationships — so navigation is a lookup rather than a scan.',
            },
            {
              type: 'list',
              items: [
                'Find a definition without reading the file it lives in.',
                'Walk callers and callees rather than searching for a name.',
                'Load only the nodes a task needs into the window.',
              ],
            },
            {
              type: 'p',
              text: '"Lossless" is the important word: the tree carries the structure, and the original source remains addressable through it. The agent gets a map, and can still read the territory.',
            },
            {
              type: 'callout',
              kind: 'note',
              title: 'Language coverage',
              text: 'Parsing depends on the languages supported by the current release. Check the repository before assuming a language is covered.',
            },
          ],
        },
      ],
    },
    {
      title: 'Guides',
      pages: [
        {
          slug: 'framework-adapters',
          title: 'Using it with a framework',
          summary: 'Adapters for the common agent frameworks and clients.',
          body: [
            {
              type: 'p',
              text: 'OpenLCM ships adapters for LangGraph, CrewAI, AutoGen and Google ADK, and for the OpenAI and Anthropic clients directly. The adapter\'s job is to record messages and inject context at the right point in that framework\'s lifecycle, so adopting it is not a rewrite.',
            },
            {
              type: 'code',
              lang: 'python',
              code: `# The pattern every adapter follows: wrap, and let the framework run.
from openlcm.adapters import anthropic as lcm

client = lcm.wrap(anthropic_client, memory=memory)

# Calls now record automatically and receive bounded context.
reply = client.messages.create(model=MODEL, max_tokens=1024, messages=turns)`,
            },
            {
              type: 'h2',
              text: 'Without an adapter',
            },
            {
              type: 'p',
              text: 'The manual integration is two calls — `add` after each message and `context` before each request — which is worth doing directly if your orchestration is your own. Adapters exist to avoid touching framework internals, not because the API is complicated.',
            },
            {
              type: 'callout',
              kind: 'warning',
              title: 'Record both sides',
              text: 'Recording user turns and not assistant turns produces a history that reads as a monologue and summarises badly. Both sides, always.',
            },
          ],
        },
        {
          slug: 'agent-tools',
          title: 'Exposing memory as tools',
          summary: 'Letting the agent search its own history instead of pre-fetching for it.',
          body: [
            {
              type: 'p',
              text: 'OpenLCM can expose recall, history search, semantic search and code navigation as tools the agent calls itself. That shifts the decision about what to remember from your code to the model — useful for exploratory work, and worth bounding.',
            },
            {
              type: 'table',
              head: ['Pre-fetch context', 'Memory as tools'],
              rows: [
                ['One round trip, predictable cost', 'The agent digs when it needs to'],
                ['You choose relevance up front', 'The model refines its own query'],
                ['Easier to cache', 'Harder to bound — set a step limit'],
              ],
            },
            {
              type: 'p',
              text: 'A reasonable default is both: seed the context with facts and recent turns, and expose search for the cases where the agent needs something older. That keeps the common path cheap and the rare path possible.',
            },
            {
              type: 'callout',
              kind: 'note',
              title: 'Tool results cost context too',
              text: 'A history search returning fifty messages has spent the budget the task needed. Page results and return spans rather than whole sessions.',
            },
          ],
        },
        {
          slug: 'evaluating-recall',
          title: 'Evaluating recall',
          summary: 'Measuring whether the memory layer actually remembers, rather than assuming it.',
          body: [
            {
              type: 'p',
              text: 'A memory system is a retrieval system, and it should be measured like one. The repository includes runs against long-context memory benchmarks; your own corpus deserves the same treatment, because your conversations are not the benchmark\'s.',
            },
            {
              type: 'steps',
              items: [
                'Take real conversations and write questions whose answers appear only in early turns.',
                'Record which message contains each answer — that is your label.',
                'Run recall at your production context budget, not an unlimited one.',
                'Measure how often the answering message is reachable from the returned context.',
                'Re-run whenever the summarisation prompt, the budget, or the compression settings change.',
              ],
            },
            {
              type: 'p',
              text: 'The distinction that matters is between "the fact was in the window" and "the fact was in the store". A store that holds everything and a context that never surfaces it is a system that forgets, whatever the persistence layer says.',
            },
          ],
        },
      ],
    },
    {
      title: 'Reference',
      pages: [
        {
          slug: 'privacy-and-retention',
          title: 'Privacy and retention',
          summary: 'What the store contains, and the obligations that follow.',
          body: [
            {
              type: 'p',
              text: 'The store holds the verbatim text of every message. That is the feature — and it means the file inherits every obligation that applies to conversation data.',
            },
            {
              type: 'list',
              items: [
                '**Redact at write time** where a category of data should never be stored, rather than filtering on read.',
                '**Set a retention period** per session or per tenant, and enforce deletion rather than documenting it.',
                '**Support erasure.** A request to be forgotten must remove messages, the summaries derived from them, and any facts sourced from them.',
                '**Treat the file as privileged.** Access to the store is access to every conversation.',
                '**Separate tenants** into separate stores where the data-protection posture requires it.',
              ],
            },
            {
              type: 'callout',
              kind: 'warning',
              title: 'Erasure has to cascade',
              text: 'Deleting messages while leaving the summaries derived from them keeps the content in paraphrased form. Any deletion path must invalidate and regenerate the affected summary nodes.',
            },
          ],
        },
        {
          slug: 'troubleshooting',
          title: 'Troubleshooting',
          summary: 'Symptoms, causes, and what to check first.',
          body: [
            { type: 'h2', text: 'The agent still forgets things' },
            {
              type: 'p',
              text: 'Check whether the fact was ever promoted. A preference stated in passing lives in message history, and if the context budget did not surface that session it is effectively absent. Promote commitments and corrections to facts at the moment they are made.',
            },
            { type: 'h2', text: 'Context is still overflowing' },
            {
              type: 'p',
              text: 'The budget passed to `context` is the layer\'s allocation, not the whole window. Reserve room for the system prompt, tool schemas and the answer — a budget equal to the window will always overflow once output is added.',
            },
            { type: 'h2', text: 'Recall returns the wrong session' },
            {
              type: 'p',
              text: 'Usually a session-keying problem: several conversations recorded under one session id, or a new id per request so nothing accumulates. Check that the session key matches the unit you actually mean by "a conversation".',
            },
            { type: 'h2', text: 'The store is growing quickly' },
            {
              type: 'p',
              text: 'Expected — it holds everything. Manage it with retention rather than by dropping messages: archive or delete whole sessions past their period, and regenerate the affected summary nodes.',
            },
          ],
        },
      ],
    },
  ],
}
