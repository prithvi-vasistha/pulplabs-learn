/**
 * Documentation for Wheatear, written by PulpLabs.
 *
 * Conceptual guide. The repository — and its PRODUCT.md — is the authority on
 * the current platform coverage and CLI surface.
 */

export const wheatearDocs = {
  slug: 'wheatear',
  name: 'Wheatear',
  tagline: 'Migrating agents between orchestration platforms without a rebuild.',
  version: 'PulpLabs guide',
  versionNote:
    'Written by PulpLabs as a conceptual guide. Check the repository for current platform coverage, CLI flags and IR schema.',
  repository: 'https://github.com/akshay-eng/Wheatear',
  groups: [
    {
      title: 'Getting started',
      pages: [
        {
          slug: 'introduction',
          title: 'Introduction',
          summary: 'What Wheatear is for, and who it is aimed at.',
          body: [
            {
              type: 'p',
              text: 'Wheatear is an accelerator for moving AI agents and workflows between orchestration platforms. It parses a source workflow into a canonical intermediate representation and generates the target from it, turning a rebuild into a reviewable, testable migration.',
            },
            {
              type: 'h2',
              text: 'The problem',
            },
            {
              type: 'p',
              text: 'An agent workflow built in a vendor designer is expressed in that vendor\'s state model, connectors and control flow. Moving it normally means reading the design, inferring what it was meant to do, rebuilding it elsewhere, and hoping the behaviour matches. The expensive part is not the code — it is re-deriving intent that was never written down.',
            },
            {
              type: 'h2',
              text: 'Who it is for',
            },
            {
              type: 'p',
              text: 'Enterprise architects, platform and integration engineers, and technical decision-makers evaluating a platform switch. The project documents itself with real IR snippets and pipeline traces rather than marketing diagrams, because that audience judges an accelerator by its artefacts.',
            },
            {
              type: 'callout',
              kind: 'note',
              title: 'It is an accelerator, not a button',
              text: 'A migration still needs review and testing. What Wheatear removes is the manual re-derivation of structure — which is most of the work and nearly all of the risk of silent behaviour change.',
            },
          ],
        },
        {
          slug: 'how-it-works',
          title: 'How it works',
          summary: 'Parse, transform, generate — with the IR as the seam.',
          body: [
            {
              type: 'figure',
              caption: 'One parser per source, one generator per target',
              art: `source platform ──parse──▶ canonical IR ──generate──▶ target platform
                              │
                              ├── diffable: review the workflow, not the code
                              ├── testable: run the same cases against both
                              └── reusable: N + M adapters instead of N × M paths`,
            },
            {
              type: 'p',
              text: 'The IR is the point. Without it, every source-to-target pair is its own migration tool; with it, adding a platform means writing one parser or one generator and inheriting every existing pairing.',
            },
            {
              type: 'h2',
              text: 'Three stages',
            },
            {
              type: 'steps',
              items: [
                '**Parse.** Read the source workflow — exported definition, configuration, or code — into steps, tools, transitions and conditions.',
                '**Transform.** Normalise into the canonical IR. This stage is deterministic, because it is where correctness is decided.',
                '**Generate.** Emit the target platform\'s representation from the IR, with the parts that have no equivalent flagged rather than silently dropped.',
              ],
            },
            {
              type: 'p',
              text: 'The flagging matters as much as the generation. A construct with no target equivalent is a decision for a human, and a tool that quietly omits it produces a workflow that looks complete and is not.',
            },
          ],
        },
      ],
    },
    {
      title: 'Concepts',
      pages: [
        {
          slug: 'intermediate-representation',
          title: 'The intermediate representation',
          summary: 'A platform-neutral description of what a workflow does.',
          body: [
            {
              type: 'p',
              text: 'The IR describes a workflow in terms every platform has: steps, the tools they invoke, the transitions between them, and the conditions on those transitions. Platform-specific detail is carried as annotations rather than being baked into the structure.',
            },
            {
              type: 'code',
              lang: 'yaml',
              file: 'illustrative IR fragment',
              code: `id: refund-triage
entry: classify
steps:
  - id: classify
    kind: model_call
    prompt_ref: prompts/classify.md
    output: { schema: RefundIntent }
    transitions:
      - when: "intent == 'refund'"
        to: check_eligibility
      - default: handoff

  - id: check_eligibility
    kind: tool_call
    tool: billing.get_order
    inputs: { order_id: "$.intent.order_id" }
    on_error: handoff`,
            },
            {
              type: 'p',
              text: 'Because it is structured text, the IR is diffable. That is what lets a migration be reviewed as a change to a workflow rather than as a wall of generated code — and it is what makes a second migration cheap.',
            },
            {
              type: 'callout',
              kind: 'note',
              title: 'Illustrative',
              text: 'The fragment above shows the shape of the idea, not the current schema. Check the repository for the real IR definition before writing against it.',
            },
          ],
        },
        {
          slug: 'deterministic-and-assisted',
          title: 'Deterministic and assisted stages',
          summary: 'Which parts are code, which parts use a model, and why the split falls there.',
          body: [
            {
              type: 'p',
              text: 'Wheatear is deliberate about where model assistance is used. Structural transformation is deterministic; assistance is applied only where the source genuinely does not state its intent.',
            },
            {
              type: 'table',
              head: ['Stage', 'Deterministic', 'Model-assisted'],
              rows: [
                ['Parsing a definition', 'Yes', 'No'],
                ['Normalising to IR', 'Yes', 'No'],
                ['Naming and describing recovered steps', 'No', 'Yes'],
                ['Inferring intent behind an undocumented branch', 'No', 'Yes'],
                ['Generating the target', 'Yes', 'No'],
              ],
            },
            {
              type: 'p',
              text: 'The reason for the split is reviewability. A deterministic transformation can be trusted and spot-checked; an inferred intent must be read by a human, and it is far easier to review when it is isolated to a labelled part of the output.',
            },
            {
              type: 'callout',
              kind: 'warning',
              title: 'Review the inferred parts',
              text: 'Anything the pipeline inferred is a hypothesis about what the original authors meant. It is usually right and occasionally confidently wrong — which is exactly why it is separated from the parts that are not guesses.',
            },
          ],
        },
        {
          slug: 'platform-coverage',
          title: 'Platform coverage',
          summary: 'What "supported" means, and what never transfers.',
          body: [
            {
              type: 'p',
              text: 'Wheatear targets migrations between the major agent orchestration platforms and code frameworks — among them Copilot Studio, watsonx Orchestrate, OpenAI, Vertex AI, Bedrock AgentCore and n8n. Check the repository for the current list; it moves.',
            },
            {
              type: 'h2',
              text: 'What transfers',
            },
            {
              type: 'table',
              head: ['Transfers', 'Does not transfer'],
              rows: [
                ['Prompts and instructions', 'Vendor connector configuration'],
                ['Tool contracts — name, schema, semantics', 'Managed memory and hosted stores'],
                ['Control flow and conditions', 'Platform-specific runtime behaviour'],
                ['Business rules and escalation policy', 'Identity, secrets and deployment'],
              ],
            },
            {
              type: 'p',
              text: 'The right-hand column is not a gap in the tool — it is the part of a migration that is genuinely re-implementation. Naming it early is what keeps a migration estimate honest.',
            },
          ],
        },
      ],
    },
    {
      title: 'Guides',
      pages: [
        {
          slug: 'planning-a-migration',
          title: 'Planning a migration',
          summary: 'Sequencing the work so the risky part happens last.',
          body: [
            {
              type: 'steps',
              items: [
                '**Inventory.** List every workflow, its triggers, its tools, and who depends on it. Half of them are usually dormant.',
                '**Recover evaluation sets.** Capture real tasks and their outcomes from production traces. Without these, "it works the same" is an opinion.',
                '**Migrate something low-risk first.** The second migration is far cheaper than the first; pay the learning cost where it does not matter.',
                '**Do the critical ones with the pipeline proven**, and shadow-run them before any traffic moves.',
                '**Extract the portable assets as you go** — prompts, tool contracts and evaluation sets into your own repository.',
              ],
            },
            {
              type: 'callout',
              kind: 'note',
              title: 'The last step is the one that pays twice',
              text: 'Prompts and evaluation sets kept in your own version control are what stop the next migration from being this expensive.',
            },
            {
              type: 'p',
              text: 'Expect the inventory to shrink the project. Workflows that nobody triggers do not need migrating, and finding them is often the single largest saving in the plan.',
            },
          ],
        },
        {
          slug: 'proving-equivalence',
          title: 'Proving equivalence',
          summary: 'Comparing outcomes rather than transcripts, and switching traffic on evidence.',
          body: [
            {
              type: 'p',
              text: 'Two agents will not produce identical text, and they do not need to. What must match is behaviour: the same tools called with the same arguments, the same escalations, the same final state.',
            },
            {
              type: 'steps',
              items: [
                'Run the recovered case set against both implementations with tool calls recorded.',
                'Compare outcomes and tool traces, not wording. Different phrasing with the same action taken is a pass.',
                'Shadow-run the target against live traffic with side effects disabled.',
                'Switch a small share of traffic and compare production signals — escalation rate, completion rate, cost per task.',
                'Keep the rollback a configuration change until the comparison is boring.',
              ],
            },
            {
              type: 'table',
              head: ['Compare', 'Ignore'],
              rows: [
                ['Tools called, and with what arguments', 'Exact wording of the reply'],
                ['Final state and side effects', 'Number of reasoning steps'],
                ['Escalation and refusal decisions', 'Token counts, unless cost is the concern'],
              ],
            },
            {
              type: 'callout',
              kind: 'warning',
              title: 'Disable side effects in shadow mode',
              text: 'A shadow run that issues real refunds is not a shadow run. Route writing tools to a recorder before pointing any traffic at the new implementation.',
            },
          ],
        },
      ],
    },
    {
      title: 'Reference',
      pages: [
        {
          slug: 'troubleshooting',
          title: 'Troubleshooting',
          summary: 'The failures a migration actually produces.',
          body: [
            { type: 'h2', text: 'The generated workflow is missing a branch' },
            {
              type: 'p',
              text: 'Check the flagged constructs in the pipeline output. A branch with no equivalent on the target is reported rather than emitted, and it is a decision for a human — silently dropping it is the failure mode this behaviour exists to prevent.',
            },
            { type: 'h2', text: 'Behaviour differs only on edge cases' },
            {
              type: 'p',
              text: 'Usually an inferred condition. Look at the model-assisted portion of the IR: a branch whose intent had to be recovered is the most likely place for a subtle mismatch. Compare against the source definition and correct the IR rather than patching the generated output.',
            },
            { type: 'h2', text: 'Tools work in isolation but fail in the migrated workflow' },
            {
              type: 'p',
              text: 'Almost always identity or secrets — the part that never transfers. Confirm the target is calling with the right principal, and that the tool enforces authorisation itself rather than relying on a connector the old platform provided.',
            },
            { type: 'h2', text: 'The comparison run is inconclusive' },
            {
              type: 'p',
              text: 'The case set is too small or too easy. Recover more cases from production traces, weighted towards the ones that escalated or failed — those are the behaviours a migration is most likely to change.',
            },
          ],
        },
      ],
    },
  ],
}
