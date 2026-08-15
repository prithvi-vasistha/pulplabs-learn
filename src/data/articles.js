/**
 * Articles.
 *
 * Writing about the stack: what to learn, in what order, and which received
 * ideas do not survive contact with a production system. Deliberately not
 * courses — an article makes one argument and ends, where a course is a
 * sequence with an exam behind it.
 *
 * Two rules, same as everywhere else in this repo:
 *
 *   1. No claim we cannot stand behind. Where a number appears it is either
 *      arithmetic the reader can redo, or it is attributed.
 *   2. Nothing is written to fill a slot. If there is nothing to say about a
 *      subject this week, there is no article about it this week.
 *
 * Bodies use the same block model as lessons and documentation, so they render
 * through the same Prose component and read identically.
 */

export const ARTICLE_TOPICS = ['Learning', 'Architecture', 'Retrieval', 'Evaluation', 'Practice']

export const articles = [
  {
    slug: 'what-to-learn-first',
    title: 'What to learn first in the AI stack, and what to skip',
    topic: 'Learning',
    summary:
      'Most reading lists are ordered by what is interesting rather than by what unblocks you. Here is the order that actually removes obstacles, and the three subjects that can wait longer than people think.',
    author: 'PulpLabs engineering',
    published: '2026-05-12',
    minutes: 9,
    technologies: ['claude', 'prompt-engineering', 'retrieval', 'evaluation'],
    body: [
      {
        type: 'p',
        text: 'The usual advice is to start with prompting, move to retrieval, then agents, then evaluation. That order is wrong in one specific way: it puts the thing that tells you whether any of it worked at the very end, so every earlier decision is made blind.',
      },
      { type: 'h2', text: 'Start with what a model actually is' },
      {
        type: 'p',
        text: 'Before anything else, understand that a call is stateless, that the context window is shared between what you send and what comes back, and that temperature zero does not guarantee identical output. These three facts explain most surprising behaviour in production systems, and none of them take an afternoon to learn.',
      },
      {
        type: 'callout',
        kind: 'note',
        title: 'The test for whether you have it',
        text: 'You can explain, without hedging, why a summariser that works on short articles silently truncates on long ones — and why raising the context limit buys time rather than fixing it.',
      },
      { type: 'h2', text: 'Then learn to measure' },
      {
        type: 'p',
        text: 'Evaluation belongs second, not last. Fifty real inputs with known-good outputs will tell you more than another week of prompt iteration, and they turn every later decision into a comparison rather than an argument. The cost is an afternoon of collecting inputs; the return is that every change after that point is measurable.',
      },
      {
        type: 'list',
        items: [
          'Collect inputs from real usage, not from imagination — invented cases cluster around behaviour you already handle.',
          'Write down what a good answer looks like before you look at what the model produced.',
          'Keep the set small enough to run in under a minute, or it will not get run.',
        ],
      },
      { type: 'h2', text: 'What can wait' },
      {
        type: 'p',
        text: 'Fine-tuning can wait, in almost every case, until you have exhausted retrieval and prompting and can articulate exactly which behaviour is missing. Agent frameworks can wait until you have a workflow that genuinely branches. And vector database selection can wait until retrieval quality is your bottleneck — which is rarely as early as it feels.',
      },
      {
        type: 'quote',
        text: 'The quality ceiling of a retrieval system is set by retrieval, not by the model. Most teams tune the wrong half first.',
      },
    ],
    related: [
      { type: 'tech', ref: 'evaluation' },
      { type: 'exam', ref: 'ai-foundations' },
    ],
  },

  {
    slug: 'context-window-budget',
    title: 'Treat the context window as a budget, not a container',
    topic: 'Architecture',
    summary:
      'A window is not storage you fill until it is full. It is a per-request budget shared between instructions, retrieved material and the answer — and the failure mode when you overspend is silence, not an error.',
    author: 'PulpLabs engineering',
    published: '2026-06-03',
    minutes: 8,
    technologies: ['claude', 'context-engineering', 'retrieval'],
    body: [
      {
        type: 'p',
        text: 'The most common architectural mistake we see is treating the context window as a container to be filled. Fill it and the system does not fail loudly; it quietly loses the end of something, and the output looks plausible enough that nobody checks.',
      },
      { type: 'h2', text: 'What is actually competing' },
      {
        type: 'p',
        text: 'Four things share the same budget: the system prompt, conversation history, retrieved material, and the space reserved for the answer. Only the last one is easy to forget, and it is the one whose absence truncates output.',
      },
      {
        type: 'code',
        lang: 'text',
        code: `budget = window
      − system prompt
      − history you chose to keep
      − retrieved chunks
      − reserved output

if budget < 0:  something gets cut, silently`,
      },
      { type: 'h2', text: 'Spend it deliberately' },
      {
        type: 'steps',
        items: [
          '**Reserve output first.** Decide the maximum answer length before anything else and subtract it. The answer is the product; everything else is overhead.',
          '**Cap retrieval by tokens, not by k.** Ten chunks of wildly different sizes is not a budget. Retrieve by relevance, then truncate by token count.',
          '**Compress history rather than dropping it.** Store every message verbatim in ordinary storage and summarise hierarchically for recall — history stays complete while the window stays bounded.',
        ],
      },
      {
        type: 'callout',
        kind: 'warning',
        title: 'A bigger window is not a fix',
        text: 'It moves the failure further away without removing it, and it makes the failure more expensive when it arrives. Systems that budget deliberately at 8k work at 200k; systems that do not, do not.',
      },
    ],
    related: [
      { type: 'tech', ref: 'context-engineering' },
      { type: 'lesson', path: 'claude-certified-architect', lesson: 'context-strategy' },
    ],
  },

  {
    slug: 'retrieval-failures',
    title: 'Reading a retrieval system’s failure modes',
    topic: 'Retrieval',
    summary:
      'When a RAG system gives a bad answer there are four places the fault can be, and they need different fixes. Telling them apart takes about ten minutes and saves about a week.',
    author: 'PulpLabs engineering',
    published: '2026-06-24',
    minutes: 11,
    technologies: ['retrieval', 'embeddings', 'evaluation'],
    body: [
      {
        type: 'p',
        text: 'A wrong answer from a retrieval system is not one bug. It is one of four, and the instinct to reach for the prompt fixes only one of them.',
      },
      { type: 'h2', text: 'The four places' },
      {
        type: 'table',
        head: ['Symptom', 'Where the fault is', 'What fixes it'],
        rows: [
          ['The right passage was never retrieved', 'Indexing or chunking', 'Chunk boundaries, hybrid search, better queries'],
          ['It was retrieved but ranked low', 'Ranking', 'Reranking, or a different similarity metric'],
          ['It was in context and ignored', 'Prompting or ordering', 'Position, instruction, or fewer competing chunks'],
          ['It was used but stated wrongly', 'Generation', 'Grounding constraints, verbatim citation, verification'],
        ],
      },
      { type: 'h2', text: 'How to tell them apart' },
      {
        type: 'p',
        text: 'Take the failing question and ask, in order: was the passage in the index at all? Did the retriever return it in the top fifty? In the top five? Was it in the final context? Each “no” localises the fault to exactly one of the rows above, and you stop guessing.',
      },
      {
        type: 'callout',
        kind: 'note',
        title: 'Recall before precision',
        text: 'Measure recall@50 before you touch anything else. If the passage is not in the top fifty, no amount of reranking or prompting will save the answer — you have an indexing problem wearing a generation problem’s clothes.',
      },
      {
        type: 'p',
        text: 'The reason this matters commercially is that the four fixes cost wildly different amounts. Re-chunking a corpus is a day. Adding a reranker is an afternoon. Rewriting the prompt is an hour. Choosing the wrong one costs the difference plus the week you spent finding out.',
      },
    ],
    related: [
      { type: 'lesson', path: 'rag-systems-specialist', lesson: 'chunking-strategy' },
      { type: 'exam', ref: 'rag-systems' },
    ],
  },

  {
    slug: 'evals-from-production',
    title: 'Your evaluation set should come from production, not imagination',
    topic: 'Evaluation',
    summary:
      'Fifty real inputs beat five hundred invented ones, and the reason is not sample size. Invented cases cluster around behaviour you already handle.',
    author: 'PulpLabs engineering',
    published: '2026-07-15',
    minutes: 7,
    technologies: ['evaluation', 'guardrails'],
    body: [
      {
        type: 'p',
        text: 'Everyone agrees evaluation matters. Fewer people notice that where the cases come from matters more than how many there are.',
      },
      { type: 'h2', text: 'Why invented cases miss' },
      {
        type: 'p',
        text: 'When you sit down to write test inputs, you write inputs you can imagine. What you can imagine is shaped by the system you already built, so your cases cluster around behaviour that already works. Real inputs carry the typos, the half-sentences, the questions that assume context the system does not have — which is exactly the distribution that fails.',
      },
      {
        type: 'list',
        items: [
          'Take inputs from logs, redacted if they need to be.',
          'Include the ones that produced complaints, not just the ones that produced errors.',
          'Keep the boring ones too — a regression on the easy path is still a regression.',
        ],
      },
      { type: 'h2', text: 'On using a model as judge' },
      {
        type: 'p',
        text: 'It works, with known weaknesses: it prefers longer answers, it is sensitive to the order candidates are presented in, and its verdicts drift when the judge model is updated. All three are manageable — give it a rubric, randomise ordering in pairwise comparisons, pin and record the judge version, and calibrate against human review on a sample.',
      },
      {
        type: 'quote',
        text: 'A judge you have not calibrated is a number you have not earned.',
      },
    ],
    related: [
      { type: 'lesson', path: 'claude-certified-architect', lesson: 'evaluation-and-rollout' },
      { type: 'tech', ref: 'evaluation' },
    ],
  },

  {
    slug: 'preparing-for-ai-certifications',
    title: 'What AI certifications actually test',
    topic: 'Practice',
    summary:
      'Across the current crop of AI certifications, three things come up in almost every paper — and none of them is the API surface people spend their preparation time on.',
    author: 'PulpLabs engineering',
    published: '2026-08-04',
    minutes: 8,
    technologies: ['claude', 'retrieval', 'guardrails', 'evaluation'],
    body: [
      {
        type: 'p',
        text: 'Preparation time tends to go into memorising parameters. The papers tend to ask about judgement. The gap between those two is where most of the failed attempts live.',
      },
      { type: 'h2', text: 'One: where a control belongs' },
      {
        type: 'p',
        text: 'Given a symptom, is the fix in the prompt, the tool implementation, the index, or the schema? Questions of this shape appear constantly, and the answer is almost never “the prompt” — because a prompt is guidance and a control has to be enforcement the model cannot reach.',
      },
      { type: 'h2', text: 'Two: what a guarantee actually guarantees' },
      {
        type: 'p',
        text: 'A schema validating tells you the shape is right and nothing about whether the values appear in the source. A retrieved citation tells you a passage exists and nothing about whether it says what the answer claims. Papers test whether you can hold that distinction under pressure.',
      },
      { type: 'h2', text: 'Three: which failure is silent' },
      {
        type: 'p',
        text: 'Truncation, permission leakage through a paraphrase, a swallowed validation error replaced by a default — the recurring theme is failures that produce plausible output. If you can name what breaks quietly in a design, you can usually answer the question.',
      },
      {
        type: 'callout',
        kind: 'note',
        title: 'How to use this',
        text: 'Sit a paper cold before you study. The per-topic breakdown tells you which of the three you are weakest on, which is a better use of the first hour than reading anything.',
      },
    ],
    related: [
      { type: 'exam', ref: 'ai-foundations' },
      { type: 'exam', ref: 'claude-architect' },
    ],
  },
]

export const articleBySlug = Object.fromEntries(articles.map((a) => [a.slug, a]))
