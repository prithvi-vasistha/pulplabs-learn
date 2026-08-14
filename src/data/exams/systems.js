/** Mock exams for the retrieval and agent tracks. */

export const ragSystems = {
  slug: 'rag-systems',
  title: 'RAG Systems — Mock Exam',
  summary:
    'Chunking, hybrid retrieval, reranking, grounding and the component metrics that tell you which half of the system is at fault.',
  level: 'Intermediate',
  minutes: 25,
  passing: 70,
  technologies: ['retrieval', 'embeddings', 'evaluation'],
  topics: ['Chunking', 'Search', 'Reranking', 'Grounding', 'Evaluation', 'Operations'],
  rules: [
    'Ten questions, twenty-five minutes.',
    'Move freely between questions; flag anything you want to revisit.',
    'Grading happens on the server at submission.',
    'Your attempt is stored in this browser so you can review it later.',
  ],
  topicLinks: {
    Chunking: { label: 'Chunking that survives retrieval', href: '/learn/rag-systems-specialist/chunking' },
    Search: { label: 'Vector, lexical, hybrid', href: '/learn/rag-systems-specialist/hybrid-search' },
    Reranking: { label: 'Reranking the shortlist', href: '/learn/rag-systems-specialist/reranking' },
    Grounding: { label: 'Grounding and citations', href: '/learn/rag-systems-specialist/grounding' },
    Evaluation: { label: 'Measuring retrieval separately', href: '/learn/rag-systems-specialist/rag-evaluation' },
    Operations: { label: 'Operating a corpus', href: '/learn/rag-systems-specialist/rag-operations' },
  },
  questions: [
    {
      id: 'rs1',
      type: 'scenario',
      topic: 'Chunking',
      difficulty: 2,
      prompt:
        'An assistant answers prose pages well but cites the wrong parameter on an API reference page consisting of long tables. What is the most likely cause?',
      options: [
        { id: 'a', text: 'The embedding model is too small for technical content' },
        { id: 'b', text: 'Fixed-size chunking cut through table rows, separating parameter names from descriptions and dropping the header from later chunks' },
        { id: 'c', text: 'The reference page is too long to index' },
        { id: 'd', text: 'Reranking is disabled' },
      ],
      correct: ['b'],
      explanation:
        'Tables are the classic chunking failure: a mid-row cut leaves a description whose nearest visible parameter name is the wrong one. Split on rows or row groups, repeat the header in each chunk, and carry the parameter name into the chunk text.',
    },
    {
      id: 'rs2',
      type: 'single',
      topic: 'Chunking',
      difficulty: 2,
      prompt: 'Why prefix each chunk with its heading path before embedding?',
      options: [
        { id: 'a', text: 'It reduces the token count of the chunk' },
        { id: 'b', text: 'It disambiguates chunks that look alike out of context — two sections both called "Limits" embed almost identically without it' },
        { id: 'c', text: 'It is required by most vector databases' },
        { id: 'd', text: 'It improves the compression ratio of the index' },
      ],
      correct: ['b'],
      explanation:
        'A chunk is retrieved and read alone. The heading path restores the context the document structure provided, and it is one of the cheapest quality improvements available in a RAG pipeline.',
    },
    {
      id: 'rs3',
      type: 'single',
      topic: 'Search',
      difficulty: 2,
      prompt: 'Why does a query for an exact error code like `ECONNRESET` retrieve badly under pure vector search?',
      options: [
        { id: 'a', text: 'Error codes are usually excluded from indexes' },
        { id: 'b', text: 'Rare literal tokens carry little semantic signal, so the nearest neighbours are generic pages about the general topic' },
        { id: 'c', text: 'Vector search cannot handle uppercase text' },
        { id: 'd', text: 'The query is too short to embed' },
      ],
      correct: ['b'],
      explanation:
        'Dense retrieval matches meaning, and a rare identifier has little of it. A lexical index matches the token exactly, which is why hybrid retrieval exists — and why the fix is measured with recall on a tagged set of identifier queries.',
    },
    {
      id: 'rs4',
      type: 'single',
      topic: 'Search',
      difficulty: 3,
      prompt: 'What problem does reciprocal rank fusion solve when combining lexical and vector results?',
      options: [
        { id: 'a', text: 'It removes duplicate documents' },
        { id: 'b', text: 'It combines rankings using positions only, so incomparable score scales never need normalising' },
        { id: 'c', text: 'It guarantees the correct document is ranked first' },
        { id: 'd', text: 'It reduces the number of index lookups' },
      ],
      correct: ['b'],
      explanation:
        'BM25 scores and cosine similarities are not on the same scale and normalising them is fragile. RRF uses rank position, which makes it a strong default that requires no tuning before you have evaluation data.',
    },
    {
      id: 'rs5',
      type: 'scenario',
      topic: 'Reranking',
      difficulty: 3,
      prompt:
        'Raising retrieved chunks from 5 to 25 improves answers slightly; raising to 50 makes them worse and doubles latency. What is the correct architecture?',
      options: [
        { id: 'a', text: 'Return to 5 and accept the recall loss' },
        { id: 'b', text: 'Retrieve broadly (k≈50) and rerank down to a small number (k≈5) before the context window' },
        { id: 'c', text: 'Increase the context window and pass all 50' },
        { id: 'd', text: 'Use a larger embedding model' },
      ],
      correct: ['b'],
      explanation:
        'More chunks raise recall until the extra material is mostly irrelevant, at which point the right passage competes with noise. Two stages keep the recall gain and remove the dilution — and the reranking call is usually cheaper than the 45 chunks of context it replaces.',
    },
    {
      id: 'rs6',
      type: 'boolean',
      topic: 'Reranking',
      difficulty: 2,
      prompt: 'If recall@50 is 0.6, adding a reranker is a reasonable first fix.',
      options: [
        { id: 'true', text: 'True' },
        { id: 'false', text: 'False' },
      ],
      correct: ['false'],
      explanation:
        'A reranker only reorders what it is given. If the right passage is absent from the shortlist 40% of the time, no reordering recovers it — fix retrieval first: chunking, hybrid search, query rewriting, or corpus coverage.',
    },
    {
      id: 'rs7',
      type: 'single',
      topic: 'Grounding',
      difficulty: 2,
      prompt: 'What does requiring the answer to cite chunk ids let you do that a prompt instruction cannot?',
      options: [
        { id: 'a', text: 'Guarantee the answer is correct' },
        { id: 'b', text: 'Assert in code that every cited id was actually supplied, detecting fabricated citations deterministically' },
        { id: 'c', text: 'Reduce token usage' },
        { id: 'd', text: 'Remove the need for reranking' },
      ],
      correct: ['b'],
      explanation:
        'Structured citations turn grounding into an assertion your own code can make. It does not prove the answer is true — a faithful answer from a stale document is still wrong — but it catches an entire class of fabrication for free.',
    },
    {
      id: 'rs8',
      type: 'scenario',
      topic: 'Grounding',
      difficulty: 3,
      prompt:
        'Users report the assistant invents answers about once a day. recall@5 is 0.88 and the citations point at real documents. What do you investigate?',
      options: [
        { id: 'a', text: 'The embedding model' },
        { id: 'b', text: 'What happens on the ~12% of questions with no supporting passage — most likely there is no abstention path, so the model answers from general knowledge and cites the nearest chunk' },
        { id: 'c', text: 'The temperature setting' },
        { id: 'd', text: 'The size of the context window' },
      ],
      correct: ['b'],
      explanation:
        'Recall of 0.88 means roughly one in eight questions has no answer in the window, which matches the reported rate. Add an explicit "not in the provided context" route, verify citations actually support the claim, and add those questions to the evaluation set tagged as unanswerable.',
    },
    {
      id: 'rs9',
      type: 'scenario',
      topic: 'Evaluation',
      difficulty: 3,
      prompt:
        'After re-indexing with a new embedding model, answers get noticeably worse. No prompt changed. What do you measure first, and what is the likely cause?',
      options: [
        { id: 'a', text: 'Answer quality with a judge; the new model is probably weaker' },
        { id: 'b', text: 'recall@k on the labelled set; the likely cause is a mismatch between the model used to index and the one used to embed queries' },
        { id: 'c', text: 'Latency; the new model is probably slower' },
        { id: 'd', text: 'Token usage; the new model probably produces longer chunks' },
      ],
      correct: ['b'],
      explanation:
        'Measuring recall isolates retrieval from generation in one run. Indexing with one model and querying with another — or missing a required query prefix convention — produces a large recall drop with no error anywhere. Pin the embedding model with the index and assert the identifiers match at query time.',
    },
    {
      id: 'rs10',
      type: 'multiple',
      topic: 'Operations',
      difficulty: 2,
      prompt: 'Which are real risks in a corpus that is indexed once and then left alone? Select all that apply.',
      options: [
        { id: 'a', text: 'Documents deleted at source remain retrievable and are cited confidently' },
        { id: 'b', text: 'Permission changes are not reflected, so access becomes stale' },
        { id: 'c', text: 'The embedding vectors gradually lose precision on disk' },
        { id: 'd', text: 'Coverage decays as the organisation moves on, and users quietly stop asking' },
      ],
      correct: ['a', 'b', 'd'],
      explanation:
        'Deletion, permission drift and coverage decay are the three operational failures that make a launched RAG system decline without any error appearing. Vectors do not degrade in storage — that is not a real mechanism.',
    },
  ],
}

export const agentSystems = {
  slug: 'agent-systems',
  title: 'Agent Systems — Mock Exam',
  summary:
    'The agent loop and its bounds, tool design, memory, multi-agent trade-offs, tracing, and moving a workflow between orchestration platforms.',
  level: 'Advanced',
  minutes: 25,
  passing: 70,
  technologies: ['agent-loops', 'tool-use', 'orchestration', 'context-engineering'],
  topics: ['Agent loop', 'Tool design', 'Memory', 'Topologies', 'Observability', 'Portability'],
  rules: [
    'Ten questions, twenty-five minutes.',
    'Several are scenario-based and deliberately longer.',
    'Move freely between questions; flag anything you want to revisit.',
    'Grading happens on the server at submission.',
  ],
  topicLinks: {
    'Agent loop': { label: 'The loop, and its bounds', href: '/learn/agent-systems-professional/agent-loop' },
    'Tool design': { label: 'Designing tools an agent can use', href: '/learn/agent-systems-professional/tool-design' },
    Memory: { label: 'Memory and state', href: '/learn/agent-systems-professional/agent-memory' },
    Topologies: { label: 'Multi-agent topologies', href: '/learn/agent-systems-professional/multi-agent' },
    Observability: { label: 'Tracing and debugging agents', href: '/learn/agent-systems-professional/agent-observability' },
    Portability: { label: 'Portability and migration', href: '/learn/agent-systems-professional/agent-portability' },
  },
  questions: [
    {
      id: 'as1',
      type: 'multiple',
      topic: 'Agent loop',
      difficulty: 2,
      prompt: 'Which bounds should an agent loop enforce? Select all that apply.',
      options: [
        { id: 'a', text: 'Maximum steps' },
        { id: 'b', text: 'A token budget for the whole task' },
        { id: 'c', text: 'A wall-clock deadline' },
        { id: 'd', text: 'An allowlist for irreversible side effects' },
      ],
      correct: ['a', 'b', 'c', 'd'],
      explanation:
        'All four, and each should return partial work with a reason rather than raising. An agent that loses ten minutes of progress at step seven because it hit a limit is worse than one that reports what it achieved and why it stopped.',
    },
    {
      id: 'as2',
      type: 'scenario',
      topic: 'Agent loop',
      difficulty: 3,
      prompt:
        'An agent completes 70% of tasks and hits its 8-step limit on the rest. Raising the limit to 20 lifts completion to 74% and triples cost. What does that tell you?',
      options: [
        { id: 'a', text: 'The limit was too low and should be raised further' },
        { id: 'b', text: 'The extra steps are mostly unproductive — the agent is looping rather than progressing, usually because a tool returns too little or two tool descriptions overlap' },
        { id: 'c', text: 'The model is not capable enough for the task' },
        { id: 'd', text: 'The token budget is the real constraint' },
      ],
      correct: ['b'],
      explanation:
        'Four points for three times the cost means the additional steps are not doing work. Read traces of the failures and look for the same tool called repeatedly with near-identical arguments — that is a tool design problem, not a budget problem.',
    },
    {
      id: 'as3',
      type: 'scenario',
      topic: 'Tool design',
      difficulty: 3,
      prompt:
        'Traces show an agent calling `search_orders` and then `get_order` on every result one at a time, exhausting its step budget. What is the fix?',
      options: [
        { id: 'a', text: 'Raise the step limit' },
        { id: 'b', text: 'Return the fields needed for the next decision directly from search, and say so in the description; optionally let `get_order` accept a list of ids' },
        { id: 'c', text: 'Remove `get_order` so the agent cannot call it' },
        { id: 'd', text: 'Instruct the agent not to call tools more than three times' },
      ],
      correct: ['b'],
      explanation:
        'The search result is too thin, so the agent must fan out to see anything useful. Returning status, date and total from search collapses N steps into one. Tool granularity — roughly "one thing a person would ask for" — is the underlying principle.',
    },
    {
      id: 'as4',
      type: 'single',
      topic: 'Tool design',
      difficulty: 2,
      prompt: 'What should a tool return when the caller lacks permission for the requested record?',
      options: [
        { id: 'a', text: 'A detailed error naming the owning customer, so the agent can explain the situation' },
        { id: 'b', text: 'A generic `not_permitted` result, with the detail logged server-side' },
        { id: 'c', text: 'An exception, ending the run' },
        { id: 'd', text: 'An empty result indistinguishable from "not found"' },
      ],
      correct: ['b'],
      explanation:
        'Detail in a permission error can be repeated to the user by the model, which leaks exactly what the check was protecting. Return a generic refusal as data so the loop can recover, and log the specifics where only operators see them.',
    },
    {
      id: 'as5',
      type: 'scenario',
      topic: 'Memory',
      difficulty: 3,
      prompt:
        'An assistant honours a stated customer preference for a week, then starts ignoring it. Nothing in the code changed. What is the mechanism?',
      options: [
        { id: 'a', text: 'The model was updated by the provider' },
        { id: 'b', text: 'The preference lived in conversation history, which has since been summarised or truncated past it' },
        { id: 'c', text: 'The context window shrank' },
        { id: 'd', text: 'The preference was cached and the cache expired' },
      ],
      correct: ['b'],
      explanation:
        'The summariser had no reason to treat that sentence as important, so it disappeared without a trace. Promote stated preferences and corrections to a durable fact store at the moment they are expressed, and include those facts in every task\'s framing.',
    },
    {
      id: 'as6',
      type: 'single',
      topic: 'Memory',
      difficulty: 2,
      prompt: 'Why checkpoint run state after every step of a long agent task?',
      options: [
        { id: 'a', text: 'To reduce token usage on the next call' },
        { id: 'b', text: 'So a crash or deploy resumes at the failed step rather than repeating side effects from the beginning' },
        { id: 'c', text: 'Because the API requires it for multi-turn conversations' },
        { id: 'd', text: 'To allow the model to read its own history' },
      ],
      correct: ['b'],
      explanation:
        'Restarting a five-step task from step one wastes tokens and can repeat writes. Persist the message list and step count after each step, key the run with an idempotency key, and make writing tools safe to call twice.',
    },
    {
      id: 'as7',
      type: 'multiple',
      topic: 'Topologies',
      difficulty: 3,
      prompt: 'Which are sound reasons to split one agent into several? Select all that apply.',
      options: [
        { id: 'a', text: 'The work is genuinely parallel, such as reviewing ten documents independently' },
        { id: 'b', text: 'Read and write capabilities need different permissions and blast radius' },
        { id: 'c', text: 'It mirrors how a human team is organised' },
        { id: 'd', text: 'A cheap model can route to an expensive specialist' },
      ],
      correct: ['a', 'b', 'd'],
      explanation:
        'Parallelism, permission separation and model differentiation all pay for the coordination cost. Role-play does not — mirroring an org chart adds handoffs, context loss and cost without changing what the system can do.',
    },
    {
      id: 'as8',
      type: 'scenario',
      topic: 'Topologies',
      difficulty: 3,
      prompt:
        'A single agent is replaced with a supervisor and four specialists. Quality is unchanged, cost is 4× and latency 3×. What is the most likely explanation in the traces?',
      options: [
        { id: 'a', text: 'The specialists use a more expensive model' },
        { id: 'b', text: 'The supervisor re-sends most of the conversation to each specialist, and the four run in sequence rather than in parallel' },
        { id: 'c', text: 'The framework adds per-agent overhead' },
        { id: 'd', text: 'The specialists are retrying failed calls' },
      ],
      correct: ['b'],
      explanation:
        'Duplicated context explains the cost multiple and sequential execution explains the latency multiple. If none of the four are genuinely parallel and none need different permissions or models, the split was not motivated and the single agent should return.',
    },
    {
      id: 'as9',
      type: 'single',
      topic: 'Observability',
      difficulty: 2,
      prompt: 'An agent issued a refund against the wrong order. What is the first step of the investigation?',
      options: [
        { id: 'a', text: 'Re-run the task and see whether it reproduces' },
        { id: 'b', text: 'Walk the trace backwards from the refund call to find where the wrong id first appeared' },
        { id: 'c', text: 'Lower the temperature and redeploy' },
        { id: 'd', text: 'Disable the refund tool' },
      ],
      correct: ['b'],
      explanation:
        'The origin of the bad value determines the fix: the user\'s message, a search result, a retrieved document, or a model turn each imply something different. The deciding step is usually two or three before the visible failure, which is why you walk backwards.',
    },
    {
      id: 'as10',
      type: 'scenario',
      topic: 'Portability',
      difficulty: 3,
      prompt:
        'Eleven agent workflows must move off a vendor runtime this quarter. What is the first piece of work?',
      options: [
        { id: 'a', text: 'Rewrite the two business-critical workflows first, while attention is high' },
        { id: 'b', text: 'Recover evaluation sets for all eleven from production traces, so equivalence is decidable' },
        { id: 'c', text: 'Choose the target platform and port the largest workflow' },
        { id: 'd', text: 'Export the workflow definitions and translate them by hand' },
      ],
      correct: ['b'],
      explanation:
        'Without cases and expected outcomes, "it works the same" is an opinion. Evaluation sets parallelise well, are needed regardless of target, and make a staged switch decidable. Then prove the parse-and-generate path on low-risk workflows before touching the critical pair.',
    },
  ],
}
