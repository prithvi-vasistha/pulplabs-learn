/**
 * Mock exams for the Claude tracks.
 *
 * These are independent practice papers written by PulpLabs. They are not
 * official questions, not drawn from any vendor's bank, and not a predictor of
 * a real result — they exist to find the topics you should study next.
 *
 * Question types: single | multiple | boolean | code | scenario
 * `correct` is always an array of option ids, so single and multiple share one
 * grading path. Nothing in this file reaches the browser during an attempt —
 * see src/lib/exam-engine.js, which strips `correct` and `explanation`.
 */

export const claudeArchitect = {
  slug: 'claude-architect',
  title: 'Claude Certified Architect — Mock Exam',
  summary:
    'Scenario questions on model selection, context strategy, retrieval boundaries, integration design, evaluation and production operations.',
  level: 'Advanced',
  minutes: 30,
  passing: 70,
  technologies: ['claude', 'context-engineering', 'retrieval', 'mcp', 'evaluation'],
  topics: ['Model selection', 'Context strategy', 'Retrieval architecture', 'Integration boundaries', 'Evaluation', 'Operations'],
  rules: [
    'Twelve questions, thirty minutes. The timer starts when you begin.',
    'Several questions are scenario-based and deliberately longer than one line.',
    'You can move between questions freely and flag any question for review.',
    'Answers are graded on the server when you submit — nothing is revealed before then.',
    'Your attempt is stored in this browser so you can review it later.',
  ],
  topicLinks: {
    'Model selection': { label: 'Choosing a model for the workload', href: '/learn/claude-certified-architect/model-selection' },
    'Context strategy': { label: 'Context strategy', href: '/learn/claude-certified-architect/context-strategy' },
    'Retrieval architecture': { label: 'Where retrieval belongs', href: '/learn/claude-certified-architect/retrieval-architecture' },
    'Integration boundaries': { label: 'Tools, MCP, and integration boundaries', href: '/learn/claude-certified-architect/integration-boundaries' },
    Evaluation: { label: 'Evaluation and rollout', href: '/learn/claude-certified-architect/evaluation-and-rollout' },
    Operations: { label: 'Cost, latency and reliability', href: '/learn/claude-certified-architect/cost-latency-reliability' },
  },
  questions: [
    {
      id: 'ca1',
      type: 'scenario',
      topic: 'Model selection',
      difficulty: 2,
      prompt:
        'A pipeline classifies 40,000 documents a day, extracts six fields from each, and writes one summary per document. A team proposes using the most capable model for all three steps. What is the strongest architectural objection?',
      options: [
        { id: 'a', text: 'Capable models cannot perform classification accurately' },
        { id: 'b', text: 'Classification and extraction are narrow, schema-constrained tasks that a faster, cheaper model usually clears — and they run 40,000 times each' },
        { id: 'c', text: 'Running one model for three steps prevents streaming' },
        { id: 'd', text: 'A single model cannot be evaluated per step' },
      ],
      correct: ['b'],
      explanation:
        'The objection is unit economics plus fit. Narrow tasks with a constrained output space are where a fast model is usually indistinguishable, and they carry the volume. Reserve the capable model for synthesis, and measure each step separately so the claim is evidence rather than preference.',
    },
    {
      id: 'ca2',
      type: 'single',
      topic: 'Model selection',
      difficulty: 2,
      prompt: 'Which pair of numbers should be stated before choosing a model for an interactive feature?',
      options: [
        { id: 'a', text: 'Parameter count and training cut-off' },
        { id: 'b', text: 'The latency the interface can absorb, and the per-call cost at expected volume' },
        { id: 'c', text: 'Context window size and temperature' },
        { id: 'd', text: 'Benchmark score and release date' },
      ],
      correct: ['b'],
      explanation:
        'Model choice is a budget decision. Without a latency ceiling and a cost-per-call at volume there is no criterion to choose against, and the discussion collapses into preference. Context window matters, but it is sized from the workload rather than chosen first.',
    },
    {
      id: 'ca3',
      type: 'scenario',
      topic: 'Context strategy',
      difficulty: 3,
      prompt:
        'A support assistant contradicts decisions made earlier in the same conversation, and it correlates with conversation length rather than question difficulty. History is truncated with a sliding window. What is the durable fix?',
      options: [
        { id: 'a', text: 'Raise the temperature so the model considers more options' },
        { id: 'b', text: 'Extract commitments and constraints to a fact store included in every turn, and retrieve older detail on demand' },
        { id: 'c', text: 'Switch to a larger context window and send the whole history every time' },
        { id: 'd', text: 'Instruct the model in the system prompt not to contradict itself' },
      ],
      correct: ['b'],
      explanation:
        'The sliding window has dropped the turns containing those decisions, so they no longer exist for the model. A larger window postpones the problem and multiplies cost; an instruction cannot recover information that is not present. Promoting durable facts and retrieving detail keeps context bounded while the commitments survive.',
    },
    {
      id: 'ca4',
      type: 'single',
      topic: 'Context strategy',
      difficulty: 2,
      prompt: 'Why does a long, stable system prompt belong at the very front of the request when prompt caching is in use?',
      options: [
        { id: 'a', text: 'The model reads the beginning of the prompt more carefully' },
        { id: 'b', text: 'A cache is keyed on an exact prefix, so any variable content placed before or inside the stable block produces a miss' },
        { id: 'c', text: 'Caching only applies to system prompts' },
        { id: 'd', text: 'It reduces the output token count' },
      ],
      correct: ['b'],
      explanation:
        'Caching reuses a processed prefix. Interleaving a user name, timestamp or session id into that block changes the prefix on every call and defeats it. Structure the prompt as stable-then-variable and verify with the cache read counts in usage.',
    },
    {
      id: 'ca5',
      type: 'scenario',
      topic: 'Retrieval architecture',
      difficulty: 3,
      prompt:
        'An internal assistant must never surface a policy document outside the reader\'s region. Which design satisfies that requirement?',
      options: [
        { id: 'a', text: 'Instruct the model not to reveal out-of-region documents' },
        { id: 'b', text: 'Retrieve everything, then filter the generated answer for region names' },
        { id: 'c', text: 'Filter at the index: the retriever is scoped by the requesting user before any chunk is returned' },
        { id: 'd', text: 'Put the region in the system prompt so the model knows which documents apply' },
      ],
      correct: ['c'],
      explanation:
        'A prompt instruction is a mitigation that reduces a rate; index-level filtering is a control that enforces a rule. If out-of-region content reaches the context, it can leak — through a quote, a summary, or an injection. Scope the retriever, and log what was retrieved per request.',
    },
    {
      id: 'ca6',
      type: 'single',
      topic: 'Retrieval architecture',
      difficulty: 2,
      prompt: 'When is exposing retrieval as a tool preferable to pre-fetching context before the call?',
      options: [
        { id: 'a', text: 'Always — it reduces token usage' },
        { id: 'b', text: 'When the task is exploratory and the first query is unlikely to be the right one' },
        { id: 'c', text: 'When latency must be strictly predictable' },
        { id: 'd', text: 'When the corpus is small' },
      ],
      correct: ['b'],
      explanation:
        'Model-initiated retrieval lets the model refine its own query and search again, which is exactly what an exploratory task needs. The cost is unbounded round trips and less predictable latency and spend — so pre-fetching wins where the query maps cleanly onto a search.',
    },
    {
      id: 'ca7',
      type: 'single',
      topic: 'Integration boundaries',
      difficulty: 2,
      prompt: 'Four applications need the same third-party integration, and two teams own them. What does an MCP server primarily buy here?',
      options: [
        { id: 'a', text: 'Lower model latency' },
        { id: 'b', text: 'It collapses N applications × M integrations into N clients and M servers, and puts the integration\'s credentials in one process with one audit trail' },
        { id: 'c', text: 'It removes the need to define tool schemas' },
        { id: 'd', text: 'It guarantees the model calls tools correctly' },
      ],
      correct: ['b'],
      explanation:
        'The leverage is the collapse of the integration matrix and an explicit trust boundary. It does not make the model better at choosing tools, and for a single consumer it is pure indirection.',
    },
    {
      id: 'ca8',
      type: 'multiple',
      topic: 'Integration boundaries',
      difficulty: 3,
      prompt: 'Which statements about an MCP server are true? Select all that apply.',
      options: [
        { id: 'a', text: 'It authenticates itself to the system it wraps; end-user identity must be passed and enforced separately' },
        { id: 'b', text: 'It exposes tools, resources and prompts as distinct primitives' },
        { id: 'c', text: 'It replaces your application\'s authorisation layer for end users' },
        { id: 'd', text: 'Fetching a document is better modelled as a resource than as a tool' },
      ],
      correct: ['a', 'b', 'd'],
      explanation:
        'A server holds its own credentials for the wrapped system and knows nothing about your end users unless you pass that through — treating it as an authorisation layer is the classic mistake. Tools are actions, resources are readable content, prompts are reusable templates.',
    },
    {
      id: 'ca9',
      type: 'scenario',
      topic: 'Evaluation',
      difficulty: 3,
      prompt:
        'A model upgrade raises the average judge score from 7.2 to 7.8 offline. A week after rollout, escalations to human agents rise 15%. What is the process failure?',
      options: [
        { id: 'a', text: 'The judge model was too small' },
        { id: 'b', text: 'The aggregate hid a per-tag regression, and rollout was not gated on a production signal such as escalation rate' },
        { id: 'c', text: 'The offline set was too large' },
        { id: 'd', text: 'Temperature was not pinned' },
      ],
      correct: ['b'],
      explanation:
        'A mean can rise while one category collapses — usually refusals or long-tail cases. Report per tag, gate on "no case drops", and stage the rollout against a live signal that the offline set cannot see. Then add the escalating cases to the golden set permanently.',
    },
    {
      id: 'ca10',
      type: 'single',
      topic: 'Evaluation',
      difficulty: 2,
      prompt: 'Why track retrieval recall and answer quality as separate metrics?',
      options: [
        { id: 'a', text: 'Because retrieval is more important than generation' },
        { id: 'b', text: 'An end-to-end score reports that something is wrong without indicating which component moved' },
        { id: 'c', text: 'Because judges cannot score retrieval' },
        { id: 'd', text: 'To reduce evaluation cost' },
      ],
      correct: ['b'],
      explanation:
        'Component metrics turn a regression into a location. If recall is unchanged and answer quality dropped, the change is in generation; if recall dropped, nothing about the prompt explains it. Without the split, every regression starts an argument.',
    },
    {
      id: 'ca11',
      type: 'scenario',
      topic: 'Operations',
      difficulty: 3,
      prompt:
        'Leadership asks what your assistant does during a two-hour provider outage. Which answer is the architect\'s answer?',
      options: [
        { id: 'a', text: 'Nothing — the feature is unavailable and users see an error' },
        { id: 'b', text: 'Retrieval and search keep working, so the product falls back to ranked source passages with a visible notice; generation-dependent writes queue with an honest status, switchable by flag without a deploy' },
        { id: 'c', text: 'Retry continuously until the provider recovers' },
        { id: 'd', text: 'Automatically fail over to a second provider using the same prompts' },
      ],
      correct: ['b'],
      explanation:
        'A designed degraded mode keeps the product useful and honest. Continuous retry adds load to a struggling dependency and burns budget. An untested failover is an outage with extra steps — a second provider needs its own evaluation run and prompts tested against it before it can be trusted.',
    },
    {
      id: 'ca12',
      type: 'multiple',
      topic: 'Operations',
      difficulty: 2,
      prompt: 'Which belong in a trace that must explain a bad answer a month later? Select all that apply.',
      options: [
        { id: 'a', text: 'The prompt version and the exact model identifier' },
        { id: 'b', text: 'The ids of the retrieved chunks' },
        { id: 'c', text: 'Tool calls with their arguments and results' },
        { id: 'd', text: 'Input and output token counts' },
      ],
      correct: ['a', 'b', 'c', 'd'],
      explanation:
        'All four. Prompt and model version make the run reproducible, retrieved ids show what the model could see, tool calls show what it did, and token counts make cost regressions visible. Redact sensitive content at write time and set a retention period, but do not log so little that a complaint is unanswerable.',
    },
  ],
}

export const claudeDeveloper = {
  slug: 'claude-developer',
  title: 'Claude Certified Developer — Mock Exam',
  summary:
    'The request surface in detail: content blocks and stop reasons, streaming, the tool-use exchange, structured output, caching, and error classification.',
  level: 'Intermediate',
  minutes: 30,
  passing: 70,
  technologies: ['messages-api', 'tool-use', 'structured-output', 'python'],
  topics: ['Request shape', 'Streaming', 'Tool use', 'Structured output', 'Cost controls', 'Errors'],
  rules: [
    'Twelve questions, thirty minutes.',
    'Some questions include code. Read the whole snippet before answering.',
    'Move freely between questions; flag anything you want to revisit.',
    'Grading happens on the server at submission — correct answers are never sent to the browser beforehand.',
    'Your attempt is stored in this browser so you can review it later.',
  ],
  topicLinks: {
    'Request shape': { label: 'Messages, turns and stop reasons', href: '/learn/claude-certified-developer/messages-and-turns' },
    Streaming: { label: 'Streaming responses', href: '/learn/claude-certified-developer/streaming' },
    'Tool use': { label: 'Implementing tool use', href: '/learn/claude-certified-developer/tool-calling' },
    'Structured output': { label: 'Structured output you can rely on', href: '/learn/claude-certified-developer/structured-json' },
    'Cost controls': { label: 'Prompt caching and batch processing', href: '/learn/claude-certified-developer/caching-and-batching' },
    Errors: { label: 'Errors, rate limits and resilience', href: '/learn/claude-certified-developer/errors-and-retries' },
  },
  questions: [
    {
      id: 'cd1',
      type: 'code',
      topic: 'Request shape',
      difficulty: 2,
      lang: 'python',
      code: `response = client.messages.create(
    model=MODEL, max_tokens=200, tools=TOOLS,
    messages=[{"role": "user", "content": question}],
)

answer = response.content[0].text`,
      prompt: 'Why is the last line unsafe?',
      options: [
        { id: 'a', text: '`content` is a list of blocks — the first may be a `tool_use` block, which has no `.text`' },
        { id: 'b', text: '`content` is only populated when streaming is disabled' },
        { id: 'c', text: '`response.content` is a string, so indexing returns a character' },
        { id: 'd', text: 'It is safe as long as `max_tokens` is large enough' },
      ],
      correct: ['a'],
      explanation:
        'Content is always a list of typed blocks. With tools available the model may return a `tool_use` block first, or both text and tool_use in one reply. Select by type: join the text blocks, and collect tool_use blocks separately.',
    },
    {
      id: 'cd2',
      type: 'single',
      topic: 'Request shape',
      difficulty: 2,
      prompt: 'A JSON extractor fails to parse roughly 5% of responses. The prompt is unchanged between calls. What should you check first?',
      options: [
        { id: 'a', text: 'Whether `stop_reason` is `max_tokens`, meaning the output was truncated mid-object' },
        { id: 'b', text: 'Whether the temperature is too high' },
        { id: 'c', text: 'Whether the model version changed' },
        { id: 'd', text: 'Whether the API key has expired' },
      ],
      correct: ['a'],
      explanation:
        'The longest responses hit the ceiling and are cut off, which produces invalid JSON with no error from the API. Check the stop reason before parsing and treat truncation as its own error path — a more tolerant parser would only hide it.',
    },
    {
      id: 'cd3',
      type: 'single',
      topic: 'Request shape',
      difficulty: 2,
      prompt: 'In a tool exchange, which role carries the `tool_result` block back to the model?',
      options: [
        { id: 'a', text: 'assistant' },
        { id: 'b', text: 'user' },
        { id: 'c', text: 'system' },
        { id: 'd', text: 'tool' },
      ],
      correct: ['b'],
      explanation:
        'The tool result is input to the model, so it goes in a user turn, immediately after the assistant turn containing the `tool_use` block — which must be appended verbatim, because it carries the ids the results are matched against.',
    },
    {
      id: 'cd4',
      type: 'single',
      topic: 'Streaming',
      difficulty: 2,
      prompt: 'While streaming a tool call, what do `input_json_delta` events carry?',
      options: [
        { id: 'a', text: 'Complete JSON objects, one per event' },
        { id: 'b', text: 'Fragments of the tool arguments that are only parseable once the content block ends' },
        { id: 'c', text: 'The tool\'s return value' },
        { id: 'd', text: 'The schema the model was given' },
      ],
      correct: ['b'],
      explanation:
        'Tool arguments stream as partial JSON. Attempting a parse on each delta wastes work and fails until the final fragment arrives; accumulate the string and parse when the block stops.',
    },
    {
      id: 'cd5',
      type: 'multiple',
      topic: 'Streaming',
      difficulty: 2,
      prompt: 'In which cases does streaming add complexity without a user-visible benefit? Select all that apply.',
      options: [
        { id: 'a', text: 'A classification returning a single word' },
        { id: 'b', text: 'A structured extraction that must validate before use' },
        { id: 'c', text: 'A long explanatory answer in a chat interface' },
        { id: 'd', text: 'A server-to-server batch job with no human waiting' },
      ],
      correct: ['a', 'b', 'd'],
      explanation:
        'Streaming pays off where a human reads partial output as it arrives. A one-word answer arrives in one delta, a structured result is unusable until complete, and a background job has no observer. The chat answer is the case it exists for.',
    },
    {
      id: 'cd6',
      type: 'code',
      topic: 'Tool use',
      difficulty: 3,
      lang: 'python',
      code: `messages.append({"role": "assistant", "content": response.content})

results = [r for r in run_first_tool(response)]   # returns one result
messages.append({"role": "user", "content": results})`,
      prompt: 'The model requested three tools in one turn. What happens?',
      options: [
        { id: 'a', text: 'The remaining two are called automatically on the next request' },
        { id: 'b', text: 'The request is invalid: every `tool_use` block must have a matching `tool_result` in the next turn' },
        { id: 'c', text: 'The model silently ignores the missing results' },
        { id: 'd', text: 'The two unmatched calls are queued by the API' },
      ],
      correct: ['b'],
      explanation:
        'Results are matched by `tool_use_id`, and all requested calls must be answered in the following turn. Returning a subset produces a malformed conversation that the API rejects — execute all of them, in parallel where they are independent.',
    },
    {
      id: 'cd7',
      type: 'single',
      topic: 'Tool use',
      difficulty: 3,
      prompt:
        'A tool occasionally receives an order id belonging to a different customer. The schema is correct and the model is behaving reasonably. Where does the fix belong?',
      options: [
        { id: 'a', text: 'In the tool description, telling the model to use only ids belonging to the current customer' },
        { id: 'b', text: 'In the tool implementation, which must resolve orders scoped to the authenticated user and return a permission error otherwise' },
        { id: 'c', text: 'In the schema, by adding a customer_id field' },
        { id: 'd', text: 'In the system prompt, by including the customer\'s order list' },
      ],
      correct: ['b'],
      explanation:
        'An id can arrive from the conversation, a retrieved document, or a mistake. Authorisation is a control and belongs in code with the real user identity — a description is a mitigation. The tool should also log the attempt so a pattern is visible.',
    },
    {
      id: 'cd8',
      type: 'single',
      topic: 'Structured output',
      difficulty: 2,
      prompt: 'What is the most reliable way to force a response into a fixed schema?',
      options: [
        { id: 'a', text: 'Ask for JSON in the prompt and parse what comes back' },
        { id: 'b', text: 'Define a tool whose input schema is the output shape, and require it with `tool_choice`' },
        { id: 'c', text: 'Set temperature to 0' },
        { id: 'd', text: 'Use a stop sequence of `}`' },
      ],
      correct: ['b'],
      explanation:
        'Requiring a named tool constrains generation to the schema and gives you a validated object rather than a string to parse. Temperature affects sampling, not structure, and a stop sequence truncates rather than constrains.',
    },
    {
      id: 'cd9',
      type: 'scenario',
      topic: 'Structured output',
      difficulty: 3,
      prompt:
        'An invoice extractor returns a `total` that is correctly typed and well formatted but appears nowhere on the invoice. Schema validation passes. How do you catch this class of error?',
      options: [
        { id: 'a', text: 'Tighten the schema with a stricter numeric format' },
        { id: 'b', text: 'Require a verbatim source span per field and assert in code that the span occurs in the document; independently recompute the total from line items' },
        { id: 'c', text: 'Ask the model for a confidence score and reject low values' },
        { id: 'd', text: 'Retry until two runs agree' },
      ],
      correct: ['b'],
      explanation:
        'This is a grounding failure, not a shape failure, so no schema catches it. Source spans make it checkable with ordinary code, and for arithmetic a deterministic recomputation is cheap. Model-reported confidence is a generated token, not a calibrated probability.',
    },
    {
      id: 'cd10',
      type: 'scenario',
      topic: 'Cost controls',
      difficulty: 3,
      prompt:
        'A team enables prompt caching on a 4,000-token system prompt that is identical for every user, and sees no cost reduction. What is the most likely cause?',
      options: [
        { id: 'a', text: 'Caching only applies to output tokens' },
        { id: 'b', text: 'Something user-specific — a name, locale, timestamp or session id — sits inside or before the cached block, changing the prefix on every call' },
        { id: 'c', text: 'The system prompt is too long to cache' },
        { id: 'd', text: 'Caching requires streaming to be disabled' },
      ],
      correct: ['b'],
      explanation:
        'A cache is keyed on an exact prefix. Confirm by reading the cache read counts in usage: consistently zero means the prefix is not stable. Move all variable content after the cached block, and check that calls arrive often enough that the entry has not expired.',
    },
    {
      id: 'cd11',
      type: 'multiple',
      topic: 'Errors',
      difficulty: 2,
      prompt: 'Which of these should be retried with backoff? Select all that apply.',
      options: [
        { id: 'a', text: '429 rate limited' },
        { id: 'b', text: '400 invalid request' },
        { id: 'c', text: '529 overloaded' },
        { id: 'd', text: '500 server error' },
      ],
      correct: ['a', 'c', 'd'],
      explanation:
        'A 400 is terminal — the request itself is wrong and retrying it will fail identically, forever, which in a queue-driven worker becomes a real outage. Rate limits, overload and server errors are transient; honour `retry-after` where present and always add jitter.',
    },
    {
      id: 'cd12',
      type: 'scenario',
      topic: 'Errors',
      difficulty: 3,
      prompt:
        'During a provider slowdown your error rate jumps to 80% and stays there for twenty minutes after the provider recovers. Retries are three attempts with a fixed one-second delay. Explain the tail.',
      options: [
        { id: 'a', text: 'The provider is rate limiting your account permanently' },
        { id: 'b', text: 'Fixed-delay retries synchronise across clients, tripling load exactly when the service is shedding it — the tail after recovery is your own retry traffic' },
        { id: 'c', text: 'The SDK caches failed responses' },
        { id: 'd', text: 'Connection pooling exhausted the socket limit' },
      ],
      correct: ['b'],
      explanation:
        'Synchronised retries produce a thundering herd that sustains the overload past its original cause. Use exponential backoff with jitter, honour `retry-after`, cap attempts, and add a circuit breaker so sustained failure stops traffic for a cool-off rather than hammering a recovering service.',
    },
  ],
}
