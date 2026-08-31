/**
 * Load the exported content into Postgres.
 *
 * Idempotent by design: every write is an upsert keyed on the natural slug, so
 * running it on every boot is safe and is what the container does. Editing a
 * lesson and restarting is the whole update story.
 *
 * It does not delete rows the export no longer contains — that would make a
 * partial or stale export destructive. Removals are deliberate and go through
 * `npm run seed -- --prune`.
 */

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pool, query, waitForDatabase } from './db.js'

const here = dirname(fileURLToPath(import.meta.url))
const SUPPORTED_VERSION = 1

export async function seed({ prune = false, file } = {}) {
  const path = file ?? resolve(here, '../seed/content.json')
  const content = JSON.parse(readFileSync(path, 'utf8'))

  if (content.version !== SUPPORTED_VERSION) {
    throw new Error(
      `content.json is version ${content.version}; this seeder understands ${SUPPORTED_VERSION}. ` +
        'Re-run `npm run export:content` in the web app.'
    )
  }

  const client = await pool.connect()
  try {
    await client.query('begin')

    // ---- settings --------------------------------------------------------
    for (const [key, value] of Object.entries(content.settings)) {
      await client.query(
        `insert into settings (key, value) values ($1, $2)
         on conflict (key) do update set value = excluded.value`,
        [key, JSON.stringify(value)]
      )
    }

    // ---- technologies ----------------------------------------------------
    for (const [i, t] of content.technologies.entries()) {
      await client.query(
        `insert into technologies
           (slug, name, category, level, tagline, what, why, outline, facts,
            prerequisites, related, path_slugs, exam_slugs, project_slugs, position)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
         on conflict (slug) do update set
           name = excluded.name, category = excluded.category, level = excluded.level,
           tagline = excluded.tagline, what = excluded.what, why = excluded.why,
           outline = excluded.outline, facts = excluded.facts,
           prerequisites = excluded.prerequisites, related = excluded.related,
           path_slugs = excluded.path_slugs, exam_slugs = excluded.exam_slugs,
           project_slugs = excluded.project_slugs, position = excluded.position`,
        [
          t.slug, t.name, t.category, t.level, t.tagline, t.what ?? null, t.why ?? null,
          JSON.stringify(t.outline ?? []), JSON.stringify(t.facts ?? []),
          t.prerequisites ?? [], t.related ?? [], t.paths ?? [], t.exams ?? [], t.projects ?? [], i,
        ]
      )
    }

    // ---- paths and their lessons ----------------------------------------
    for (const [i, p] of content.paths.entries()) {
      await client.query(
        `insert into paths
           (slug, title, certification, plate, eyebrow, summary, level, span, audience,
            prerequisites, outcomes, covers, modules, skills, technologies,
            exam_slugs, project_slugs, position)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
         on conflict (slug) do update set
           title = excluded.title, certification = excluded.certification, plate = excluded.plate,
           eyebrow = excluded.eyebrow, summary = excluded.summary, level = excluded.level,
           span = excluded.span, audience = excluded.audience,
           prerequisites = excluded.prerequisites, outcomes = excluded.outcomes,
           covers = excluded.covers, modules = excluded.modules, skills = excluded.skills,
           technologies = excluded.technologies, exam_slugs = excluded.exam_slugs,
           project_slugs = excluded.project_slugs, position = excluded.position`,
        [
          p.slug, p.title, p.certification ?? null, p.plate ?? null, p.eyebrow ?? null,
          p.summary, p.level, p.span ?? null, p.audience ?? null,
          JSON.stringify(p.prerequisites ?? []), JSON.stringify(p.outcomes ?? []),
          JSON.stringify(p.covers ?? []), JSON.stringify(p.modules ?? []),
          p.skills ?? [], p.technologies ?? [], p.exams ?? [], p.projects ?? [], i,
        ]
      )

      // Lesson order comes from the modules, which is the order a reader sees.
      const order = (p.modules ?? []).flatMap((m) => m.lessons)
      for (const lesson of p.lessons) {
        const position = order.indexOf(lesson.slug)
        await client.query(
          `insert into lessons
             (path_slug, slug, title, summary, minutes, module, topics,
              objectives, body, exercise, related, position)
           values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
           on conflict (path_slug, slug) do update set
             title = excluded.title, summary = excluded.summary, minutes = excluded.minutes,
             module = excluded.module, topics = excluded.topics, objectives = excluded.objectives,
             body = excluded.body, exercise = excluded.exercise, related = excluded.related,
             position = excluded.position`,
          [
            p.slug, lesson.slug, lesson.title, lesson.summary, lesson.minutes ?? 0,
            lesson.module ?? null, lesson.topics ?? [],
            JSON.stringify(lesson.objectives ?? []), JSON.stringify(lesson.body ?? []),
            lesson.exercise ? JSON.stringify(lesson.exercise) : null,
            JSON.stringify(lesson.related ?? []),
            position === -1 ? 999 : position,
          ]
        )
      }
    }

    // ---- exams and questions --------------------------------------------
    for (const [i, e] of content.exams.entries()) {
      await client.query(
        `insert into exams
           (slug, family, title, summary, level, minutes, passing, topics, technologies,
            rules, topic_links, position)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         on conflict (slug) do update set
           family = excluded.family, title = excluded.title, summary = excluded.summary,
           level = excluded.level, minutes = excluded.minutes, passing = excluded.passing,
           topics = excluded.topics, technologies = excluded.technologies,
           rules = excluded.rules, topic_links = excluded.topic_links, position = excluded.position`,
        [
          e.slug, e.family ?? 'Foundations and practice', e.title, e.summary, e.level,
          e.minutes ?? 0, e.passing ?? 70, e.topics ?? [], e.technologies ?? [],
          JSON.stringify(e.rules ?? []), JSON.stringify(e.topicLinks ?? {}), i,
        ]
      )

      for (const [qi, q] of e.questions.entries()) {
        await client.query(
          `insert into questions
             (exam_slug, id, type, topic, difficulty, prompt, options, correct, explanation, position)
           values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
           on conflict (exam_slug, id) do update set
             type = excluded.type, topic = excluded.topic, difficulty = excluded.difficulty,
             prompt = excluded.prompt, options = excluded.options, correct = excluded.correct,
             explanation = excluded.explanation, position = excluded.position`,
          [
            e.slug, q.id, q.type ?? 'single', q.topic, q.difficulty ?? 1, q.prompt,
            JSON.stringify(q.options ?? []), q.correct ?? [], q.explanation ?? null, qi,
          ]
        )
      }
    }

    // ---- projects --------------------------------------------------------
    for (const [i, p] of content.projects.entries()) {
      await client.query(
        `insert into projects
           (slug, name, tagline, category, status, repository, docs, description, problem,
            features, architecture, learn, technologies, exam_slugs, position)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
         on conflict (slug) do update set
           name = excluded.name, tagline = excluded.tagline, category = excluded.category,
           status = excluded.status, repository = excluded.repository, docs = excluded.docs,
           description = excluded.description, problem = excluded.problem,
           features = excluded.features, architecture = excluded.architecture,
           learn = excluded.learn, technologies = excluded.technologies,
           exam_slugs = excluded.exam_slugs, position = excluded.position`,
        [
          p.slug, p.name, p.tagline, p.category ?? null, p.status ?? null,
          p.repository ?? null, p.docs ?? null, p.description ?? null, p.problem ?? null,
          JSON.stringify(p.features ?? []), JSON.stringify(p.architecture ?? []),
          JSON.stringify(p.learn ?? []), p.technologies ?? [], p.exams ?? [], i,
        ]
      )
    }

    // ---- documentation ---------------------------------------------------
    for (const [i, set] of content.docSets.entries()) {
      await client.query(
        `insert into doc_sets (slug, name, tagline, version, version_note, repository, position)
         values ($1,$2,$3,$4,$5,$6,$7)
         on conflict (slug) do update set
           name = excluded.name, tagline = excluded.tagline, version = excluded.version,
           version_note = excluded.version_note, repository = excluded.repository,
           position = excluded.position`,
        [set.slug, set.name, set.tagline, set.version ?? null, set.versionNote ?? null, set.repository ?? null, i]
      )

      let position = 0
      for (const group of set.groups) {
        for (const page of group.pages) {
          await client.query(
            `insert into doc_pages (set_slug, slug, title, summary, group_title, body, position)
             values ($1,$2,$3,$4,$5,$6,$7)
             on conflict (set_slug, slug) do update set
               title = excluded.title, summary = excluded.summary, group_title = excluded.group_title,
               body = excluded.body, position = excluded.position`,
            [set.slug, page.slug, page.title, page.summary ?? null, group.title, JSON.stringify(page.body ?? []), position++]
          )
        }
      }
    }

    // ---- field -----------------------------------------------------------
    for (const [i, f] of content.fieldEntries.entries()) {
      await client.query(
        `insert into field_entries
           (slug, kind, title, client, logo, logo_ground, logo_shape, sector, summary,
            published, minutes, plate,
            video, people, facts, quote, body, learn, technologies, position)
         values ($1,$2,$3,$4,$5,$19,$20,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
         on conflict (slug) do update set
           kind = excluded.kind, title = excluded.title, client = excluded.client,
           logo = excluded.logo, logo_ground = excluded.logo_ground,
           logo_shape = excluded.logo_shape,
           sector = excluded.sector, summary = excluded.summary,
           published = excluded.published, minutes = excluded.minutes, plate = excluded.plate,
           video = excluded.video, people = excluded.people, facts = excluded.facts,
           quote = excluded.quote, body = excluded.body, learn = excluded.learn,
           technologies = excluded.technologies, position = excluded.position`,
        [
          f.slug, f.kind, f.title, f.client ?? null, f.logo ?? null, f.sector ?? null,
          f.summary, f.published ?? null, f.minutes ?? 0, f.plate ?? null,
          f.video ? JSON.stringify(f.video) : null,
          JSON.stringify(f.people ?? []), JSON.stringify(f.facts ?? []),
          f.quote ? JSON.stringify(f.quote) : null,
          JSON.stringify(f.body ?? []), JSON.stringify(f.learn ?? []),
          f.technologies ?? [], i,
          f.logoGround ?? null, f.logoShape ?? null,
        ]
      )
    }

    // ---- articles --------------------------------------------------------
    for (const [i, a] of (content.articles ?? []).entries()) {
      await client.query(
        `insert into articles
           (slug, title, topic, summary, author, published, minutes, body, related, technologies, position)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         on conflict (slug) do update set
           title = excluded.title, topic = excluded.topic, summary = excluded.summary,
           author = excluded.author, published = excluded.published, minutes = excluded.minutes,
           body = excluded.body, related = excluded.related,
           technologies = excluded.technologies, position = excluded.position`,
        [
          a.slug, a.title, a.topic, a.summary, a.author ?? null, a.published ?? null,
          a.minutes ?? 0, JSON.stringify(a.body ?? []), JSON.stringify(a.related ?? []),
          a.technologies ?? [], i,
        ]
      )
    }

    // ---- playground ------------------------------------------------------
    for (const [i, d] of (content.playground ?? []).entries()) {
      await client.query(
        `insert into playground_demos
           (slug, title, tagline, kind, engine, summary, minutes, brief, controls, learn,
            spec, technologies, position, status)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         on conflict (slug) do update set
           title = excluded.title, tagline = excluded.tagline, kind = excluded.kind,
           engine = excluded.engine, summary = excluded.summary, minutes = excluded.minutes,
           brief = excluded.brief, controls = excluded.controls, learn = excluded.learn,
           spec = excluded.spec, technologies = excluded.technologies, position = excluded.position,
           status = excluded.status`,
        [
          d.slug, d.title, d.tagline, d.kind ?? 'Sandbox', d.engine, d.summary, d.minutes ?? 0,
          JSON.stringify(d.brief ?? []), JSON.stringify(d.controls ?? {}),
          JSON.stringify(d.learn ?? []), JSON.stringify(d.spec ?? {}),
          d.technologies ?? [], i, d.status ?? 'live',
        ]
      )
    }

    if (prune) {
      await pruneMissing(client, content)
    }

    await client.query('commit')
  } catch (error) {
    await client.query('rollback')
    throw error
  } finally {
    client.release()
  }

  const counts = await countRows()
  console.log('[seed] ok:', counts)
  return counts
}

/** Only run deliberately: removes rows the export no longer mentions. */
async function pruneMissing(client, content) {
  const slugs = (list) => list.map((x) => x.slug)
  const table = async (name, keep) => {
    const result = await client.query(`delete from ${name} where slug <> all($1::text[])`, [keep])
    if (result.rowCount) console.log(`[seed] pruned ${result.rowCount} from ${name}`)
  }
  await table('technologies', slugs(content.technologies))
  await table('paths', slugs(content.paths))
  await table('exams', slugs(content.exams))
  await table('projects', slugs(content.projects))
  await table('doc_sets', slugs(content.docSets))
  await table('field_entries', slugs(content.fieldEntries))
  await table('articles', slugs(content.articles ?? []))
  await table('playground_demos', slugs(content.playground ?? []))
}

async function countRows() {
  const { rows } = await query(`
    select
      (select count(*) from technologies)  as technologies,
      (select count(*) from paths)         as paths,
      (select count(*) from lessons)       as lessons,
      (select count(*) from exams)         as exams,
      (select count(*) from questions)     as questions,
      (select count(*) from projects)      as projects,
      (select count(*) from doc_sets)      as doc_sets,
      (select count(*) from doc_pages)     as doc_pages,
      (select count(*) from field_entries) as field_entries,
      (select count(*) from articles)      as articles,
      (select count(*) from playground_demos) as playground,
      (select count(*) from users)         as users
  `)
  return Object.fromEntries(Object.entries(rows[0]).map(([k, v]) => [k, Number(v)]))
}

// Run directly: node src/seed.js [--prune]
if (import.meta.url === `file://${process.argv[1]}`) {
  await waitForDatabase()
  await seed({ prune: process.argv.includes('--prune') })
  await pool.end()
}
