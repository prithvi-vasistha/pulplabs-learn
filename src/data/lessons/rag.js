/** Lessons for the RAG Systems Specialist preparation track. */

export const ragLessons = [
  {
    slug: 'chunking',
    title: 'Chunking that survives retrieval',
    summary: 'Splitting on structure, carrying context into the fragment, and keeping the metadata that decides everything later.',
    minutes: 12,
    topics: ['Chunking'],
    objectives: [
      'Split on meaningful boundaries rather than a character count',
      'Keep a chunk interpretable when it is retrieved alone',
      'Attach the metadata that filtering and freshness later depend on',
    ],
    body: [
      {
        type: 'p',
        text: 'A chunk is retrieved on its own and read on its own. Every decision about how you cut a document is a decision about whether the fragment still makes sense when it arrives with no neighbours.',
      },
      {
        type: 'h2',
        text: 'Split on structure',
      },
      {
        type: 'p',
        text: 'Fixed-size splitting cuts through the middle of the sentence that mattered. Split on the document\'s own boundaries — headings, sections, list items, function definitions — and fall back to size only inside a section that is genuinely too long.',
      },
      {
        type: 'code',
        lang: 'python',
        file: 'index/chunking.py',
        code: `@dataclass
class Chunk:
    text: str
    doc_id: str
    heading_path: list[str]    # ["Configuration", "Retries", "Backoff"]
    source_url: str
    updated_at: date
    acl: list[str]             # who may see this, carried from the source

    def for_embedding(self) -> str:
        # The heading path disambiguates chunks that look alike out of context.
        return " > ".join(self.heading_path) + "\\n\\n" + self.text`,
      },
      {
        type: 'p',
        text: 'Prefixing the heading path is the cheapest quality win available. Two sections called "Limits" in different documents embed almost identically; "Rate limits > Limits" and "Storage > Limits" do not.',
      },
      {
        type: 'h2',
        text: 'Overlap, and what it is for',
      },
      {
        type: 'p',
        text: 'An overlap of roughly 10–20% between adjacent chunks costs little storage and stops an answer that straddles a boundary from being lost entirely. It is not a substitute for structural splitting — it is insurance against the cut landing badly.',
      },
      {
        type: 'table',
        head: ['Content', 'Split on', 'Typical size'],
        rows: [
          ['Documentation', 'Headings, then paragraphs', 'One section, up to ~1,000 tokens'],
          ['Support transcripts', 'Turn boundaries, grouped by topic', 'A few exchanges'],
          ['Code', 'Function or class', 'The whole unit, plus its imports'],
          ['Tables', 'Never mid-row; repeat the header', 'Row groups'],
          ['Policies and contracts', 'Clause', 'The clause, with its parent heading'],
        ],
      },
      {
        type: 'callout',
        kind: 'warning',
        title: 'Metadata decided at index time cannot be added later',
        text: 'Permissions, freshness and source attribution have to travel with the chunk from the moment it is created. Retro-fitting an ACL onto an index that never stored one means a full re-index.',
      },
      {
        type: 'h2',
        text: 'What to exclude',
      },
      {
        type: 'p',
        text: 'Navigation, cookie banners, changelog boilerplate and repeated footers embed as noise and dilute the corpus. They also retrieve well for generic queries, which is worse than useless. Strip them at ingestion; a corpus is a curated artefact, not a crawl.',
      },
    ],
    exercise: {
      prompt:
        'A documentation assistant answers well on prose pages and badly on the API reference, where answers routinely cite the wrong parameter. The reference is one long page of tables. What is happening?',
      approach:
        'Fixed-size chunking has cut the tables mid-row, so parameter names and their descriptions have landed in different chunks, and the header row is missing from every chunk after the first. Retrieval then returns a fragment where the nearest visible parameter name is the wrong one. Split on rows or row groups, repeat the table header in each chunk, and carry the parameter name into the chunk text rather than relying on column position.',
    },
    related: [{ type: 'tech', ref: 'retrieval' }],
  },

  {
    slug: 'hybrid-search',
    title: 'Vector, lexical, hybrid',
    summary: 'Why dense retrieval misses exact tokens, and how to fuse two rankings without tuning score scales.',
    minutes: 12,
    topics: ['Search'],
    objectives: [
      'Predict which queries dense retrieval will handle badly',
      'Combine lexical and semantic rankings with reciprocal rank fusion',
      'Choose an index that matches the corpus and the query mix',
    ],
    body: [
      {
        type: 'p',
        text: 'Dense retrieval matches meaning; lexical retrieval matches tokens. Real query logs contain both kinds, which is why production systems almost always end up running both.',
      },
      {
        type: 'table',
        head: ['Method', 'Strong at', 'Weak at'],
        rows: [
          ['Lexical (BM25)', 'Exact terms, identifiers, error codes, version numbers', 'Paraphrase, synonyms, questions'],
          ['Dense vectors', 'Meaning, paraphrase, fuzzy questions', 'Rare literals, negation, precise identifiers'],
          ['Hybrid', 'Both, at the cost of a fusion step', 'Needs a fusion rule and more infrastructure'],
        ],
      },
      {
        type: 'p',
        text: 'A user searching for `ECONNRESET` or `v2.14.1` is served badly by embeddings alone: those tokens carry almost no semantic signal, so the nearest neighbours are generic pages about connections or releases.',
      },
      {
        type: 'h2',
        text: 'Fusing without tuning',
      },
      {
        type: 'p',
        text: 'Score scales from two engines are not comparable, and normalising them is fragile. Reciprocal rank fusion sidesteps the problem by using only positions, which makes it a strong default before any tuning.',
      },
      {
        type: 'code',
        lang: 'python',
        code: `def rrf(rankings: list[list[str]], k: int = 60) -> list[str]:
    """Fuse ranked id lists by position. No score normalisation required."""
    scores: dict[str, float] = {}
    for ranking in rankings:
        for rank, doc_id in enumerate(ranking, start=1):
            scores[doc_id] = scores.get(doc_id, 0) + 1 / (k + rank)
    return sorted(scores, key=scores.get, reverse=True)

shortlist = rrf([bm25.search(q, k=50), vectors.search(embed(q), k=50)])`,
      },
      {
        type: 'h2',
        text: 'Index choices',
      },
      {
        type: 'list',
        items: [
          '**Exact search** is correct and linear. Below roughly a hundred thousand vectors it is often fast enough, and it removes a tuning parameter.',
          '**Approximate indexes** trade recall for speed. The recall you lose is real — measure it rather than assuming the default is fine.',
          '**A vector column in the database you already run** avoids a second system to operate, back up and keep consistent. Reach for a dedicated vector database when scale or feature needs actually demand it.',
          '**Filtering matters as much as ranking.** An index that cannot filter by permission or date pushes both problems into your application, badly.',
        ],
      },
      {
        type: 'callout',
        kind: 'note',
        title: 'Embed the query the same way you embedded the corpus',
        text: 'Different model, different version, or a different prefix convention between indexing and querying produces silently poor results with no error anywhere. Pin the embedding model and record it with the index.',
      },
      {
        type: 'h2',
        text: 'Query rewriting',
      },
      {
        type: 'p',
        text: 'In a conversation, "does it support that too?" is unretrievable on its own. Rewriting the query against recent turns before searching is usually a larger win than any ranking change — and it is easy to evaluate, because you can inspect the rewritten query directly.',
      },
    ],
    exercise: {
      prompt:
        'Recall@10 is 0.92 on your evaluation set but users complain constantly. Sampling real queries shows many are two or three words, often product names. Explain the gap.',
      approach:
        'The evaluation set is not representative — it was probably written as well-formed questions while real traffic is short keyword queries dominated by rare literals, which is exactly where dense retrieval is weakest. Rebuild the set from sampled production queries, split by tag (keyword, question, identifier), and measure per tag. The likely fix is adding a lexical index and fusing, plus query rewriting for the conversational cases; the actual point is that the metric was measuring the wrong distribution.',
    },
    related: [
      { type: 'tech', ref: 'embeddings' },
      { type: 'lesson', path: 'rag-systems-specialist', lesson: 'reranking' },
    ],
  },

  {
    slug: 'reranking',
    title: 'Reranking the shortlist',
    summary: 'Cheap recall first, expensive precision second — and how many chunks actually belong in the window.',
    minutes: 10,
    topics: ['Reranking'],
    objectives: [
      'Separate the recall stage from the precision stage',
      'Choose k for retrieval and k for the context window independently',
      'Judge whether a reranker is worth its latency',
    ],
    body: [
      {
        type: 'p',
        text: 'Retrieval and ranking are different jobs. The first stage should be cheap and generous — get the right chunk into a shortlist of fifty. The second stage is expensive and selective — decide which five of those fifty actually go into the window.',
      },
      {
        type: 'figure',
        caption: 'Two stages, two budgets',
        art: `query
  ├── lexical  top 50 ┐
  │                   ├── fuse → 50 candidates
  └── vector   top 50 ┘
                          ↓
                     rerank (cross-encoder, reads query + passage together)
                          ↓
                     top 5 → context window`,
      },
      {
        type: 'p',
        text: 'A bi-encoder embeds query and passage separately, which is what makes the index possible. A cross-encoder reads them together and scores the pair, which is far more accurate and far too slow to run over a whole corpus. The two-stage shape exists precisely to use each where it is affordable.',
      },
      {
        type: 'h2',
        text: 'How many chunks belong in the window',
      },
      {
        type: 'p',
        text: 'More context is not better. Every additional chunk costs tokens, adds latency, and dilutes attention across material that may be irrelevant. Sweep k against answer quality on your evaluation set — the curve usually flattens between three and eight, and often declines after.',
      },
      {
        type: 'table',
        head: ['Symptom', 'Likely cause'],
        rows: [
          ['Right chunk retrieved, wrong answer', 'Too many chunks — the relevant one is buried'],
          ['Answer cites an unrelated document', 'Reranker missing, or shortlist too small'],
          ['Correct answers, high latency', 'Reranking more candidates than the shortlist needs'],
          ['Recall@50 high, recall@5 low', 'Exactly the case reranking exists for'],
        ],
      },
      {
        type: 'callout',
        kind: 'note',
        title: 'Measure recall@k before adding a reranker',
        text: 'If recall@50 is 0.6, reranking cannot help — the right passage is not in the shortlist. Fix retrieval first; reranking only reorders what it is given.',
      },
      {
        type: 'h2',
        text: 'Is it worth the latency?',
      },
      {
        type: 'p',
        text: 'A reranker adds a round trip in the request path. Justify it with the same evidence as anything else: answer quality with and without, at your p95 latency. Where the budget is tight, reranking a shorter shortlist, or only when the fused scores are close, recovers most of the benefit for a fraction of the cost.',
      },
    ],
    exercise: {
      prompt:
        'A team fixes poor answers by raising the number of retrieved chunks from 5 to 25. Quality improves slightly, then gets worse as they push to 50, and latency doubles. Explain and propose.',
      approach:
        'Raising k improves recall, which helps until the additional chunks are mostly irrelevant — then the relevant passage competes with noise for attention and quality falls, while tokens and latency rise linearly. The correct shape is to retrieve broadly (k=50) but rerank down to a small number (k=5) before the window. That keeps the recall gain and removes the dilution, and the reranking call is usually cheaper than the extra 45 chunks of context it replaces.',
    },
    related: [{ type: 'lesson', path: 'rag-systems-specialist', lesson: 'rag-evaluation' }],
  },

  {
    slug: 'grounding',
    title: 'Grounding and citations',
    summary: 'Forcing the answer to point at its sources, then checking mechanically that it did.',
    minutes: 11,
    topics: ['Grounding'],
    objectives: [
      'Design a citation contract that can be verified in code',
      'Detect an answer that cites something it was never shown',
      'Decide what the system does when the corpus has no answer',
    ],
    body: [
      {
        type: 'p',
        text: 'Retrieval puts the right material in front of the model. Grounding is the separate problem of making sure the answer actually came from it — and proving that to yourself without a human reading every response.',
      },
      {
        type: 'h2',
        text: 'Citations as structured fields',
      },
      {
        type: 'code',
        lang: 'python',
        code: `class Answer(BaseModel):
    text: str
    citations: list[str]        # chunk ids, not prose like "[1]"
    answered: bool              # False when the context did not contain it

# After generation, this is ordinary code — no judgement involved.
supplied = {c.id for c in chunks}
unknown = set(answer.citations) - supplied
if unknown:
    raise Ungrounded(f"cited chunks that were never provided: {unknown}")`,
      },
      {
        type: 'p',
        text: 'An answer citing an id you never sent is a fabrication your own code can detect deterministically. That single assertion catches a whole class of failure that no amount of prompt wording prevents.',
      },
      {
        type: 'h2',
        text: 'Give it a way to say no',
      },
      {
        type: 'p',
        text: 'Without an explicit "not in the provided context" path, a model must produce something, and it will — assembled from general knowledge that looks exactly like the rest of the answer. An `answered: false` field, and a prompt that describes when to use it, is what makes abstention available.',
      },
      {
        type: 'callout',
        kind: 'warning',
        title: 'Abstention has to be designed, and measured',
        text: 'Include unanswerable questions in the evaluation set. A system that never abstains is not confident — it is unable to.',
      },
      {
        type: 'h2',
        text: 'Showing sources to the reader',
      },
      {
        type: 'list',
        items: [
          '**Link to the source, not just its title.** A citation the reader cannot open is decoration.',
          '**Show the date.** The most common complaint about an internal assistant is a confidently stale answer.',
          '**Quote the supporting span** where the claim is consequential — it lets the reader verify in one glance.',
          '**Say when the corpus was last indexed.** "Not in the documentation" and "not in the index yet" are different answers.',
        ],
      },
      {
        type: 'h2',
        text: 'Faithfulness versus correctness',
      },
      {
        type: 'p',
        text: 'These come apart, and exams test the distinction. A faithful answer accurately reflects the retrieved passage. A correct answer is true. If the corpus contains an out-of-date policy, a perfectly faithful answer is wrong — which is a content problem, not a model problem, and no amount of grounding work fixes it.',
      },
    ],
    exercise: {
      prompt:
        'Users report the assistant "makes things up" roughly once a day. Retrieval recall@5 measures 0.88 and the answers cite real documents. What do you investigate?',
      approach:
        'Recall of 0.88 means around one in eight questions has no supporting passage in the window, which lines up with the report. Check what the system does on those: if there is no abstention path, the model answers from general knowledge and cites the nearest retrieved document, which is why the citations look real. Add an explicit `answered: false` route, verify citations actually support the claim rather than merely existing, and add the failing questions to the evaluation set tagged as unanswerable.',
    },
    related: [
      { type: 'tech', ref: 'guardrails' },
      { type: 'lesson', path: 'rag-systems-specialist', lesson: 'rag-evaluation' },
    ],
  },

  {
    slug: 'rag-evaluation',
    title: 'Measuring retrieval separately',
    summary: 'Component metrics that tell you which half is broken, and a labelled set that makes them repeatable.',
    minutes: 12,
    topics: ['Evaluation'],
    objectives: [
      'Build a labelled question set with known relevant passages',
      'Interpret recall@k, MRR and nDCG',
      'Attribute an end-to-end failure to retrieval or to generation',
    ],
    body: [
      {
        type: 'p',
        text: 'End-to-end quality is the number that matters and the number that explains nothing. A RAG system has two halves, and only component metrics tell you which one moved.',
      },
      {
        type: 'h2',
        text: 'The labelled set is the asset',
      },
      {
        type: 'p',
        text: 'Take real questions and mark, for each, which passages genuinely answer them. Fifty to two hundred labelled questions is enough to be useful and small enough to maintain. Version it with the corpus fingerprint — a label is only meaningful against the corpus it was made from.',
      },
      {
        type: 'code',
        lang: 'python',
        file: 'evals/retrieval.py',
        code: `def recall_at_k(cases: list[Case], retrieve, k: int) -> float:
    """Share of questions where at least one relevant passage is in the top k."""
    hits = 0
    for case in cases:
        got = {c.id for c in retrieve(case.question, k=k)}
        hits += bool(got & set(case.relevant_ids))
    return hits / len(cases)

def mrr(cases: list[Case], retrieve, k: int = 10) -> float:
    """Mean reciprocal rank — rewards putting the answer first, not just present."""
    total = 0.0
    for case in cases:
        ids = [c.id for c in retrieve(case.question, k=k)]
        rank = next((i for i, cid in enumerate(ids, 1) if cid in case.relevant_ids), None)
        total += 1 / rank if rank else 0.0
    return total / len(cases)`,
      },
      {
        type: 'table',
        head: ['Metric', 'Answers', 'Use when'],
        rows: [
          ['recall@k', 'Is the answer in the shortlist at all?', 'Tuning the first stage'],
          ['MRR', 'How near the top is it?', 'Tuning reranking'],
          ['nDCG', 'Is the whole ordering sensible?', 'Several passages are partly relevant'],
          ['Answer faithfulness', 'Did the answer use what it was given?', 'After retrieval is healthy'],
        ],
      },
      {
        type: 'h2',
        text: 'Attributing a failure',
      },
      {
        type: 'steps',
        items: [
          'Take the failing question and run retrieval alone.',
          'Was a relevant passage returned? If not, it is a retrieval problem — chunking, search, or the corpus.',
          'If it was returned but ranked low, it is a ranking problem — reranking or fusion.',
          'If it was in the window and the answer still missed it, it is a generation problem — too much context, weak instruction, or a missing abstention path.',
          'Record which of the three it was. The distribution over a month tells you where to spend the next sprint.',
        ],
      },
      {
        type: 'callout',
        kind: 'note',
        title: 'Sweep as a table, not as impressions',
        text: 'Chunk size, overlap, k, fusion weights and reranker are parameters of a run. Produce a comparison table across configurations — that is what [Corpusgraph-style harnesses](/projects) exist to automate.',
      },
      {
        type: 'h2',
        text: 'Gate it in CI',
      },
      {
        type: 'p',
        text: 'Run the retrieval suite on every change to chunking, embedding model, index configuration or corpus ingestion, and fail the build when recall drops below a floor. Retrieval regressions are otherwise invisible until users find them.',
      },
    ],
    exercise: {
      prompt:
        'After re-indexing with a new embedding model, answer quality drops noticeably but nobody changed a prompt. What do you measure first, and what is the most likely cause?',
      approach:
        'Measure recall@k on the labelled set before and after — that isolates retrieval from generation in one run. The most likely causes are a mismatch between the model used to index and the one used to embed queries, or a change in the expected input convention (for example a required prefix on queries versus documents). Both produce a large recall drop with no error anywhere. Pin the embedding model with the index and assert at query time that the two identifiers match.',
    },
    related: [
      { type: 'tech', ref: 'evaluation' },
      { type: 'exam', ref: 'rag-systems' },
    ],
  },

  {
    slug: 'rag-operations',
    title: 'Operating a corpus',
    summary: 'Incremental indexing, freshness, permissions and the failure modes that only appear after launch.',
    minutes: 11,
    topics: ['Operations'],
    objectives: [
      'Design incremental ingestion rather than full re-indexing',
      'Handle deletions and permission changes correctly',
      'Detect corpus drift before users do',
    ],
    body: [
      {
        type: 'p',
        text: 'A corpus is a live dataset with an ingestion pipeline, not a one-off import. Most RAG systems that decay in production decay because nothing owns that pipeline.',
      },
      {
        type: 'h2',
        text: 'Incremental by content hash',
      },
      {
        type: 'p',
        text: 'Re-embedding everything nightly is expensive and slow. Hash each source document; re-chunk and re-embed only what changed. The saving compounds, and it makes a corpus update cheap enough to run often.',
      },
      {
        type: 'code',
        lang: 'python',
        code: `for doc in source.documents():
    digest = sha256(doc.content).hexdigest()
    if store.digest(doc.id) == digest:
        continue                                  # unchanged, skip entirely

    store.delete_chunks(doc.id)                   # remove the old ones first
    store.upsert_chunks(chunk(doc), digest=digest)`,
      },
      {
        type: 'callout',
        kind: 'warning',
        title: 'Deletion is the step people forget',
        text: 'A document removed at source stays in the index forever unless ingestion deletes it. The visible symptom is an assistant confidently citing a policy that was withdrawn — which is worse than not answering.',
      },
      {
        type: 'h2',
        text: 'Permissions change after indexing',
      },
      {
        type: 'p',
        text: 'Storing an ACL on the chunk is correct, but access changes without the document changing. Either re-sync permissions on a schedule independent of content, or store a reference and resolve permissions at query time. Choosing the second costs a lookup per search and removes a whole class of stale-access incident.',
      },
      {
        type: 'h2',
        text: 'Signals worth watching',
      },
      {
        type: 'table',
        head: ['Signal', 'Rising means'],
        rows: [
          ['Abstention rate', 'The corpus no longer covers what people ask'],
          ['Queries with no result above threshold', 'A retrieval or coverage gap'],
          ['Median age of cited chunks', 'The corpus is going stale'],
          ['Ingestion lag', 'Answers are behind the source of truth'],
          ['Duplicate chunk rate', 'Ingestion is running twice or deletion is failing'],
        ],
      },
      {
        type: 'h2',
        text: 'Log the questions you cannot answer',
      },
      {
        type: 'p',
        text: 'The most valuable artefact a RAG system produces is a list of questions where retrieval found nothing good. It is a content backlog written by your users, and acting on it improves answers more reliably than any amount of ranking work.',
      },
    ],
    exercise: {
      prompt:
        'Six months after launch, an internal assistant is being used less and less. Latency and error rates are unchanged. Where do you look?',
      approach:
        'At coverage and freshness rather than at the model. Check the abstention rate and the median age of cited chunks over time; check ingestion lag and whether deletion has been running. The common story is that the corpus was indexed once at launch and the organisation moved on, so answers are increasingly stale or absent and people quietly stop asking. The fix is operational — an owned ingestion schedule, a deletion path, and a review of the unanswered-question log.',
    },
    related: [
      { type: 'lesson', path: 'claude-certified-architect', lesson: 'retrieval-architecture' },
      { type: 'exam', ref: 'rag-systems' },
    ],
  },
]
