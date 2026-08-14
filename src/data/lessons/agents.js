/** Lessons for the Agent Systems Professional preparation track. */

export const agentLessons = [
  {
    slug: 'agent-loop',
    title: 'The loop, and its bounds',
    summary: 'Thirty lines that demystify every framework — and the four limits that make them safe to run.',
    minutes: 12,
    topics: ['Agent loop'],
    objectives: [
      'Write the loop underneath every agent framework',
      'Apply step, token, time and side-effect bounds',
      'Choose the smallest architecture that solves the problem',
    ],
    body: [
      {
        type: 'p',
        text: 'An agent is a loop: send the conversation, receive either an answer or a tool call, execute the tool, append the result, repeat. Planners, memory, and multi-agent topologies are all structure layered on that. Write it by hand once and the frameworks stop being mysterious.',
      },
      {
        type: 'code',
        lang: 'python',
        file: 'agent/run.py',
        code: `def run(task: str, tools: dict[str, Tool], *, max_steps: int = 8,
        token_budget: int = 60_000, deadline: float) -> str:
    messages = [{"role": "user", "content": task}]
    used = 0

    for step in range(max_steps):
        if time.monotonic() > deadline:
            return partial(messages, "deadline reached")

        reply = call_model(messages, tools=[t.schema for t in tools.values()])
        used += reply.usage.input_tokens + reply.usage.output_tokens
        if used > token_budget:
            return partial(messages, "token budget exhausted")

        if reply.stop_reason != "tool_use":
            return text_of(reply)

        messages.append({"role": "assistant", "content": reply.content})
        messages.append({"role": "user", "content": [
            execute(tools, call) for call in tool_calls(reply)
        ]})

    return partial(messages, f"no answer within {max_steps} steps")`,
      },
      {
        type: 'h2',
        text: 'Four bounds, and what each prevents',
      },
      {
        type: 'table',
        head: ['Bound', 'Prevents', 'On breach'],
        rows: [
          ['Max steps', 'Oscillation between two tools', 'Return partial work and stop'],
          ['Token budget', 'Unpredictable cost per task', 'Summarise history or abort'],
          ['Wall clock', 'A user waiting indefinitely', 'Return what exists'],
          ['Side-effect allowlist', 'An irreversible action taken unsupervised', 'Escalate to a human'],
        ],
      },
      {
        type: 'p',
        text: 'Notice that every breach returns something. An agent that raises on its own limits is an agent that loses ten minutes of work at step seven — partial results plus a clear reason are almost always more useful than an exception.',
      },
      {
        type: 'callout',
        kind: 'warning',
        title: 'Bounds are not a fallback for a bad design',
        text: 'An agent that regularly hits its step limit is not being constrained — it is failing. Read the traces: the usual cause is a tool that returns too little to act on, or two tools whose descriptions overlap.',
      },
      {
        type: 'h2',
        text: 'Prefer the smallest thing that works',
      },
      {
        type: 'figure',
        caption: 'Escalate only when the simpler shape has actually failed',
        art: `one call, good prompt          cheapest, most predictable
        ↓ not enough context
one call + retrieval           still one round trip
        ↓ needs to act
loop with 2–3 narrow tools     bounded, traceable
        ↓ genuinely parallel or specialised
multiple agents                coordination cost, hardest to debug`,
      },
      {
        type: 'p',
        text: 'Most tasks presented as agent problems are retrieval problems. A single call with the right context is cheaper, faster, easier to evaluate, and fails in ways you can predict.',
      },
    ],
    exercise: {
      prompt:
        'An agent completes 70% of tasks and hits its 8-step limit on the rest. Raising the limit to 20 raises completion to 74% and triples cost. What does that tell you?',
      approach:
        'That the limit was not the constraint. A four-point gain for three times the cost means the extra steps are mostly unproductive — the agent is looping, not progressing. Read traces of the failures and look for the same tool called repeatedly with near-identical arguments, which usually means the tool returns too little to act on, or two tool descriptions overlap so the model cannot tell which to use. Fix the tools, then revisit the limit.',
    },
    related: [
      { type: 'tech', ref: 'agent-loops' },
      { type: 'lesson', path: 'agent-systems-professional', lesson: 'tool-design' },
    ],
  },

  {
    slug: 'tool-design',
    title: 'Designing tools an agent can use',
    summary: 'Granularity, descriptions, error shapes, and result sizes — the four things that decide whether a loop converges.',
    minutes: 12,
    topics: ['Tool design'],
    objectives: [
      'Choose the right granularity for a tool',
      'Write descriptions that prevent the wrong call',
      'Return results an agent can act on without a second call',
    ],
    body: [
      {
        type: 'p',
        text: 'Agent quality is mostly tool quality. A capable model with vague, overlapping, chatty tools performs worse than a smaller model with three sharp ones.',
      },
      {
        type: 'h2',
        text: 'Granularity',
      },
      {
        type: 'table',
        head: ['Too general', 'Too granular', 'About right'],
        rows: [
          ['`run_sql(query)`', '`get_order_status(id)`, `get_order_carrier(id)`, `get_order_eta(id)`', '`get_order(id)` returning status, carrier and eta'],
          ['`call_api(url, body)`', '`set_first_name`, `set_last_name`', '`update_customer(id, fields)`'],
        ],
      },
      {
        type: 'p',
        text: 'Too general and you cannot permission or audit it, and the model has to invent a query language. Too granular and the loop burns three steps assembling one answer. The unit is roughly "one thing a person would ask for".',
      },
      {
        type: 'h2',
        text: 'Descriptions do the work',
      },
      {
        type: 'code',
        lang: 'python',
        code: `{
  "name": "search_orders",
  "description": (
      "Search orders by customer email or order id. Returns up to 10 matches "
      "with status and dates. "
      "Use when the customer does not know their order id. "
      "Do NOT use for refunds — use create_refund. "
      "Returns an empty list rather than an error when nothing matches."
  ),
  ...
}`,
      },
      {
        type: 'list',
        items: [
          '**Say what it returns**, so the model knows whether a second call is needed.',
          '**Say when to use it**, in the caller\'s language, not the implementer\'s.',
          '**Say when not to**, and name the tool that should be used instead — overlapping tools are the main cause of loops.',
          '**Describe the empty case**, or the model will treat "no results" as a failure and retry.',
        ],
      },
      {
        type: 'h2',
        text: 'Errors the loop can recover from',
      },
      {
        type: 'code',
        lang: 'python',
        code: `# Useless: the agent cannot tell what to do differently.
{"error": "request failed"}

# Actionable: names the problem and the next move.
{"error": "not_found",
 "detail": "No order 91823 for this customer.",
 "hint": "Ask the customer to confirm the order number or search by email."}`,
      },
      {
        type: 'callout',
        kind: 'warning',
        title: 'Never put the reason in a permission error',
        text: '"Denied: order belongs to customer 4471" tells the model — and therefore possibly the user — something it should not know. Return `not_permitted` and log the detail server-side.',
      },
      {
        type: 'h2',
        text: 'Result size is context spend',
      },
      {
        type: 'p',
        text: 'A tool returning forty thousand tokens of JSON has just consumed the window the task needed. Page results, return fields rather than whole records, and summarise server-side where the agent only needs the shape. If a result is genuinely large, return a handle and a second tool to read parts of it.',
      },
      {
        type: 'h2',
        text: 'Idempotency for writes',
      },
      {
        type: 'p',
        text: 'An agent may retry, and a loop may repeat a step after a timeout. Any tool that writes should accept an idempotency key and return the original result for a repeat, so "create refund" twice does not mean two refunds.',
      },
    ],
    exercise: {
      prompt:
        'An agent has `search_orders` and `get_order`. Traces show it calling `search_orders` and then `get_order` on every result, one at a time, exhausting its step budget. Fix it.',
      approach:
        'The search result is too thin — it returns ids only, so the agent must fetch each one to see anything useful. Return the fields needed to make the next decision (status, date, total) directly from search, and say so in the description. That collapses a fan-out of N steps into one. If detail genuinely is expensive, allow `get_order` to take a list of ids so the loop makes one call rather than N.',
    },
    related: [
      { type: 'tech', ref: 'tool-use' },
      { type: 'lesson', path: 'claude-certified-developer', lesson: 'tool-calling' },
    ],
  },

  {
    slug: 'agent-memory',
    title: 'Memory and state',
    summary: 'What the loop carries, what it looks up, and how a long-running agent stays coherent.',
    minutes: 12,
    topics: ['Memory'],
    objectives: [
      'Separate working context from durable memory',
      'Choose what gets promoted to a durable fact',
      'Keep a long task recoverable across restarts',
    ],
    body: [
      {
        type: 'p',
        text: 'An agent has three kinds of state and conflating them is the usual source of incoherence: the working context for this turn, the run state of the current task, and durable memory that outlives both.',
      },
      {
        type: 'table',
        head: ['State', 'Lives', 'Holds'],
        rows: [
          ['Working context', 'One model call', 'Framing, tools, recent turns, retrieved material'],
          ['Run state', 'One task', 'Message history, step count, budget spent, checkpoints'],
          ['Durable memory', 'Across tasks and sessions', 'Decisions, constraints, preferences, verbatim history'],
        ],
      },
      {
        type: 'h2',
        text: 'Promotion is a policy, not a side effect',
      },
      {
        type: 'p',
        text: 'Not everything said deserves to be remembered forever. Decide explicitly what gets promoted to durable memory — commitments made, constraints stated, corrections issued by the user — and keep the rest in ordinary history where it can be retrieved but does not occupy the window.',
      },
      {
        type: 'code',
        lang: 'python',
        code: `# Durable facts are small, addressable and explicitly written.
memory.put("billing.plan", "legacy", source=turn_id)
memory.put("comms.no_marketing", True, source=turn_id)

# Recalled by key at the start of a task, not searched for hopefully.
facts = memory.get_all(prefix="billing.")`,
      },
      {
        type: 'callout',
        kind: 'note',
        title: 'A correction is the highest-value memory there is',
        text: 'When a user says "no, we moved off that plan last year", that is exactly the fact that must survive summarisation. Detect corrections and promote them.',
      },
      {
        type: 'h2',
        text: 'Unbounded history, bounded context',
      },
      {
        type: 'p',
        text: 'The pattern that scales: store every message verbatim, compress hierarchically for recall, and pull back only what the current turn needs. History stays complete and auditable while the window stays inside its budget. [OpenLCM](/builds/openlcm) implements this shape and its documentation walks through the compression structure.',
      },
      {
        type: 'h2',
        text: 'Checkpointing',
      },
      {
        type: 'p',
        text: 'A long agent task should survive a deploy. Persist run state after every step so a restart resumes at step four rather than step one — which matters most when steps have side effects you do not want repeated.',
      },
      {
        type: 'code',
        lang: 'python',
        code: `run = store.load(run_id) or Run.new(run_id, task)

while not run.finished and run.steps < MAX_STEPS:
    run.advance(call_model(run.messages, tools=TOOLS))
    store.save(run)        # crash here and the next process resumes cleanly`,
      },
      {
        type: 'h2',
        text: 'Forgetting is a feature',
      },
      {
        type: 'p',
        text: 'Memory that only grows becomes a liability: stale preferences, superseded decisions, and personal data with no retention story. Give facts a source and a timestamp, supersede rather than append, and support deletion — a user asking to be forgotten is a requirement, not an edge case.',
      },
    ],
    exercise: {
      prompt:
        'An assistant remembers a customer\'s preference correctly for a week, then starts ignoring it. Nothing changed in the code. What is the likely mechanism?',
      approach:
        'The preference was in conversation history rather than in durable memory, and history has since been summarised or truncated past it. The summariser had no reason to treat that sentence as important, so it disappeared without a trace. Fix by promoting stated preferences to an explicit fact store at the moment they are expressed, and include those facts in every task\'s framing rather than relying on them surviving compression.',
    },
    related: [
      { type: 'tech', ref: 'context-engineering' },
      { type: 'project', ref: 'openlcm' },
    ],
  },

  {
    slug: 'multi-agent',
    title: 'Multi-agent topologies',
    summary: 'When splitting an agent helps, what it costs, and the failure modes that only appear with more than one.',
    minutes: 11,
    topics: ['Topologies'],
    objectives: [
      'Identify the cases where splitting genuinely helps',
      'Choose a topology and name its coordination cost',
      'Recognise failures specific to multi-agent systems',
    ],
    body: [
      {
        type: 'p',
        text: 'Multiple agents are not a capability upgrade. They are a decomposition, and like any decomposition they trade a hard problem inside one component for a coordination problem between several.',
      },
      {
        type: 'h2',
        text: 'Reasons that justify a split',
      },
      {
        type: 'list',
        items: [
          '**Genuinely parallel work.** Ten documents reviewed independently is a fan-out, and it is the strongest case.',
          '**Different tool permissions.** An agent that may read and an agent that may write have different blast radii, and separating them is a security control.',
          '**Different context needs.** A researcher filling its window with sources should not hand all of it to the writer.',
          '**Different models.** A cheap classifier routing to an expensive specialist is a split that pays for itself.',
        ],
      },
      {
        type: 'p',
        text: 'Reasons that do not justify a split: role-play ("a manager agent and three worker agents"), the belief that more agents means more intelligence, or a single sequential task that one loop handles perfectly well.',
      },
      {
        type: 'h2',
        text: 'Topologies',
      },
      {
        type: 'table',
        head: ['Shape', 'Fits', 'Costs'],
        rows: [
          ['Pipeline', 'Fixed stages: extract → verify → write', 'Little; it is barely multi-agent'],
          ['Fan-out / gather', 'Independent parallel work', 'Aggregation logic; partial failures'],
          ['Supervisor / workers', 'Dynamic decomposition', 'Supervisor becomes the bottleneck and the single point of confusion'],
          ['Peer negotiation', 'Rarely anything in production', 'Non-termination, cost explosion, unexplainable outcomes'],
        ],
      },
      {
        type: 'callout',
        kind: 'warning',
        title: 'Bound the whole system, not each agent',
        text: 'Five agents each allowed eight steps is a forty-step system. Budgets must be allocated from a total held by the orchestrator, or cost becomes unpredictable in exactly the situations where it matters.',
      },
      {
        type: 'h2',
        text: 'Failure modes that need more than one agent to exist',
      },
      {
        type: 'list',
        items: [
          '**Message loops.** Two agents hand work back and forth without progress. Detect with a repeat-state check, not just a step cap.',
          '**Context loss at the boundary.** The handoff carries a summary and drops the constraint that mattered.',
          '**Compounding error.** Stage two treats stage one\'s uncertain output as fact. Pass confidence and provenance across boundaries.',
          '**Untraceable outcomes.** Nobody can say which agent decided the wrong thing without a shared trace id.',
        ],
      },
      {
        type: 'h2',
        text: 'Keep the interface between agents explicit',
      },
      {
        type: 'p',
        text: 'Treat a handoff as an API: a typed payload with the task, the constraints, the evidence and its provenance. Free-form prose between agents loses precisely the structure the receiving agent needs, and it makes the boundary impossible to test.',
      },
    ],
    exercise: {
      prompt:
        'A team replaces a working single-agent assistant with a supervisor and four specialists. Quality is unchanged, cost is 4× and latency is 3×. Where would you look before concluding the architecture is wrong?',
      approach:
        'At the traces, to see whether the specialists are doing distinct work or restating the same context to each other — the usual finding is that the supervisor re-sends most of the conversation to each specialist, which alone explains the cost multiple. Then check whether any of the four are genuinely parallel; if they run in sequence, the latency multiple is structural and unrecoverable. In most such cases the honest conclusion is that the split was not motivated by parallelism, permissions, context pressure or model choice — and the single agent should return, possibly with a cheap router in front.',
    },
    related: [{ type: 'lesson', path: 'agent-systems-professional', lesson: 'agent-observability' }],
  },

  {
    slug: 'agent-observability',
    title: 'Tracing and debugging agents',
    summary: 'Making a wrong action explainable a month later, and finding the step where it went wrong.',
    minutes: 11,
    topics: ['Observability'],
    objectives: [
      'Record a trace that answers "why did it do that"',
      'Find the deciding step in a long run',
      'Turn a production failure into a regression test',
    ],
    body: [
      {
        type: 'p',
        text: 'An agent that did the wrong thing is unexplainable without a trace, and a system you cannot explain is one you cannot improve or safely operate. This is the difference between a demo and something you are willing to put in front of customers.',
      },
      {
        type: 'h2',
        text: 'What a trace has to contain',
      },
      {
        type: 'code',
        lang: 'python',
        code: `step = {
    "run_id": run.id,
    "step": run.steps,
    "prompt_version": PROMPT_VERSION,
    "model": MODEL,                        # exact identifier
    "messages_digest": sha256(run.messages),   # what it could see
    "tool": {"name": call.name, "args": redact(call.arguments)},
    "result": truncate(result, 2_000),
    "tokens": {"in": usage.input_tokens, "out": usage.output_tokens},
    "latency_ms": elapsed,
    "decision": reply.stop_reason,
}`,
      },
      {
        type: 'p',
        text: 'The digest matters as much as the content. Storing every full context is expensive and often contains personal data; storing a hash lets you prove two runs saw the same thing, and you can keep full context for a sampled share or for failures only.',
      },
      {
        type: 'h2',
        text: 'Finding the deciding step',
      },
      {
        type: 'steps',
        items: [
          'Start at the wrong action and walk backwards, not forwards.',
          'Find the first step where the state was already wrong — that is usually two or three steps before the visible failure.',
          'Check what that step could see: was the needed fact in the context at all?',
          'If it was, the failure is reasoning or instruction. If it was not, the failure is retrieval, memory or tool output.',
          'Record which of the two it was; the distribution tells you what to fix next.',
        ],
      },
      {
        type: 'callout',
        kind: 'note',
        title: 'Redact at write time',
        text: 'Traces are the most sensitive artefact an agent produces — they contain the full input, the retrieved documents and the tool arguments. Redact before storage, set a retention period, and treat access as privileged.',
      },
      {
        type: 'h2',
        text: 'Metrics worth alerting on',
      },
      {
        type: 'table',
        head: ['Metric', 'Rising means'],
        rows: [
          ['Steps per completed task', 'Tools are getting harder to use, or descriptions have drifted'],
          ['Bound-breach rate', 'Tasks are outgrowing the budget, or the loop is stuck'],
          ['Tool error rate by tool', 'One integration is degrading'],
          ['Escalation rate', 'The agent is out of its depth more often'],
          ['Tokens per task', 'Cost regression, usually from context growth'],
        ],
      },
      {
        type: 'h2',
        text: 'Every incident becomes a case',
      },
      {
        type: 'p',
        text: 'A trace contains everything needed to rebuild the scenario as a test: the task, the tool responses, and the expected outcome. Replay it with recorded tool results and the failure becomes a regression test that costs nothing to run and never silently returns.',
      },
    ],
    exercise: {
      prompt:
        'An agent issued a refund to the wrong order. You have full traces. Outline the investigation, and what you change afterwards.',
      approach:
        'Walk back from the `create_refund` call to find where the wrong order id first appeared: in the user\'s message, in a search result, in a retrieved document, or invented in a model turn. Each origin implies a different fix — a confirmation step, a search scoped to the customer, delimiting retrieved content, or requiring the id to come from a prior tool result. Afterwards: make the refund tool verify the order belongs to the authenticated customer regardless of what it was passed, add the trace as a replay test, and consider whether refunds above a threshold should escalate rather than execute.',
    },
    related: [
      { type: 'tech', ref: 'guardrails' },
      { type: 'exam', ref: 'agent-systems' },
    ],
  },

  {
    slug: 'agent-portability',
    title: 'Portability and migration',
    summary: 'What actually transfers between orchestration platforms, and how a migration stops being a rewrite.',
    minutes: 12,
    topics: ['Portability'],
    objectives: [
      'Separate portable assets from platform-specific ones',
      'Plan a migration as a translation rather than a rebuild',
      'Prove equivalence before switching traffic',
    ],
    body: [
      {
        type: 'p',
        text: 'Agent workflows are built on frameworks and vendor runtimes that model state, tools and control flow differently. Anyone who has moved one knows the work is not in the code — it is in re-deriving intent that was never written down anywhere.',
      },
      {
        type: 'h2',
        text: 'What transfers, and what does not',
      },
      {
        type: 'table',
        head: ['Portable', 'Platform-specific'],
        rows: [
          ['Prompts and instructions', 'State machine and control-flow syntax'],
          ['Tool contracts — name, schema, semantics', 'Tool binding and connector configuration'],
          ['Evaluation sets and expected outputs', 'Managed memory and hosted vector stores'],
          ['Business rules and escalation policy', 'Deployment, identity and secret management'],
          ['Traces, as a record of intended behaviour', 'Built-in observability dashboards'],
        ],
      },
      {
        type: 'p',
        text: 'The left column is the asset. A team that keeps prompts, tool contracts and evaluation sets in its own repository can move platforms; a team whose prompts live inside a vendor designer cannot, whatever the export button says.',
      },
      {
        type: 'h2',
        text: 'Migration as translation',
      },
      {
        type: 'p',
        text: 'The tractable approach is to extract the workflow into a neutral intermediate representation — steps, tools, transitions, conditions — and generate the target from that. It makes the correctness-critical parts deterministic and reserves model assistance for the genuinely ambiguous part: recovering intent from a design that never stated it. [Wheatear](/builds/wheatear) is PulpLabs\' accelerator for exactly this.',
      },
      {
        type: 'figure',
        caption: 'Why an IR beats a rewrite',
        art: `source platform ──parse──▶ canonical IR ──generate──▶ target platform
                              │
                              ├── diffable: review the workflow, not the code
                              ├── testable: run the same evals against both
                              └── reusable: one parser per source, one generator per target`,
      },
      {
        type: 'callout',
        kind: 'warning',
        title: 'The evaluation set is the migration plan',
        text: 'Without a set of cases and expected outcomes, "it works the same" is an opinion. Build or recover the evaluation set first — on a migration it is the deliverable that makes the switch decidable.',
      },
      {
        type: 'h2',
        text: 'Proving equivalence',
      },
      {
        type: 'steps',
        items: [
          'Capture a representative set of real tasks from the source platform, with their outcomes.',
          'Run the same set against the target implementation with tool calls recorded.',
          'Compare outcomes, not transcripts — different wording with the same action taken is a pass.',
          'Shadow-run the target against live traffic with side effects disabled.',
          'Switch a small share of traffic, compare production signals, then move the rest.',
        ],
      },
      {
        type: 'h2',
        text: 'Reducing lock-in from the start',
      },
      {
        type: 'p',
        text: 'Keep prompts in version control, define tools in a schema you own, keep evaluation outside the platform, and prefer a protocol boundary such as MCP where several consumers need the same integration. None of these prevents using a managed runtime — they just make leaving it a project rather than a rebuild.',
      },
    ],
    exercise: {
      prompt:
        'You must move eleven agent workflows off a vendor runtime in a quarter. Two are business-critical. Sequence the work.',
      approach:
        'Start by recovering evaluation sets for all eleven from production traces — without them nothing is verifiable, and it is the work that parallelises best. Migrate two or three low-risk workflows first to build and validate the parse-and-generate path, since the second migration is far cheaper than the first. Leave the business-critical pair until the pipeline is proven, then shadow-run them with side effects disabled before any traffic switch. Track the portable assets — prompts, tool contracts, evals — into your own repository as you go; that is the part that stops this being necessary again.',
    },
    related: [
      { type: 'tech', ref: 'orchestration' },
      { type: 'project', ref: 'wheatear' },
    ],
  },
]
