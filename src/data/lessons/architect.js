/**
 * Lessons for the Claude Certified Architect preparation track.
 *
 * A lesson is a content entity, not a page. It is surfaced from the track, the
 * technology page, search, the dashboard, and exam recommendations — all by
 * slug, never by copying the content.
 *
 * Body blocks: p | h2 | h3 | list | code | callout | table | figure | steps | quote
 * Inline in text: **bold**, `code`, [label](/href)
 */

export const architectLessons = [
  {
    slug: 'model-selection',
    title: 'Choosing a model for the workload',
    summary: 'Capability, latency and cost are one decision, and it is made per task rather than per product.',
    minutes: 12,
    topics: ['Model selection'],
    objectives: [
      'Size a task by what it actually requires rather than by what is newest',
      'Split a workload so the expensive model runs only where it earns its cost',
      'State a latency budget before choosing anything',
    ],
    body: [
      {
        type: 'p',
        text: 'Architecture questions almost never have the answer "use the largest model". They have the answer "use the smallest model that clears the bar, and prove where the bar is". The decision is made per task, because a product is rarely one task.',
      },
      {
        type: 'h2',
        text: 'Start from the budget, not the model',
      },
      {
        type: 'p',
        text: 'Write the constraints down before comparing anything. A support assistant that answers inside a chat window has a different budget from a nightly enrichment job over two million records, and the second one may not need an interactive model at all.',
      },
      {
        type: 'table',
        head: ['Constraint', 'Question to answer first'],
        rows: [
          ['Latency', 'What does the user see while waiting, and at what point do they leave?'],
          ['Cost', 'What is the per-call budget at the volume you expect in twelve months?'],
          ['Quality floor', 'What failure rate is tolerable, and who notices when it is exceeded?'],
          ['Context size', 'What is the largest realistic input, not the average one?'],
        ],
      },
      {
        type: 'h2',
        text: 'Split the workload',
      },
      {
        type: 'p',
        text: 'Most systems have one hard step surrounded by several easy ones. Routing, extraction, classification and summarisation of a single chunk are usually well within a fast model; the synthesis step that has to hold everything together often is not.',
      },
      {
        type: 'figure',
        caption: 'One request, three different budgets',
        art: `intent classification   → fast model      ~120ms   cheap
document extraction    → fast model      ~300ms   cheap, parallel × N
final synthesis        → capable model   ~2.5s    the cost centre
grounding check        → deterministic code        free`,
      },
      {
        type: 'p',
        text: 'The fourth line matters as much as the first three. Work that can be done by ordinary code — verifying a citation exists, checking a number against a database, enforcing a permission — should never be delegated to a model, whatever the model costs.',
      },
      {
        type: 'h2',
        text: 'Streaming changes the latency question',
      },
      {
        type: 'p',
        text: 'Time to first token and time to full answer are different numbers, and users experience the first one. A streamed response from a slower model can feel faster than a buffered response from a quicker one — but only where the interface can actually use partial output. A structured extraction that must validate before use gains nothing from streaming.',
      },
      {
        type: 'callout',
        kind: 'note',
        title: 'Pin the version',
        text: 'Record the exact model identifier with every evaluation result and every production trace. "It got worse" is unanswerable without it, and provider-side changes are a variable you do not control.',
      },
      {
        type: 'h2',
        text: 'Decide once, centrally',
      },
      {
        type: 'p',
        text: 'Model choice, retry policy, timeout and fallback belong in one client wrapper rather than at forty call sites. When a model is deprecated — and it will be — the migration should be a configuration change plus an evaluation run, not an archaeology exercise.',
      },
      {
        type: 'code',
        lang: 'python',
        file: 'llm/client.py',
        code: `TASKS = {
    "classify":  Profile(model=FAST,    max_tokens=64,   timeout=5),
    "extract":   Profile(model=FAST,    max_tokens=1024, timeout=15),
    "synthesise":Profile(model=CAPABLE, max_tokens=2048, timeout=60),
}

def call(task: str, messages: list[Message], **kw) -> Response:
    profile = TASKS[task]                 # one place decides
    return client.messages.create(
        model=profile.model,
        max_tokens=profile.max_tokens,
        messages=messages,
        timeout=profile.timeout,
        **kw,
    )`,
      },
    ],
    exercise: {
      prompt:
        'A product team wants a single capable model for every step of a document pipeline: classify, extract fields, summarise, and answer questions. Volume is 40,000 documents a day. What do you propose, and what evidence would you bring?',
      approach:
        'Propose splitting by step and measuring each independently. Classification and per-field extraction are narrow, schema-constrained tasks a fast model usually clears; summarisation and open questions are where capability is worth paying for. Bring an evaluation set per step with accuracy for both models, plus a cost model at 40,000/day — the argument is won with two numbers per step, not with a preference. Note also that extraction runs 40,000 times and synthesis may run far fewer, so the unit economics differ even where quality is equal.',
    },
    related: [
      { type: 'lesson', path: 'claude-certified-architect', lesson: 'cost-latency-reliability' },
      { type: 'tech', ref: 'claude' },
    ],
  },

  {
    slug: 'context-strategy',
    title: 'Context strategy',
    summary: 'The window is a budget shared by framing, retrieval, history and the answer. Plan for it filling.',
    minutes: 14,
    topics: ['Context strategy'],
    objectives: [
      'Budget a context window across its four competing claims',
      'Choose between truncation, summarisation and external memory with a reason',
      'Recognise the failure signature of an overflowing window',
    ],
    body: [
      {
        type: 'p',
        text: 'A model retains nothing between calls. Everything it "remembers" is something you resent. That makes the context window a budget, and like any budget it is contested: system framing, retrieved documents, conversation history, and the tokens reserved for the answer all draw on the same pool.',
      },
      {
        type: 'code',
        lang: 'python',
        file: 'context/budget.py',
        code: `@dataclass(frozen=True)
class Budget:
    system: int      # fixed framing and tool schemas
    retrieved: int   # documents for this turn
    history: int     # prior turns, compressed or not
    output: int      # reserved for the answer

    def total(self) -> int:
        return self.system + self.retrieved + self.history + self.output

budget = Budget(system=1_200, retrieved=6_000, history=4_000, output=1_500)
assert budget.total() < WINDOW, "trim retrieval or compress history"`,
      },
      {
        type: 'callout',
        kind: 'warning',
        title: 'Reserve the output',
        text: 'Input and output share the window. Filling it with retrieved documents leaves no room for the answer, and the visible symptom is a reply that stops mid-sentence — which reads as a model failure and is not one.',
      },
      {
        type: 'h2',
        text: 'Three strategies, three costs',
      },
      {
        type: 'table',
        head: ['Strategy', 'Keeps', 'Loses', 'Use when'],
        rows: [
          ['Sliding window', 'The most recent turns', 'Everything older, silently', 'Short tasks with no long-range dependency'],
          ['Hierarchical summary', 'A compressed account of the whole', 'Detail, and any fact the summariser judged unimportant', 'Long conversations where the thread matters'],
          ['External memory', 'Everything, verbatim, retrievable', 'Nothing — at the cost of a retrieval step', 'Assistants that must recall a decision made weeks ago'],
        ],
      },
      {
        type: 'p',
        text: 'The trap in the middle row is that summarisation is lossy in a way that is invisible at the time. A decision recorded three sessions ago — "the customer is on the legacy plan, never offer the migration discount" — disappears into a paraphrase, and nothing in the transcript shows that it was dropped.',
      },
      {
        type: 'h2',
        text: 'External memory, in outline',
      },
      {
        type: 'p',
        text: 'The pattern that scales is to store every message verbatim in ordinary storage, compress hierarchically for recall, and pull only what the current turn needs back into the window. Context stays bounded while history stays complete. [OpenLCM](/projects/openlcm) is PulpLabs\' implementation of exactly this, and its documentation is a worked example of the trade-offs.',
      },
      {
        type: 'figure',
        caption: 'Bounded context over unbounded history',
        art: `every message      →  stored verbatim, indexed
       ↓
session summaries  →  compressed per session
       ↓
durable facts      →  decisions, constraints, preferences
       ↓
this turn's window →  framing + retrieved facts + recent turns`,
      },
      {
        type: 'h2',
        text: 'Caching the stable prefix',
      },
      {
        type: 'p',
        text: 'Where a long prefix repeats across calls — a system prompt, a tool catalogue, a policy document — prompt caching lets the provider reuse the processed prefix instead of re-reading it. Design for it by keeping everything stable at the *front* of the prompt and everything variable at the back; interleaving the two defeats it.',
      },
      {
        type: 'h2',
        text: 'Position effects',
      },
      {
        type: 'p',
        text: 'Instructions in the middle of a very long context are attended to less reliably than the same instructions at either edge. Where a constraint genuinely must hold, state it near the end as well as the beginning — and then enforce it in code, because attention is not a guarantee.',
      },
    ],
    exercise: {
      prompt:
        'A support assistant works well for the first twenty turns and then starts contradicting decisions made earlier in the same conversation. History is truncated with a sliding window. Diagnose and propose a fix.',
      approach:
        'The sliding window has dropped the turns containing those decisions, so they no longer exist as far as the model is concerned. Summarising will help but will lose specifics unpredictably. The durable fix is a fact store: extract commitments and constraints as they are made, keep them in a small always-included block, and retrieve older detail on demand. Note the diagnostic that distinguishes this from a model problem — the contradiction correlates with conversation length, not with question difficulty.',
    },
    related: [
      { type: 'tech', ref: 'context-engineering' },
      { type: 'project', ref: 'openlcm' },
    ],
  },

  {
    slug: 'retrieval-architecture',
    title: 'Where retrieval belongs',
    summary: 'Deciding what the model should look up, when it should look it up, and who checks the result.',
    minutes: 13,
    topics: ['Retrieval architecture'],
    objectives: [
      'Choose between pre-fetched context and model-initiated retrieval',
      'Place the freshness and permission boundaries correctly',
      'Design an answer that can be checked against its sources',
    ],
    body: [
      {
        type: 'p',
        text: 'There are two ways to get knowledge into an answer: fetch it before the call and put it in the prompt, or give the model a search tool and let it decide. They have different failure modes, and architect questions are usually about which one a scenario calls for.',
      },
      {
        type: 'table',
        head: ['Approach', 'Strength', 'Weakness'],
        rows: [
          ['Pre-fetched context', 'One round trip, predictable latency and cost', 'You must guess what is relevant before the model reasons'],
          ['Retrieval as a tool', 'The model refines its own query, can search twice', 'Unbounded round trips, harder to cost and to cache'],
          ['Both', 'Seed with the obvious, let the model dig', 'Two systems to evaluate'],
        ],
      },
      {
        type: 'p',
        text: 'A good default is to pre-fetch when the query maps cleanly onto a search — a support question against a documentation corpus — and to expose a tool when the task is exploratory and the first query is unlikely to be the right one.',
      },
      {
        type: 'h2',
        text: 'Permissions belong in the retriever',
      },
      {
        type: 'p',
        text: 'This is the single most important architectural rule in a RAG system, and the most commonly broken one. Filtering results *after* retrieval, or instructing the model not to mention certain documents, is not access control. The retriever must be scoped to the requesting user before it returns a single chunk.',
      },
      {
        type: 'code',
        lang: 'python',
        code: `# Wrong: the model is handed everything and asked to be discreet.
chunks = index.search(query, k=20)
prompt = f"Do not reveal documents the user cannot access.\\n{chunks}"

# Right: the index never returns what the caller may not read.
chunks = index.search(query, k=20, acl=principal_of(request))`,
      },
      {
        type: 'callout',
        kind: 'warning',
        title: 'Retrieved text is untrusted input',
        text: 'A document in your corpus can contain instructions. Anything retrieved must be delimited and labelled as data, and it must never be able to authorise an action — that decision lives in your code.',
      },
      {
        type: 'h2',
        text: 'Freshness is a design decision',
      },
      {
        type: 'p',
        text: 'Every corpus has a staleness profile. Pricing changes weekly, policy changes quarterly, an API reference changes with every release. Carry an `updated_at` on every chunk, surface it in the citation, and decide explicitly what the system does when the only relevant document is eighteen months old — answering from it silently is a choice, and usually the wrong one.',
      },
      {
        type: 'h2',
        text: 'Make the answer checkable',
      },
      {
        type: 'p',
        text: 'Give each retrieved chunk an identifier, require the answer to cite identifiers, and verify after generation that the cited chunks were actually in the context. A citation to a chunk you never sent is a hallucination your own code can detect — no judgement required.',
      },
      {
        type: 'steps',
        items: [
          'Retrieve with the caller\'s permissions applied at the index.',
          'Label each chunk with an id, a source and a date.',
          'Require citations as structured fields, not woven into prose.',
          'After generation, assert every cited id was in the context.',
          'Surface the sources in the interface so the reader can check them too.',
        ],
      },
    ],
    exercise: {
      prompt:
        'An internal assistant answers HR questions from a document corpus. Legal asks how you would prevent it disclosing a policy that applies only to one region. Give the architectural answer.',
      approach:
        'Scope the retriever, not the prompt. Every chunk carries region metadata; the search is filtered by the requesting employee\'s region before results are returned, so out-of-region content is never in the context to be leaked. Prompt instructions are a mitigation that reduces a rate; index-level filtering is a control that enforces a rule. Add an audit log of what was retrieved per request, because legal\'s next question is what the assistant saw, not what it said.',
    },
    related: [
      { type: 'lesson', path: 'rag-systems-specialist', lesson: 'chunking' },
      { type: 'tech', ref: 'retrieval' },
    ],
  },

  {
    slug: 'integration-boundaries',
    title: 'Tools, MCP, and integration boundaries',
    summary: 'When a capability should be a tool, when it should be a protocol server, and when it should be neither.',
    minutes: 12,
    topics: ['Integration boundaries'],
    objectives: [
      'Decide between a direct tool, an MCP server, and plain code',
      'Place the trust boundary in an integration',
      'Avoid the indirection that a protocol only sometimes earns',
    ],
    body: [
      {
        type: 'p',
        text: 'Three ways to connect a model to something it cannot do alone: define a tool in the request, expose a set of capabilities over the Model Context Protocol, or simply run the code yourself and put the result in the prompt. Choosing well is an architecture question; the exam frames it as a scenario.',
      },
      {
        type: 'table',
        head: ['Choose', 'When'],
        rows: [
          ['Plain code, result in the prompt', 'The system always needs this, and the model does not need to decide'],
          ['A tool in the request', 'One application, a handful of capabilities, one team owns both sides'],
          ['An MCP server', 'Several clients need the same capabilities, or a different team owns the integration'],
        ],
      },
      {
        type: 'p',
        text: 'The first row is the one people skip. If the answer always requires the customer\'s current balance, fetch it and include it — making the model ask for it adds a round trip, a failure mode, and a chance it forgets.',
      },
      {
        type: 'h2',
        text: 'What MCP actually buys',
      },
      {
        type: 'p',
        text: 'The Model Context Protocol turns N applications × M integrations into N clients and M servers. That is real leverage at scale and pure overhead at one-by-one. It also moves the integration into a separate process with its own credentials — often the more important benefit, because it makes the trust boundary explicit.',
      },
      {
        type: 'figure',
        caption: 'Where the boundary sits',
        art: `client (your app)          server (the integration)
────────────────────           ────────────────────────
holds the conversation         holds the credentials
decides what to call           decides what is exposed
enforces user permissions      enforces its own limits
                    ── protocol ──`,
      },
      {
        type: 'callout',
        kind: 'warning',
        title: 'A server is not an authorisation layer for your users',
        text: 'An MCP server authenticates itself to the system it wraps. It does not know which of your end users made the request unless you pass and enforce that. Do not let the protocol boundary blur who is asking.',
      },
      {
        type: 'h2',
        text: 'Designing the surface',
      },
      {
        type: 'list',
        items: [
          '**Narrow beats general.** `create_refund(order_id, amount)` can be reasoned about, permissioned, and audited. `run_query(sql)` cannot.',
          '**Descriptions are the only documentation the model gets.** Write them for a competent stranger.',
          '**Return errors as data.** A structured `{"error": "order not found"}` lets the loop recover; an exception ends the turn.',
          '**Keep results small.** A tool that returns forty thousand tokens has just spent the context the task needed.',
          '**Version the contract.** Consumers include model prompts you did not write; a silent argument rename breaks them.',
        ],
      },
      {
        type: 'h2',
        text: 'Resources and prompts, not just tools',
      },
      {
        type: 'p',
        text: 'MCP exposes three primitives. Tools are actions the model may invoke. Resources are content the client can read and attach — a file, a record, a schema. Prompts are reusable templates the server offers. Reaching for a tool where a resource fits is a common design error: fetching a document is a read, not an action.',
      },
    ],
    exercise: {
      prompt:
        'Four internal applications each need to read from the same ticketing system. Two are agents, two are ordinary services. Someone proposes an MCP server. Argue both sides and land it.',
      approach:
        'For: four consumers of one integration is exactly the N×M case a protocol server exists to collapse, and it puts the ticketing credentials in one process with one audit trail. Against: two of the four are ordinary services that do not need a model-facing protocol at all — they should call the ticketing API directly, and wrapping it adds a hop. Land it as: a plain internal client library for the two services, an MCP server for the two agents, both talking to the same underlying API, with end-user identity passed through and enforced at the ticketing system rather than at the server.',
    },
    related: [
      { type: 'tech', ref: 'mcp' },
      { type: 'lesson', path: 'agent-systems-professional', lesson: 'tool-design' },
    ],
  },

  {
    slug: 'evaluation-and-rollout',
    title: 'Evaluation and rollout',
    summary: 'How a change gets from a good idea to production without a regression nobody measured.',
    minutes: 13,
    topics: ['Evaluation'],
    objectives: [
      'Assemble an evaluation set that reflects real usage',
      'Choose a grader that matches the task',
      'Design a rollout that can be reversed on evidence',
    ],
    body: [
      {
        type: 'p',
        text: 'Without evaluation, every prompt change is a guess and every model upgrade is a leap. The architect\'s job is not to write the graders — it is to make sure the system cannot ship a change that nobody measured.',
      },
      {
        type: 'h2',
        text: 'The set comes from production',
      },
      {
        type: 'p',
        text: 'Take real inputs from logs and support tickets. Invented cases cluster around the behaviour you already handle. Fifty well-chosen real examples — including the failures that prompted the work, the ambiguous cases, and a few that should be refused — catch more regressions than five hundred synthetic ones.',
      },
      {
        type: 'code',
        lang: 'python',
        file: 'evals/dataset.py',
        code: `@dataclass
class Case:
    id: str
    input: str
    must_contain: list[str]      # facts the answer has to include
    must_not_contain: list[str]  # leaks, invented policy, wrong product names
    expected: str | None = None  # None where several answers are acceptable
    tags: list[str] = field(default_factory=list)  # "refusal", "long-context"`,
      },
      {
        type: 'h2',
        text: 'Grade at the component, not only end to end',
      },
      {
        type: 'p',
        text: 'An end-to-end score tells you something is wrong; it does not tell you what. Track retrieval recall, schema validity and answer quality as separate numbers so a regression points at a component instead of starting an argument.',
      },
      {
        type: 'table',
        head: ['Grader', 'Use for', 'Watch out for'],
        rows: [
          ['Exact match', 'Classification, routing', 'Too brittle for prose'],
          ['Schema validation', 'Structured extraction', 'Shape only, never correctness'],
          ['Assertions', 'Required facts, forbidden strings', 'Phrasing variation'],
          ['Model-as-judge', 'Open-ended answers', 'Position and verbosity bias, cost'],
          ['Human review', 'Calibrating all of the above', 'Does not scale — sample it'],
        ],
      },
      {
        type: 'callout',
        kind: 'warning',
        title: 'An average hides the thing you care about',
        text: 'A mean score can rise while one tag collapses. Report per tag, and gate on "no case drops by more than one point" rather than on the aggregate.',
      },
      {
        type: 'h2',
        text: 'Rolling out',
      },
      {
        type: 'steps',
        items: [
          'Run the suite on every prompt, retrieval or model change, in CI, with the model version pinned and recorded.',
          'Ship behind a flag to a small share of traffic, with the old path still live.',
          'Compare on production signals the offline set cannot see: escalation rate, retry rate, thumbs-down, handle time.',
          'Keep the rollback a configuration change, not a deploy.',
          'Add every production failure to the golden set permanently.',
        ],
      },
      {
        type: 'p',
        text: 'That last step is the one that compounds. A set that grows with every incident becomes an institutional memory of the ways your system has been wrong — and the only thing standing between a fix and its quiet reintroduction six months later.',
      },
    ],
    exercise: {
      prompt:
        'A model upgrade improves your average judge score from 7.2 to 7.8 offline. A week after rollout, escalations to human agents are up 15%. What went wrong in the process?',
      approach:
        'The offline set did not represent the traffic that escalates, and the aggregate hid a per-tag regression — most likely on refusals or on the long-tail cases that make people give up and ask for a human. The process failure is that rollout was not staged against a production signal: escalation rate is exactly the metric that should have gated it. Fix forward by adding the escalating cases to the golden set as a tagged group, reporting per tag, and gating future rollouts on a live comparison rather than an offline mean.',
    },
    related: [
      { type: 'tech', ref: 'evaluation' },
      { type: 'exam', ref: 'claude-architect' },
    ],
  },

  {
    slug: 'cost-latency-reliability',
    title: 'Cost, latency and reliability in production',
    summary: 'Operating a probabilistic component inside a system that has to keep its promises.',
    minutes: 13,
    topics: ['Operations'],
    objectives: [
      'Bound cost per request and per tenant',
      'Degrade gracefully when the provider is slow or unavailable',
      'Instrument a system so a bad answer can be explained afterwards',
    ],
    body: [
      {
        type: 'p',
        text: 'A model call is a network call to a service you do not operate, with variable latency, a rate limit, and a per-token price. Everything you know about operating dependencies applies — plus one thing that does not: the failure can be a perfectly formed, entirely wrong answer.',
      },
      {
        type: 'h2',
        text: 'Bounding cost',
      },
      {
        type: 'list',
        items: [
          '**Cap `max_tokens` per task.** It is the only hard limit on the output side and it prevents a runaway from becoming an invoice.',
          '**Budget per request, not per call.** An agent loop can make twenty calls; the number that matters is the total for the task.',
          '**Meter per tenant.** One customer\'s bulk import should not consume the shared rate limit.',
          '**Cache the stable prefix.** Long system prompts and tool catalogues repeat on every call.',
          '**Record tokens on every trace.** Cost regressions are invisible until someone reads the bill.',
        ],
      },
      {
        type: 'h2',
        text: 'Failing well',
      },
      {
        type: 'table',
        head: ['Failure', 'Bad response', 'Better response'],
        rows: [
          ['429 rate limited', 'Immediate retry', 'Backoff with jitter, respect retry-after, shed low-priority work'],
          ['Timeout', 'Retry the same long call', 'Cancel, retry once with a shorter budget, then degrade'],
          ['Provider outage', 'Error page', 'Fall back to retrieval-only answers, or to a queue with an honest status'],
          ['Validation failure', 'Silent default', 'One repair attempt, then surface the failure'],
        ],
      },
      {
        type: 'p',
        text: 'The third row is the architecture question. Deciding in advance what the product does without a model — search results with no summary, a form instead of a conversation, an honest "we will email you" — is what separates a degraded system from a broken one.',
      },
      {
        type: 'callout',
        kind: 'note',
        title: 'Retries are not free',
        text: 'A retried call costs tokens again, and a retry storm during a provider slowdown adds load exactly when the system is least able to absorb it. Cap attempts, use exponential backoff with jitter, and stop retrying non-transient errors.',
      },
      {
        type: 'h2',
        text: 'Instrumentation',
      },
      {
        type: 'p',
        text: 'Log enough to answer "why did it say that" a month later: the prompt version, the model version, the retrieved chunk ids, the tool calls with arguments and results, the token counts, and the final output. Redact what policy requires, but do not log so little that a complaint is unanswerable.',
      },
      {
        type: 'code',
        lang: 'python',
        code: `trace = {
    "request_id": request_id,
    "prompt_version": PROMPT_VERSION,     # versioned in the repo
    "model": profile.model,               # exact identifier
    "retrieved": [c.id for c in chunks],  # what it could see
    "tools": [(t.name, t.arguments) for t in calls],
    "tokens": {"in": usage.input, "out": usage.output},
    "latency_ms": elapsed,
    "outcome": "answered" | "refused" | "escalated" | "failed",
}`,
      },
      {
        type: 'h2',
        text: 'The numbers to alert on',
      },
      {
        type: 'p',
        text: 'Tail latency, not the mean — a request that fans out to several calls is likely to hit at least one slow one. Validation failure rate, because a rise means the contract is drifting. Escalation or thumbs-down rate, because it is the only signal that tracks whether answers are actually any good.',
      },
    ],
    exercise: {
      prompt:
        'Your assistant depends on one model provider. Leadership asks what happens if that provider has a two-hour outage. Answer as an architect.',
      approach:
        'Describe the degraded mode, not a promise of immunity. Retrieval and search keep working, so the product falls back to ranked source passages with no generated summary and a visible notice. Writes that require generation queue with an honest status rather than failing silently. If a second provider is genuinely worth the cost, it is worth it only with its own evaluation run and a prompt that has been tested against it — an untested failover is an outage with extra steps. Close on what makes this real: a flag that switches modes without a deploy, and a rehearsal.',
    },
    related: [
      { type: 'exam', ref: 'claude-architect' },
      { type: 'lesson', path: 'claude-certified-architect', lesson: 'model-selection' },
    ],
  },
]
