/**
 * Export the authored content to one JSON file for the seeder.
 *
 * `src/data` stays the authoring source of truth — it is readable, reviewable
 * and diffable in a way a SQL dump is not. This turns it into the artefact the
 * database is seeded from, so there is exactly one place content is written
 * and exactly one direction it travels:
 *
 *     src/data/*.js  →  service/seed/content.json  →  postgres
 *
 * Run it after editing any data module:
 *
 *     npm run export:content
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const dataDir = resolve(here, '../src/data')

const { technologies, CATEGORIES } = await import(`${dataDir}/technologies.js`)
const { paths, DISCLOSURE } = await import(`${dataDir}/paths.js`)
const { exams } = await import(`${dataDir}/exams/index.js`)
const { projects, CATALOGUE_NOTE } = await import(`${dataDir}/projects.js`)
const { fieldEntries, FIELD_NOTE, KINDS } = await import(`${dataDir}/field.js`)
const { openlcmDocs } = await import(`${dataDir}/docs/openlcm.js`)
const { wheatearDocs } = await import(`${dataDir}/docs/wheatear.js`)

const content = {
  /* Bumped whenever the shape changes, so the seeder can refuse a file it does
     not understand rather than writing half a database. */
  version: 1,
  exportedAt: new Date().toISOString(),
  settings: {
    disclosure: DISCLOSURE,
    catalogueNote: CATALOGUE_NOTE,
    fieldNote: FIELD_NOTE,
    fieldKinds: KINDS,
    technologyCategories: CATEGORIES,
  },
  technologies,
  paths,
  exams,
  projects,
  fieldEntries,
  docSets: [openlcmDocs, wheatearDocs],
}

const out = resolve(here, '../service/seed/content.json')
mkdirSync(dirname(out), { recursive: true })
writeFileSync(out, `${JSON.stringify(content, null, 2)}\n`)

const lessons = paths.reduce((n, p) => n + p.lessons.length, 0)
const questions = exams.reduce((n, e) => n + e.questions.length, 0)
const docPages = content.docSets.reduce((n, s) => n + s.groups.reduce((m, g) => m + g.pages.length, 0), 0)

console.log(
  [
    `wrote ${out}`,
    `  ${technologies.length} technologies`,
    `  ${paths.length} paths, ${lessons} lessons`,
    `  ${exams.length} exams, ${questions} questions`,
    `  ${projects.length} projects, ${content.docSets.length} doc sets, ${docPages} doc pages`,
    `  ${fieldEntries.length} field entries`,
  ].join('\n')
)
