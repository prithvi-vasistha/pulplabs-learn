/**
 * Certification preparation tracks.
 *
 * A track is an ordering over lessons, grouped into modules. It owns no lesson
 * content — it references lesson slugs, and the lesson files own the text.
 * Total time is derived from the lessons, never typed in by hand.
 *
 * HONESTY NOTE — read before editing.
 * These are independent preparation tracks. PulpLabs is not a certification
 * body and is not affiliated with any vendor's certification programme.
 * Nothing here reproduces an official exam blueprint, question bank, or
 * scoring rule, and no track claims a pass rate. Where a track names a
 * certification, it names what the track covers — always check the awarding
 * body's current exam guide for format, cost and eligibility.
 */

export const DISCLOSURE =
  'Independent preparation material. PulpLabs is not a certification body and is not affiliated with the awarding organisations. Always check the official exam guide for the current format and requirements.'

import { architectLessons } from './lessons/architect'
import { developerLessons } from './lessons/developer'
import { ragLessons } from './lessons/rag'
import { agentLessons } from './lessons/agents'

export const paths = [
  {
    slug: 'claude-certified-architect',
    plate: 'aperture-glow',
    title: 'Claude Certified Architect',
    certification: 'Claude Certified Architect',
    eyebrow: 'Architecture track',
    summary:
      'Design systems around a language model that you would be willing to operate: model selection under a budget, context strategy, where retrieval belongs, integration boundaries, evaluation, and what the product does when the provider is down.',
    level: 'Advanced',
    span: 'Intermediate → Advanced',
    audience:
      'Engineers and architects who already build with a model API and are now responsible for the decisions that are expensive to reverse — topology, boundaries, evaluation and operations.',
    prerequisites: [
      'You have called a model API and handled its response in production code',
      'You are comfortable reasoning about latency, cost and failure in a distributed system',
    ],
    outcomes: [
      'Choose a model per task from a stated latency, cost and quality budget',
      'Budget a context window and pick a compression strategy with its trade-off named',
      'Place retrieval, permissions and freshness boundaries correctly',
      'Decide between a direct tool, an MCP server, and plain code',
      'Gate a release on evaluation evidence and design a degraded mode that works',
    ],
    covers: [
      'Model selection and workload splitting',
      'Context windows, compression and caching',
      'Retrieval architecture and permission boundaries',
      'Tool and protocol integration design',
      'Evaluation, rollout and rollback',
      'Cost, latency, reliability and observability',
    ],
    skills: ['Model selection', 'Context strategy', 'Retrieval design', 'MCP', 'Evaluation', 'Operations'],
    technologies: ['claude', 'context-engineering', 'retrieval', 'mcp', 'evaluation'],
    lessons: architectLessons,
    modules: [
      { title: 'Shaping the system', lessons: ['model-selection', 'context-strategy'] },
      { title: 'Boundaries', lessons: ['retrieval-architecture', 'integration-boundaries'] },
      { title: 'Getting it into production', lessons: ['evaluation-and-rollout', 'cost-latency-reliability'] },
    ],
    exams: ['claude-architect', 'ai-foundations'],
    projects: ['openlcm', 'wheatear'],
  },

  {
    slug: 'claude-certified-developer',
    plate: 'flare-column',
    title: 'Claude Certified Developer',
    certification: 'Claude Certified Developer',
    eyebrow: 'Developer track',
    summary:
      'The API surface in detail: messages and stop reasons, streaming, the tool-use exchange, schema-constrained output, prompt caching and batching, and the error handling that keeps an integration alive under load.',
    level: 'Intermediate',
    span: 'Beginner → Advanced',
    audience:
      'Developers integrating a model into an application who want to know the request surface properly rather than by trial and error.',
    prerequisites: [
      'Comfortable reading Python or TypeScript',
      'You have consumed a JSON HTTP API from application code',
    ],
    outcomes: [
      'Assemble a valid request and read every content block and stop reason correctly',
      'Stream a response and reassemble the final message, including tool arguments',
      'Implement the full tool-use loop with matched results and recoverable errors',
      'Force schema-constrained output and validate it at the boundary',
      'Classify an API error correctly and back off without amplifying an outage',
    ],
    covers: [
      'Request and response shape',
      'Streaming and cancellation',
      'Tool use end to end',
      'Structured output and validation',
      'Prompt caching and batch processing',
      'Errors, rate limits and resilience',
    ],
    skills: ['Messages API', 'Streaming', 'Tool use', 'Structured output', 'Caching', 'Resilience'],
    technologies: ['messages-api', 'tool-use', 'structured-output', 'python', 'typescript'],
    lessons: developerLessons,
    modules: [
      { title: 'The request surface', lessons: ['messages-and-turns', 'streaming'] },
      { title: 'Making it do things', lessons: ['tool-calling', 'structured-json'] },
      { title: 'Running it for real', lessons: ['caching-and-batching', 'errors-and-retries'] },
    ],
    exams: ['claude-developer', 'ai-foundations'],
    projects: ['presoai', 'openlcm'],
  },

  {
    slug: 'rag-systems-specialist',
    plate: 'deep-field',
    title: 'RAG Systems Specialist',
    certification: 'RAG Systems Specialist',
    eyebrow: 'Retrieval track',
    summary:
      'Build retrieval that sets a high ceiling: chunking that survives being read alone, hybrid search, reranking, citations you can verify in code, and the component metrics that tell you which half is broken.',
    level: 'Intermediate',
    span: 'Beginner → Advanced',
    audience:
      'Engineers whose assistant answers badly and who need to find out whether that is a retrieval problem, a chunking problem or a prompting problem.',
    prerequisites: [
      'You have built or used a vector search index',
      'Comfortable reading Python',
    ],
    outcomes: [
      'Chunk on structure and carry the metadata that filtering later depends on',
      'Fuse lexical and semantic rankings without tuning score scales',
      'Separate the recall stage from the precision stage and choose each k with evidence',
      'Verify grounding mechanically instead of trusting the answer',
      'Attribute an end-to-end failure to retrieval, ranking or generation',
    ],
    covers: [
      'Chunking strategy and metadata',
      'Vector, lexical and hybrid retrieval',
      'Reranking and context selection',
      'Grounding, citations and abstention',
      'Retrieval metrics and evaluation',
      'Corpus operations and freshness',
    ],
    skills: ['Chunking', 'Hybrid search', 'Reranking', 'Grounding', 'recall@k', 'Corpus operations'],
    technologies: ['retrieval', 'embeddings', 'evaluation', 'structured-output'],
    lessons: ragLessons,
    modules: [
      { title: 'Getting the right passage', lessons: ['chunking', 'hybrid-search'] },
      { title: 'Getting it to the top', lessons: ['reranking', 'grounding'] },
      { title: 'Knowing that it works', lessons: ['rag-evaluation', 'rag-operations'] },
    ],
    exams: ['rag-systems', 'ai-foundations'],
    projects: ['openlcm'],
  },

  {
    slug: 'agent-systems-professional',
    plate: 'grid-horizon',
    title: 'Agent Systems Professional',
    certification: 'Agent Systems Professional',
    eyebrow: 'Agents track',
    summary:
      'Agents that terminate, cost what you expect, and can be explained afterwards: the loop and its bounds, tool design, memory, when a second agent helps, tracing, and moving a workflow between platforms.',
    level: 'Advanced',
    span: 'Intermediate → Advanced',
    audience:
      'Engineers putting tool-using agents into production, and architects deciding whether an agent is the right shape at all.',
    prerequisites: [
      'You have implemented at least one tool call end to end',
      'Comfortable reasoning about retries, budgets and side effects',
    ],
    outcomes: [
      'Write the loop underneath every framework, with four bounds applied',
      'Design tools an agent uses correctly on the first attempt',
      'Separate working context, run state and durable memory',
      'Name the coordination cost before adding a second agent',
      'Trace a run well enough to explain a wrong action a month later',
    ],
    covers: [
      'The agent loop and its bounds',
      'Tool granularity, descriptions and error shapes',
      'Memory, promotion and checkpointing',
      'Multi-agent topologies and their failure modes',
      'Tracing, metrics and replay tests',
      'Portability and platform migration',
    ],
    skills: ['Agent loops', 'Tool design', 'Memory', 'Topologies', 'Tracing', 'Migration'],
    technologies: ['agent-loops', 'tool-use', 'orchestration', 'guardrails', 'context-engineering'],
    lessons: agentLessons,
    modules: [
      { title: 'The loop', lessons: ['agent-loop', 'tool-design'] },
      { title: 'State and scale', lessons: ['agent-memory', 'multi-agent'] },
      { title: 'Operating and moving', lessons: ['agent-observability', 'agent-portability'] },
    ],
    exams: ['agent-systems', 'responsible-ai'],
    projects: ['wheatear', 'openlcm'],
  },
]

/** Lessons in track order — the sequence used for previous/next navigation. */
export function orderedLessons(path) {
  const bySlug = Object.fromEntries(path.lessons.map((l) => [l.slug, l]))
  return path.modules.flatMap((m) =>
    m.lessons.map((slug) => ({ ...bySlug[slug], module: m.title })).filter((l) => l.slug)
  )
}

export function pathMinutes(path) {
  return path.lessons.reduce((total, lesson) => total + lesson.minutes, 0)
}

export const pathBySlug = Object.fromEntries(paths.map((p) => [p.slug, p]))
