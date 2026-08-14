/** Lessons for the Claude Certified Developer preparation track. */

export const developerLessons = [
  {
    slug: 'messages-and-turns',
    title: 'Messages, turns and stop reasons',
    summary: 'The request surface in full: what you send, what comes back, and what each stop reason obliges you to do next.',
    minutes: 12,
    topics: ['Request shape'],
    objectives: [
      'Assemble a valid request with system framing and alternating turns',
      'Read a response\'s content blocks and stop reason correctly',
      'Handle a truncated completion without corrupting the conversation',
    ],
    body: [
      {
        type: 'p',
        text: 'A request carries a model, a token ceiling, an optional system prompt, and a list of turns. The system prompt is a separate field rather than a message — it frames the whole exchange and is not part of the alternating conversation.',
      },
      {
        type: 'code',
        lang: 'python',
        file: 'client.py',
        code: `response = client.messages.create(
    model=MODEL,
    max_tokens=1024,
    system="You classify support tickets. Answer only with the category.",
    messages=[
        {"role": "user", "content": "Card declined at checkout, tried twice."},
    ],
)

print(response.stop_reason)              # "end_turn"
print(response.content[0].text)          # "billing"
print(response.usage.input_tokens, response.usage.output_tokens)`,
      },
      {
        type: 'h2',
        text: 'Content is a list of blocks',
      },
      {
        type: 'p',
        text: 'A response\'s `content` is always a list, not a string. A plain answer is one text block; a request to call a tool is a `tool_use` block; a reply that both explains and calls a tool contains both, in order. Code that reads `content[0].text` works until the first tool call and then throws.',
      },
      {
        type: 'code',
        lang: 'python',
        code: `# Fragile: assumes exactly one text block.
answer = response.content[0].text

# Correct: select the blocks you actually want.
text = "".join(b.text for b in response.content if b.type == "text")
calls = [b for b in response.content if b.type == "tool_use"]`,
      },
      {
        type: 'h2',
        text: 'Stop reasons are instructions to you',
      },
      {
        type: 'table',
        head: ['stop_reason', 'Means', 'What you must do'],
        rows: [
          ['`end_turn`', 'The model finished naturally', 'Use the answer'],
          ['`tool_use`', 'It wants a tool executed', 'Run it, append a `tool_result`, call again'],
          ['`max_tokens`', 'It hit your ceiling mid-answer', 'The output is truncated — do not parse it as complete'],
          ['`stop_sequence`', 'It produced a sequence you configured', 'Handle per your protocol'],
        ],
      },
      {
        type: 'callout',
        kind: 'warning',
        title: '`max_tokens` is a silent data corruptor',
        text: 'A truncated JSON object often still parses as a truncated string, and a truncated summary reads as a finished one. Check the stop reason before trusting output — this is the single most common bug in first production integrations.',
      },
      {
        type: 'h2',
        text: 'Turns must alternate',
      },
      {
        type: 'p',
        text: 'The message list alternates user and assistant. To continue a conversation you append the assistant\'s previous reply verbatim and then the next user turn — reconstructing or paraphrasing it changes what the model sees. For a tool exchange, the tool result goes in a **user** turn, because it is input to the model.',
      },
      {
        type: 'figure',
        caption: 'A tool exchange, in message order',
        art: `user       "What's the status of order 4182?"
assistant  [tool_use  id=t1  name=get_order  input={id: 4182}]
user       [tool_result  tool_use_id=t1  content="{...}"]
assistant  "Order 4182 shipped on Tuesday and is due Friday."`,
      },
      {
        type: 'h2',
        text: 'Prefilling the assistant turn',
      },
      {
        type: 'p',
        text: 'Ending the list with a partial assistant message constrains what comes next — a useful trick for forcing a format. The continuation begins exactly where you left off, so the prefix is not repeated in the response and you must stitch it back yourself.',
      },
    ],
    exercise: {
      prompt:
        'An extraction endpoint returns valid JSON 95% of the time and a `JSONDecodeError` the rest. The prompt is unchanged between calls. What is the most likely cause, and what is the fix?',
      approach:
        'The long 5% are hitting `max_tokens` and being truncated mid-object. Check `stop_reason` before parsing: if it is `max_tokens`, the response is incomplete by definition and no amount of parser tolerance makes it correct. Raise the ceiling for that task, reduce what you ask for in one call, and treat truncation as a distinct error path rather than a parse failure — the two need different handling.',
    },
    related: [{ type: 'tech', ref: 'messages-api' }],
  },

  {
    slug: 'streaming',
    title: 'Streaming responses',
    summary: 'Delivering tokens as they arrive without breaking parsing, cancellation, or the accounting.',
    minutes: 11,
    topics: ['Streaming'],
    objectives: [
      'Consume a stream and reassemble the final message',
      'Decide when streaming helps and when it cannot',
      'Cancel a stream and account for what it cost',
    ],
    body: [
      {
        type: 'p',
        text: 'Streaming sends the response as server-sent events instead of one body. The user sees the first words in a few hundred milliseconds rather than waiting for the whole answer, which changes perceived latency far more than a faster model does.',
      },
      {
        type: 'code',
        lang: 'python',
        code: `with client.messages.stream(
    model=MODEL,
    max_tokens=1024,
    messages=messages,
) as stream:
    for text in stream.text_stream:
        yield text                      # straight to the caller

    final = stream.get_final_message()  # full content, usage, stop_reason`,
      },
      {
        type: 'p',
        text: 'The SDK helper hides an event sequence worth knowing, because you will meet it raw in any non-SDK integration: `message_start`, then per block a `content_block_start`, a run of `content_block_delta`, and a `content_block_stop`, then `message_delta` carrying the stop reason and output usage, then `message_stop`.',
      },
      {
        type: 'h2',
        text: 'Deltas are not always text',
      },
      {
        type: 'p',
        text: 'For a tool call the deltas carry partial JSON for the tool input. That partial JSON is not parseable until the block completes — buffering it and attempting a parse on every delta is a common and expensive mistake.',
      },
      {
        type: 'table',
        head: ['Delta type', 'Carries', 'Safe to use immediately?'],
        rows: [
          ['`text_delta`', 'A fragment of the answer', 'Yes — append and render'],
          ['`input_json_delta`', 'A fragment of a tool\'s arguments', 'No — accumulate until the block stops'],
        ],
      },
      {
        type: 'h2',
        text: 'When streaming does not help',
      },
      {
        type: 'list',
        items: [
          '**Structured output you must validate.** Nothing can be used until the object is complete, so streaming adds complexity and no perceived speed.',
          '**Short answers.** A classification returning one word arrives in one delta.',
          '**Server-to-server pipelines.** No human is waiting; buffering is simpler and easier to retry.',
          '**Anything you intend to cache.** Cache the assembled result, not the event stream.',
        ],
      },
      {
        type: 'callout',
        kind: 'note',
        title: 'Long requests need streaming for a second reason',
        text: 'Very long completions can exceed intermediary and load-balancer idle timeouts when buffered. A stream keeps bytes flowing, which keeps the connection alive.',
      },
      {
        type: 'h2',
        text: 'Cancellation and cost',
      },
      {
        type: 'p',
        text: 'When a user navigates away, abort the stream — but record what was generated up to that point. Tokens produced before cancellation are still tokens produced, and a system that stops accounting at cancellation will under-report its own cost.',
      },
      {
        type: 'code',
        lang: 'ts',
        file: 'app/api/chat/route.ts',
        code: `export async function POST(req: Request) {
  const { messages } = await req.json()

  const stream = await anthropic.messages.stream(
    { model: MODEL, max_tokens: 1024, messages },
    // The browser aborting the fetch aborts the upstream call too.
    { signal: req.signal },
  )

  return new Response(stream.toReadableStream(), {
    headers: { 'Content-Type': 'text/event-stream' },
  })
}`,
      },
    ],
    exercise: {
      prompt:
        'A chat UI streams fine locally and buffers in production, arriving all at once after several seconds. The application code is identical. Where do you look?',
      approach:
        'Between the app and the browser. A reverse proxy or CDN is buffering the response — the usual causes are gzip buffering, a proxy that does not honour `text/event-stream`, or response buffering left on by default. Confirm by curling the production endpoint directly and watching whether bytes arrive incrementally; if they do, the problem is downstream of the app. Disable proxy buffering for that route and ensure no middleware is collecting the body before forwarding it.',
    },
    related: [{ type: 'tech', ref: 'messages-api' }],
  },

  {
    slug: 'tool-calling',
    title: 'Implementing tool use',
    summary: 'The full exchange in code: schemas, the loop, parallel calls, and errors the model can recover from.',
    minutes: 14,
    topics: ['Tool use'],
    objectives: [
      'Define a tool schema the model can use correctly',
      'Implement the request / execute / result loop',
      'Return failures in a form the model can act on',
    ],
    body: [
      {
        type: 'p',
        text: 'You describe the tools available; the model decides whether to call one. It never executes anything — it returns a `tool_use` block and waits. Everything about what actually happens is your code.',
      },
      {
        type: 'code',
        lang: 'python',
        code: `TOOLS = [
    {
        "name": "get_order",
        "description": (
            "Look up an order by its numeric id. Returns status, carrier and "
            "estimated delivery date. Use when the customer references a "
            "specific order. Do not guess ids."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "order_id": {"type": "integer", "description": "Numeric order id"},
            },
            "required": ["order_id"],
        },
    }
]`,
      },
      {
        type: 'p',
        text: 'The description is the only documentation the model receives. State what the tool does, what it returns, when to use it, and — where it matters — when not to. A vague description produces a tool that is called at the wrong moments.',
      },
      {
        type: 'h2',
        text: 'The loop',
      },
      {
        type: 'code',
        lang: 'python',
        file: 'agent/loop.py',
        code: `messages = [{"role": "user", "content": question}]

for _ in range(MAX_STEPS):
    response = client.messages.create(
        model=MODEL, max_tokens=1024, tools=TOOLS, messages=messages
    )

    if response.stop_reason != "tool_use":
        return "".join(b.text for b in response.content if b.type == "text")

    # Append the assistant turn verbatim — it carries the tool_use ids.
    messages.append({"role": "assistant", "content": response.content})

    results = []
    for block in response.content:
        if block.type != "tool_use":
            continue
        results.append({
            "type": "tool_result",
            "tool_use_id": block.id,          # must match, or the turn is invalid
            "content": run_tool(block.name, block.input),
        })

    messages.append({"role": "user", "content": results})

raise StepLimitExceeded(MAX_STEPS)`,
      },
      {
        type: 'callout',
        kind: 'warning',
        title: 'Every tool_use needs a tool_result',
        text: 'If the model requests three tools in one turn, all three results must come back in the next turn, each matched by `tool_use_id`. Returning a subset is a malformed conversation and the API rejects it.',
      },
      {
        type: 'h2',
        text: 'Errors are results, not exceptions',
      },
      {
        type: 'p',
        text: 'When a tool fails, return that failure as content with `is_error` set rather than raising. The model can then apologise, ask for a correction, or try a different approach. An exception thrown into your loop ends the turn and loses the conversation.',
      },
      {
        type: 'code',
        lang: 'python',
        code: `def run_tool(name: str, args: dict) -> str:
    try:
        return json.dumps(REGISTRY[name](**args))
    except NotFound as e:
        return json.dumps({"error": "not_found", "detail": str(e)})
    except PermissionDenied:
        # Never leak why. The model may repeat it to the user.
        return json.dumps({"error": "not_permitted"})`,
      },
      {
        type: 'h2',
        text: 'Forcing and preventing calls',
      },
      {
        type: 'p',
        text: '`tool_choice` controls the model\'s freedom: let it decide, require that it uses some tool, or require a specific one. Forcing a named tool is how you get reliable structured extraction — you define one tool whose schema is your output shape and require it.',
      },
      {
        type: 'h2',
        text: 'Validate arguments as hostile input',
      },
      {
        type: 'p',
        text: 'The schema constrains generation; it does not guarantee it. Validate types, ranges and identifiers inside the tool, and check the caller\'s permission there too. A tool that trusts its arguments because "the schema said integer" is one prompt injection away from being a problem.',
      },
    ],
    exercise: {
      prompt:
        'A tool occasionally receives an `order_id` belonging to a different customer. The schema is correct and the model is behaving reasonably. What is wrong, and where does the fix go?',
      approach:
        'Nothing constrains the model to ids the current user may see — it can echo an id from the conversation, from a retrieved document, or from a mistake. The fix is not in the prompt or the schema: the tool must resolve orders scoped to the authenticated user and return `not_permitted` otherwise. Authorisation belongs in the implementation with the real user identity, and the tool should log the attempt so a pattern of them is visible.',
    },
    related: [
      { type: 'tech', ref: 'tool-use' },
      { type: 'lesson', path: 'agent-systems-professional', lesson: 'tool-design' },
    ],
  },

  {
    slug: 'structured-json',
    title: 'Structured output you can rely on',
    summary: 'Schema-constrained responses, validation at the boundary, and one bounded repair.',
    minutes: 11,
    topics: ['Structured output'],
    objectives: [
      'Force a response into a schema using a tool definition',
      'Validate before anything downstream consumes the result',
      'Distinguish a shape failure from a grounding failure',
    ],
    body: [
      {
        type: 'p',
        text: 'Parsing prose with regular expressions is a maintenance liability. Define the output as a schema, require it, and validate the result — model output then becomes ordinary typed data at the boundary of your system.',
      },
      {
        type: 'code',
        lang: 'python',
        file: 'extract.py',
        code: `from pydantic import BaseModel, Field
from typing import Literal

class Ticket(BaseModel):
    category: Literal["bug", "billing", "feature_request", "no_action"]
    urgency: Literal["low", "medium", "high"]
    summary: str = Field(max_length=280)

EXTRACT_TOOL = {
    "name": "record_ticket",
    "description": "Record the classification for this ticket.",
    "input_schema": Ticket.model_json_schema(),
}

response = client.messages.create(
    model=MODEL,
    max_tokens=512,
    tools=[EXTRACT_TOOL],
    tool_choice={"type": "tool", "name": "record_ticket"},   # not optional
    messages=[{"role": "user", "content": ticket_text}],
)

block = next(b for b in response.content if b.type == "tool_use")
ticket = Ticket.model_validate(block.input)   # raises on violation`,
      },
      {
        type: 'p',
        text: 'Three jobs are done at once: generation is constrained, the result is validated, and the schema documents the contract for every downstream reader. The `Literal` types are what prevent an invented category.',
      },
      {
        type: 'h2',
        text: 'Designing the schema',
      },
      {
        type: 'list',
        items: [
          '**Enumerate wherever possible.** Free text where an enum would do is a future parsing bug.',
          '**Include an explicit "cannot answer" value.** Without one the model must pick something, and it will.',
          '**Keep it flat.** Deep nesting produces more validation failures for the same information.',
          '**Ask for citations as fields**, not woven into prose, so grounding can be checked in code.',
        ],
      },
      {
        type: 'h2',
        text: 'One repair, then fail',
      },
      {
        type: 'code',
        lang: 'python',
        code: `def extract(text: str, attempts: int = 2) -> Ticket:
    messages = [{"role": "user", "content": text}]

    for attempt in range(attempts):
        raw = call_with_tool(messages)
        try:
            return Ticket.model_validate(raw)
        except ValidationError as e:
            if attempt == attempts - 1:
                raise                       # surface it; do not substitute a default
            messages += [
                {"role": "assistant", "content": json.dumps(raw)},
                {"role": "user", "content": f"That failed validation:\\n{e}\\nReturn corrected data."},
            ]`,
      },
      {
        type: 'callout',
        kind: 'warning',
        title: 'A default is a silent wrong answer',
        text: 'Swallowing a validation failure and substituting `category="no_action"` produces a pipeline that is quietly incorrect. An error an operator can see is worth more than a plausible value nobody questions.',
      },
      {
        type: 'h2',
        text: 'Shape is not grounding',
      },
      {
        type: 'p',
        text: 'A response can satisfy the schema perfectly and still contain a value that appears nowhere in the source. No schema catches that. Where it matters, require the model to return the verbatim span each field came from, then assert in code that the span occurs in the source text.',
      },
      {
        type: 'p',
        text: 'Model-reported confidence is not a substitute. A `confidence: 0.95` field is a generated token, not a calibrated probability — useful for relative ranking at most, and never as a threshold for an irreversible action.',
      },
    ],
    exercise: {
      prompt:
        'An invoice extractor returns a `total` that is correctly typed and formatted but does not appear on the invoice. Validation passes. How do you catch this class of error?',
      approach:
        'Schema validation cannot help — the failure is grounding, not shape. Add a `source_span` field per extracted value and assert programmatically that the span occurs verbatim in the document text; reject values whose span does not match. For numbers, a second deterministic check is cheap and worth it: recompute the total from the line items and compare. Both checks are ordinary code, not another model call.',
    },
    related: [
      { type: 'tech', ref: 'structured-output' },
      { type: 'exam', ref: 'claude-developer' },
    ],
  },

  {
    slug: 'caching-and-batching',
    title: 'Prompt caching and batch processing',
    summary: 'Two mechanisms that change the economics of a workload, and the conditions each one needs.',
    minutes: 11,
    topics: ['Cost controls'],
    objectives: [
      'Structure a prompt so a cache can be hit',
      'Recognise a workload that belongs in a batch',
      'Measure the saving rather than assuming it',
    ],
    body: [
      {
        type: 'p',
        text: 'Two levers move cost and latency without touching quality. Prompt caching reuses an already-processed prefix across calls. Batch processing trades immediacy for a substantially lower price on work nobody is waiting for.',
      },
      {
        type: 'h2',
        text: 'Caching needs a stable prefix',
      },
      {
        type: 'p',
        text: 'A cache is keyed on an exact prefix. Everything constant — system prompt, tool definitions, a policy document, few-shot examples — goes at the front and is marked as cacheable; everything that varies goes after it. Interleaving a timestamp or a user name into the middle of that block defeats it entirely.',
      },
      {
        type: 'code',
        lang: 'python',
        code: `system = [
    {
        "type": "text",
        "text": POLICY_DOCUMENT,              # long, identical on every call
        "cache_control": {"type": "ephemeral"},
    },
]

response = client.messages.create(
    model=MODEL,
    max_tokens=1024,
    system=system,
    messages=[{"role": "user", "content": question}],   # the variable part
)

print(response.usage.cache_read_input_tokens)      # > 0 means it hit`,
      },
      {
        type: 'callout',
        kind: 'note',
        title: 'Measure the hit rate',
        text: 'Cache creation costs more than an ordinary input token; a cache that never gets read is a net loss. Log the creation and read counts from `usage` and check the ratio before claiming a saving.',
      },
      {
        type: 'table',
        head: ['Caches well', 'Caches badly'],
        rows: [
          ['A long system prompt reused across users', 'A prompt with the user name in the first line'],
          ['A fixed tool catalogue', 'Tools assembled per request in varying order'],
          ['A document answered against many times', 'A document seen once'],
        ],
      },
      {
        type: 'h2',
        text: 'Batching',
      },
      {
        type: 'p',
        text: 'The Batches API takes many requests and returns results asynchronously at a lower price, with a completion window measured in hours. It fits any workload where no human is waiting: nightly enrichment, back-filling classifications, generating an evaluation set, re-scoring a corpus after a prompt change.',
      },
      {
        type: 'list',
        items: [
          '**Design for partial results.** Individual requests can fail; the batch still completes.',
          '**Include your own id per request** so results can be joined back to your records.',
          '**Do not batch anything interactive.** The window is hours, not seconds.',
          '**Batch and cache compose** — a shared prefix across a batch is still a shared prefix.',
        ],
      },
      {
        type: 'h2',
        text: 'Choosing between them',
      },
      {
        type: 'figure',
        caption: 'A decision that takes ten seconds',
        art: `Is a person waiting for this answer?
├── yes → interactive: cache the prefix, stream the output
└── no  → is it more than a few hundred requests?
          ├── yes → batch it
          └── no  → just run it`,
      },
    ],
    exercise: {
      prompt:
        'A team enables prompt caching on a support assistant and sees no cost reduction. Their system prompt is 4,000 tokens and identical for every user. What would you check?',
      approach:
        'Check where the variable content sits. The usual cause is something user-specific — a name, a locale, a timestamp, a session id — appended inside or before the cached block, which changes the prefix on every call and produces a miss every time. Read `cache_read_input_tokens` on a sample of requests: if it is consistently zero the prefix is not stable. Also confirm the prefix is long enough to be cacheable at all and that calls arrive frequently enough that the entry has not expired between them.',
    },
    related: [
      { type: 'lesson', path: 'claude-certified-architect', lesson: 'cost-latency-reliability' },
      { type: 'tech', ref: 'context-engineering' },
    ],
  },

  {
    slug: 'errors-and-retries',
    title: 'Errors, rate limits and resilience',
    summary: 'What each status code means, which are worth retrying, and how not to make an incident worse.',
    minutes: 11,
    topics: ['Errors'],
    objectives: [
      'Classify an API error as retryable or terminal',
      'Implement backoff that does not amplify an outage',
      'Keep a partially completed multi-step task recoverable',
    ],
    body: [
      {
        type: 'p',
        text: 'Model calls fail the way every network dependency fails, with one addition: some failures are about the shape of your request and no amount of retrying will change them. Classifying correctly is the whole skill.',
      },
      {
        type: 'table',
        head: ['Status', 'Meaning', 'Retry?'],
        rows: [
          ['400', 'Invalid request — malformed messages, bad schema', 'No. Fix the request.'],
          ['401 / 403', 'Authentication or permission', 'No. Fix credentials.'],
          ['404', 'Unknown model or resource', 'No. Usually a deprecated model id.'],
          ['413', 'Request too large', 'No. Trim context and re-send.'],
          ['429', 'Rate limited', 'Yes — honour retry-after, back off, add jitter.'],
          ['500', 'Server error', 'Yes, a bounded number of times.'],
          ['529', 'Overloaded', 'Yes, with longer backoff — the service is shedding load.'],
        ],
      },
      {
        type: 'callout',
        kind: 'warning',
        title: 'Retrying a 400 forever is a real outage',
        text: 'A malformed request in a queue-driven worker with naive retry logic will loop until someone notices the bill. Terminal errors must dead-letter, not retry.',
      },
      {
        type: 'h2',
        text: 'Backoff with jitter',
      },
      {
        type: 'code',
        lang: 'python',
        code: `RETRYABLE = {429, 500, 502, 503, 529}

def call_with_retry(fn, attempts: int = 4):
    for attempt in range(attempts):
        try:
            return fn()
        except APIStatusError as e:
            if e.status_code not in RETRYABLE or attempt == attempts - 1:
                raise
            # Honour the server's instruction when it gives one.
            wait = float(e.response.headers.get("retry-after", 0)) or 2 ** attempt
            # Jitter: without it, every client retries in the same instant.
            time.sleep(wait * (0.5 + random.random()))`,
      },
      {
        type: 'p',
        text: 'The jitter line is not a detail. Synchronised retries after a brief blip produce a thundering herd that turns a two-second degradation into a sustained one.',
      },
      {
        type: 'h2',
        text: 'Rate limits are a budget to spend deliberately',
      },
      {
        type: 'list',
        items: [
          '**Separate interactive from background traffic.** A bulk job should never consume the capacity a user-facing request needs.',
          '**Shed low-priority work first** when limits bite, rather than degrading everything equally.',
          '**Queue rather than fail** where the task tolerates it, with an honest status shown to the user.',
          '**Track limit headroom as a metric.** Hitting 429s regularly is a capacity decision, not an error.',
        ],
      },
      {
        type: 'h2',
        text: 'Recoverable multi-step work',
      },
      {
        type: 'p',
        text: 'A five-step agent task that fails at step four should not restart from step one — it wastes tokens and may repeat a side effect. Persist the message list after each step, key the run with an idempotency key, and make tools that write safe to call twice.',
      },
      {
        type: 'code',
        lang: 'python',
        code: `run = store.load(run_id) or Run(id=run_id, messages=[first_turn])

while not run.done and run.steps < MAX_STEPS:
    response = call_with_retry(lambda: client.messages.create(**run.request()))
    run.advance(response)
    store.save(run)          # checkpoint every step, so a crash resumes here`,
      },
    ],
    exercise: {
      prompt:
        'During a provider slowdown your error rate goes from 2% to 80% and stays there for twenty minutes after the provider recovers. Retries are three attempts with a fixed one-second delay. Explain the shape of that graph.',
      approach:
        'Fixed-delay retries synchronise: every failing client retries at the same moment, tripling load exactly when the service is shedding it, and the retries themselves sustain the overload after the original cause passes. The tail after recovery is your own traffic. Fix with exponential backoff plus jitter, honour `retry-after`, cap total attempts, and add a circuit breaker so that sustained failure stops sending requests entirely for a cool-off period rather than hammering a recovering service.',
    },
    related: [
      { type: 'lesson', path: 'claude-certified-architect', lesson: 'cost-latency-reliability' },
      { type: 'exam', ref: 'claude-developer' },
    ],
  },
]
