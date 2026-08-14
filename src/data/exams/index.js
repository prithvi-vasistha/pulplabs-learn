import { claudeArchitect, claudeDeveloper } from './claude'
import { ragSystems, agentSystems } from './systems'
import { aiFoundations, responsibleAi } from './foundations'

export const exams = [
  aiFoundations,
  claudeDeveloper,
  claudeArchitect,
  ragSystems,
  agentSystems,
  responsibleAi,
]

export const examBySlug = Object.fromEntries(exams.map((e) => [e.slug, e]))
