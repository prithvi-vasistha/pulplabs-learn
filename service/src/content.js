/**
 * Every read the UI needs, over Postgres.
 *
 * The shapes returned here are exactly the shapes `src/lib/content.js` used to
 * build from static modules. That is the point: the derivation logic moved to
 * this side of the wire, the web app's accessors became one-line fetches, and
 * not a single page component changed.
 *
 * The one thing that never crosses the wire is the answer key. `candidateExam`
 * and `gradeAttempt` both live here; the browser can only ever ask for the
 * former.
 */

import { one, rows } from './db.js'

/* ------------------------------------------------------------- settings --- */

export async function getSettings() {
  const list = await rows('select key, value from settings')
  return Object.fromEntries(list.map((r) => [r.key, r.value]))
}

/* ---------------------------------------------------------------- paths --- */

/* Fully qualified: paths and lessons share slug, title, summary, minutes and
   position, so a bare column list is ambiguous the moment they are joined.
   `p.*` is safe under `group by p.slug` because slug is the primary key. */
const PATH_COLS = '*'

function summarisePath(row, minutes, lessonCount) {
  return {
    slug: row.slug,
    title: row.title,
    certification: row.certification,
    plate: row.plate ?? 'aperture-glow',
    eyebrow: row.eyebrow,
    summary: row.summary,
    level: row.level,
    span: row.span,
    minutes: Number(minutes ?? 0),
    lessonCount: Number(lessonCount ?? 0),
    moduleCount: (row.modules ?? []).length,
    technologies: row.technologies ?? [],
    skills: row.skills ?? [],
    exams: row.exam_slugs ?? [],
    projects: row.project_slugs ?? [],
  }
}

export async function getPaths() {
  const list = await rows(`
    select p.*,
           coalesce(sum(l.minutes), 0) as minutes,
           count(l.slug)               as lesson_count
      from paths p
      left join lessons l on l.path_slug = p.slug
     group by p.slug
     order by p.position
  `)
  return list.map((r) => summarisePath(r, r.minutes, r.lesson_count))
}

const LESSON_SUMMARY = 'slug, title, summary, minutes, module, topics, position'

function toLessonSummary(row) {
  return {
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    minutes: Number(row.minutes),
    topics: row.topics ?? [],
    module: row.module,
  }
}

export async function getPath(slug) {
  const row = await one(
    `select p.*,
            coalesce(sum(l.minutes), 0) as minutes,
            count(l.slug)               as lesson_count
       from paths p
       left join lessons l on l.path_slug = p.slug
      where p.slug = $1
      group by p.slug`,
    [slug]
  )
  if (!row) return null

  const lessons = await rows(
    `select ${LESSON_SUMMARY} from lessons where path_slug = $1 order by position`,
    [slug]
  )
  const bySlug = Object.fromEntries(lessons.map((l) => [l.slug, toLessonSummary(l)]))

  return {
    ...summarisePath(row, row.minutes, row.lesson_count),
    audience: row.audience,
    prerequisites: row.prerequisites ?? [],
    outcomes: row.outcomes ?? [],
    covers: row.covers ?? [],
    modules: (row.modules ?? []).map((m) => ({
      title: m.title,
      lessons: m.lessons.map((s) => bySlug[s]).filter(Boolean),
    })),
    lessons: lessons.map(toLessonSummary),
  }
}

export async function getLesson(pathSlug, lessonSlug) {
  const path = await getPath(pathSlug)
  if (!path) return null

  const index = path.lessons.findIndex((l) => l.slug === lessonSlug)
  if (index === -1) return null

  const full = await one(
    `select *
       from lessons where path_slug = $1 and slug = $2`,
    [pathSlug, lessonSlug]
  )

  const { modules, lessons, ...summary } = path

  return {
    path: summary,
    lessons,
    modules,
    lesson: {
      ...toLessonSummary(full),
      objectives: full.objectives ?? [],
      body: full.body ?? [],
      exercise: full.exercise,
      related: await resolveRelated(full.related ?? []),
    },
    position: index + 1,
    total: lessons.length,
    previous: index > 0 ? lessons[index - 1] : null,
    next: index < lessons.length - 1 ? lessons[index + 1] : null,
  }
}

async function resolveRelated(entries) {
  const out = []
  for (const entry of entries) {
    if (entry.type === 'lesson') {
      const l = await one('select title from lessons where path_slug = $1 and slug = $2', [entry.path, entry.lesson])
      if (l) out.push({ kind: 'Lesson', label: l.title, href: `/learn/${entry.path}/${entry.lesson}` })
    } else if (entry.type === 'exam') {
      const e = await one('select title from exams where slug = $1', [entry.ref])
      if (e) out.push({ kind: 'Mock exam', label: e.title, href: `/exams/${entry.ref}` })
    } else if (entry.type === 'tech') {
      const t = await one('select name from technologies where slug = $1', [entry.ref])
      if (t) out.push({ kind: 'Technology', label: t.name, href: `/technologies/${entry.ref}` })
    } else if (entry.type === 'project') {
      const p = await one('select name from projects where slug = $1', [entry.ref])
      if (p) out.push({ kind: 'Project', label: p.name, href: `/projects/${entry.ref}` })
    }
  }
  return out
}

export async function getAllLessonParams() {
  const list = await rows('select path_slug, slug from lessons order by path_slug, position')
  return list.map((r) => ({ path: r.path_slug, lesson: r.slug }))
}

/* --------------------------------------------------------- technologies --- */

/**
 * Every content type that mentions a technology, counted once. Same joins as
 * before — a lesson knows its topics, a field entry declares its technologies,
 * a doc set belongs to a project that declares its own.
 */
/**
 * What a topic page is made of.
 *
 * A topic is an editorial surface: our writing on a subject, and the way in
 * for somebody who arrived from a search engine. It used to re-list every
 * lesson, exam, project, doc page and case study that touched the subject,
 * which meant the topic pages republished the course catalogue — one thing
 * described twice, in two sections, with two names.
 *
 * So it joins three things now: the articles written about it, the one course
 * that teaches it properly, and any demo that lets you try it.
 */
async function technologyJoins(tech) {
  const [paths, articles, demos] = await Promise.all([
    tech.path_slugs.length
      ? rows(
          `select p.*, coalesce(sum(l.minutes),0) as minutes, count(l.slug) as lesson_count
             from paths p left join lessons l on l.path_slug = p.slug
            where p.slug = any($1::text[]) group by p.slug order by p.position`,
          [tech.path_slugs]
        )
      : [],
    rows(
      `select slug, title, topic, summary, author, published, minutes
         from articles where $1 = any(technologies)
        order by published desc nulls last`,
      [tech.slug]
    ),
    rows(
      `select slug, title, tagline, kind, minutes
         from playground_demos where $1 = any(technologies)
        order by position`,
      [tech.slug]
    ),
  ])

  return { paths, articles, demos }
}

function summariseTechnology(tech, joins) {
  return {
    slug: tech.slug,
    name: tech.name,
    category: tech.category,
    level: tech.level,
    tagline: tech.tagline,
    articleCount: joins.articles.length,
    demoCount: joins.demos.length,
    // Kept because Courses asks which subjects no course covers yet.
    pathCount: joins.paths.length,
  }
}

export async function getTechnologies() {
  const list = await rows('select * from technologies order by position')
  return Promise.all(
    list.map(async (t) => summariseTechnology(t, await technologyJoins(t)))
  )
}

export async function getTechnology(slug) {
  const tech = await one('select * from technologies where slug = $1', [slug])
  if (!tech) return null

  const joins = await technologyJoins(tech)
  const pick = async (table, slugs, cols) =>
    slugs?.length ? rows(`select ${cols} from ${table} where slug = any($1::text[])`, [slugs]) : []

  return {
    ...summariseTechnology(tech, joins),
    what: tech.what,
    why: tech.why,
    outline: tech.outline ?? [],
    facts: tech.facts ?? [],
    prerequisites: await pick('technologies', tech.prerequisites, 'slug, name, tagline'),
    related: await pick('technologies', tech.related, 'slug, name, category'),
    // Our writing on the subject, newest first.
    articles: joins.articles.map((a) => ({
      slug: a.slug,
      title: a.title,
      topic: a.topic,
      summary: a.summary,
      author: a.author,
      published: a.published ? new Date(a.published).toISOString().slice(0, 10) : null,
      minutes: Number(a.minutes),
    })),
    demos: joins.demos.map((d) => ({
      slug: d.slug,
      title: d.title,
      tagline: d.tagline,
      kind: d.kind,
      minutes: Number(d.minutes),
    })),
    // One course, as a way out to the material — not a catalogue reprinted.
    paths: joins.paths.map((r) => summarisePath(r, r.minutes, r.lesson_count)),
  }
}

/* ---------------------------------------------------------------- exams --- */

export function summariseExam(row) {
  return {
    slug: row.slug,
    family: row.family,
    title: row.title,
    summary: row.summary,
    level: row.level,
    minutes: Number(row.minutes),
    questionCount: Number(row.question_count ?? 0),
    topics: row.topics ?? [],
    technologies: row.technologies ?? [],
    passing: Number(row.passing),
  }
}

const EXAM_WITH_COUNT = `
  select e.*, count(q.id) as question_count
    from exams e left join questions q on q.exam_slug = e.slug
   group by e.slug order by e.position`

export async function getExams() {
  return (await rows(EXAM_WITH_COUNT)).map(summariseExam)
}

export const EXAM_FAMILIES = [
  { name: 'Foundations and practice', blurb: 'The vendor-neutral core every certification assumes, and the safety material most of them include.' },
  { name: 'Claude certifications', blurb: 'Preparation for the certification track aimed at people designing and building on Claude.' },
  { name: 'Retrieval and agents', blurb: 'The two system shapes certifications test hardest: what you retrieve, and what runs on its own.' },
]

export async function getExamFamilies() {
  const all = await getExams()
  return EXAM_FAMILIES.map((family) => ({
    ...family,
    exams: all.filter((exam) => exam.family === family.name),
  })).filter((family) => family.exams.length > 0)
}

export async function getExam(slug) {
  const row = await one(
    `select e.*, count(q.id) as question_count
       from exams e left join questions q on q.exam_slug = e.slug
      where e.slug = $1 group by e.slug`,
    [slug]
  )
  if (!row) return null

  const distribution = await rows(
    'select topic, count(*)::int as count from questions where exam_slug = $1 group by topic order by topic',
    [slug]
  )
  const techDetail = row.technologies?.length
    ? await rows('select slug, name from technologies where slug = any($1::text[])', [row.technologies])
    : []
  const related = await rows(
    `select p.*, coalesce(sum(l.minutes),0) as minutes, count(l.slug) as lesson_count
       from paths p left join lessons l on l.path_slug = p.slug
      where $1 = any(p.exam_slugs) group by p.slug order by p.position`,
    [slug]
  )

  return {
    ...summariseExam(row),
    rules: row.rules ?? [],
    topicDistribution: distribution,
    technologyDetail: techDetail,
    relatedPaths: related.map((r) => summarisePath(r, r.minutes, r.lesson_count)),
  }
}

export async function getExamSlugs() {
  return (await rows('select slug from exams order by position')).map((r) => r.slug)
}

/**
 * The exam a candidate is allowed to see: no `correct`, no `explanation`.
 * These columns are simply not selected, so they cannot be leaked by a
 * serialisation mistake further up.
 */
export async function getCandidateExam(slug) {
  const exam = await getExam(slug)
  if (!exam) return null

  const questions = await rows(
    'select id, type, topic, difficulty, prompt, options from questions where exam_slug = $1 order by position',
    [slug]
  )

  return { ...exam, questions }
}

/**
 * Grade a submission. The only code path that reads the answer key.
 *
 * A faithful port of the original in-process grader — same field names, same
 * thresholds, same sort order. The results page reads a stored attempt, so a
 * renamed key here is a blank results page for anyone who already has one.
 */
export async function gradeAttempt(slug, answers = {}) {
  const exam = await one('select * from exams where slug = $1', [slug])
  if (!exam) return null

  const rowsQ = await rows(
    `select id, type, topic, difficulty, prompt, options, correct, explanation
       from questions where exam_slug = $1 order by position`,
    [slug]
  )

  const questions = rowsQ.map((question) => {
    const picked = Array.isArray(answers[question.id]) ? answers[question.id].filter(Boolean) : []
    const answered = picked.length > 0
    const isCorrect = answered && sameSet(picked, question.correct)

    return {
      id: question.id,
      type: question.type,
      topic: question.topic,
      difficulty: question.difficulty,
      prompt: question.prompt,
      code: question.code ?? null,
      lang: question.lang ?? null,
      options: question.options,
      correct: question.correct,
      picked,
      answered,
      isCorrect,
      explanation: question.explanation,
    }
  })

  const total = questions.length
  const correct = questions.filter((q) => q.isCorrect).length
  const unanswered = questions.filter((q) => !q.answered).length
  const incorrect = total - correct - unanswered
  const score = total === 0 ? 0 : Math.round((correct / total) * 100)

  const byTopic = new Map()
  for (const question of questions) {
    const entry = byTopic.get(question.topic) ?? { topic: question.topic, total: 0, correct: 0 }
    entry.total += 1
    if (question.isCorrect) entry.correct += 1
    byTopic.set(question.topic, entry)
  }

  const topics = [...byTopic.values()]
    .map((entry) => ({ ...entry, percent: Math.round((entry.correct / entry.total) * 100) }))
    .sort((a, b) => b.percent - a.percent || a.topic.localeCompare(b.topic))

  const topicLinks = exam.topic_links ?? {}
  const passing = Number(exam.passing)

  return {
    examSlug: exam.slug,
    examTitle: exam.title,
    total,
    correct,
    incorrect,
    unanswered,
    score,
    passing,
    passed: score >= passing,
    topics,
    strong: topics.filter((t) => t.percent >= 80).map((t) => t.topic),
    weak: topics.filter((t) => t.percent < 60).map((t) => t.topic),
    recommendations: topics
      .filter((t) => t.percent < 80)
      .map((t) => {
        const link = topicLinks[t.topic]
        return link ? { topic: t.topic, percent: t.percent, ...link } : null
      })
      .filter(Boolean),
    questions,
  }
}

function sameSet(a, b) {
  if (a.length !== b.length) return false
  const left = [...a].sort()
  const right = [...b].sort()
  return left.every((value, i) => value === right[i])
}

/* ------------------------------------------------------------- projects --- */

function summariseProject(row) {
  return {
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    category: row.category,
    status: row.status,
    technologies: row.technologies ?? [],
    hasRepository: Boolean(row.repository),
    repository: row.repository,
    docs: row.docs,
  }
}

export async function getProjects() {
  const list = await rows(`
    select p.*,
           coalesce(dp.page_count, 0) as doc_page_count,
           coalesce(dp.groups, '{}')  as doc_groups
      from projects p
      left join (
        select set_slug,
               count(*) as page_count,
               array_agg(distinct group_title) as groups
          from doc_pages group by set_slug
      ) dp on dp.set_slug = p.docs
     order by p.position
  `)
  return list.map((r) => ({
    ...summariseProject(r),
    docPageCount: Number(r.doc_page_count),
    docGroups: r.doc_groups ?? [],
  }))
}

export async function getProject(slug) {
  const row = await one('select * from projects where slug = $1', [slug])
  if (!row) return null

  const [techDetail, exams, docSet, field] = await Promise.all([
    row.technologies?.length
      ? rows('select slug, name, category from technologies where slug = any($1::text[])', [row.technologies])
      : [],
    row.exam_slugs?.length
      ? rows(
          `select e.*, count(q.id) as question_count from exams e
             left join questions q on q.exam_slug = e.slug
            where e.slug = any($1::text[]) group by e.slug order by e.position`,
          [row.exam_slugs]
        )
      : [],
    row.docs ? getDocSet(row.docs) : null,
    row.technologies?.length
      ? rows('select * from field_entries where technologies && $1::text[] order by position limit 3', [row.technologies])
      : [],
  ])

  return {
    ...summariseProject(row),
    description: row.description,
    problem: row.problem,
    features: row.features ?? [],
    architecture: row.architecture ?? [],
    learn: row.learn ?? [],
    technologyDetail: techDetail,
    exams: exams.map(summariseExam),
    docSet,
    field: field.map(summariseFieldEntry),
  }
}

/* ----------------------------------------------------------------- docs --- */

export async function getDocSets() {
  const sets = await rows('select * from doc_sets order by position')
  return Promise.all(sets.map((s) => hydrateDocSet(s)))
}

async function hydrateDocSet(set) {
  const pages = await rows(
    'select slug, title, summary, group_title, position from doc_pages where set_slug = $1 order by position',
    [set.slug]
  )
  const groups = []
  for (const page of pages) {
    let group = groups.find((g) => g.title === page.group_title)
    if (!group) groups.push((group = { title: page.group_title, pages: [] }))
    group.pages.push({ slug: page.slug, title: page.title, summary: page.summary })
  }
  return {
    slug: set.slug,
    name: set.name,
    tagline: set.tagline,
    version: set.version,
    versionNote: set.version_note,
    repository: set.repository,
    pageCount: pages.length,
    groups,
  }
}

export async function getDocSet(slug) {
  const set = await one('select * from doc_sets where slug = $1', [slug])
  if (!set) return null
  const hydrated = await hydrateDocSet(set)
  const project = await one('select * from projects where docs = $1', [slug])
  return { ...hydrated, project: project ? summariseProject(project) : null }
}

export async function getDocPage(setSlug, pageSlug) {
  const set = await getDocSet(setSlug)
  if (!set) return null

  const flat = set.groups.flatMap((g) => g.pages.map((p) => ({ ...p, group: g.title })))
  const index = flat.findIndex((p) => p.slug === pageSlug)
  if (index === -1) return null

  const body = await one('select body from doc_pages where set_slug = $1 and slug = $2', [setSlug, pageSlug])

  return {
    set,
    page: { ...flat[index], body: body?.body ?? [] },
    previous: index > 0 ? { slug: flat[index - 1].slug, title: flat[index - 1].title } : null,
    next: index < flat.length - 1 ? { slug: flat[index + 1].slug, title: flat[index + 1].title } : null,
  }
}

export async function getAllDocParams() {
  const list = await rows('select set_slug, slug from doc_pages order by set_slug, position')
  return list.map((r) => ({ project: r.set_slug, page: r.slug.split('/') }))
}

export async function getDocSetSlugs() {
  return (await rows('select slug from doc_sets order by position')).map((r) => r.slug)
}

/* ---------------------------------------------------------------- field --- */

function summariseFieldEntry(row) {
  return {
    slug: row.slug,
    kind: row.kind,
    title: row.title,
    client: row.client,
    logo: row.logo,
    logoGround: row.logo_ground,
    logoShape: row.logo_shape,
    sector: row.sector,
    summary: row.summary,
    published: row.published ? new Date(row.published).toISOString().slice(0, 10) : null,
    minutes: Number(row.minutes),
    plate: row.plate,
    hasVideo: Boolean(row.video),
    videoReady: Boolean(row.video?.id || row.video?.src),
  }
}

export async function getFieldEntries() {
  return (await rows('select * from field_entries order by position')).map(summariseFieldEntry)
}

export async function getFieldEntry(slug) {
  const row = await one('select * from field_entries where slug = $1', [slug])
  if (!row) return null

  const techDetail = row.technologies?.length
    ? await rows('select slug, name, category from technologies where slug = any($1::text[])', [row.technologies])
    : []

  return {
    ...summariseFieldEntry(row),
    facts: row.facts ?? [],
    quote: row.quote,
    people: row.people ?? [],
    body: row.body ?? [],
    video: row.video,
    learn: row.learn ?? [],
    technologyDetail: techDetail,
  }
}

export async function getFieldSlugs() {
  return (await rows('select slug from field_entries order by position')).map((r) => r.slug)
}

/* -------------------------------------------------------------- articles --- */

function summariseArticle(row) {
  return {
    slug: row.slug,
    title: row.title,
    topic: row.topic,
    summary: row.summary,
    author: row.author,
    published: row.published ? new Date(row.published).toISOString().slice(0, 10) : null,
    minutes: Number(row.minutes),
    technologies: row.technologies ?? [],
  }
}

export async function getArticles() {
  // Newest first — an article is dated writing, not a course in a sequence.
  return (await rows('select * from articles order by published desc nulls last, position')).map(summariseArticle)
}

export async function getArticle(slug) {
  const row = await one('select * from articles where slug = $1', [slug])
  if (!row) return null

  const techDetail = row.technologies?.length
    ? await rows('select slug, name, category from technologies where slug = any($1::text[])', [row.technologies])
    : []

  return {
    ...summariseArticle(row),
    body: row.body ?? [],
    related: await resolveRelated(row.related ?? []),
    technologyDetail: techDetail,
  }
}

export async function getArticleSlugs() {
  return (await rows('select slug from articles order by position')).map((r) => r.slug)
}

/* --------------------------------------------------------------- search --- */

export async function getSearchIndex() {
  const entries = []

  const paths = await rows(`
    select p.*, coalesce(sum(l.minutes),0) as minutes, count(l.slug) as lesson_count
      from paths p left join lessons l on l.path_slug = p.slug
     group by p.slug order by p.position`)

  for (const path of paths) {
    entries.push({
      id: `path:${path.slug}`,
      type: 'Learning path',
      title: path.title,
      description: path.summary,
      href: `/learn/${path.slug}`,
      meta: `${path.lesson_count} lessons · ${path.level}`,
      keywords: [path.eyebrow, ...(path.skills ?? []), ...(path.technologies ?? [])].join(' '),
    })
  }

  const lessons = await rows(`
    select l.*, p.title as path_title from lessons l
      join paths p on p.slug = l.path_slug
     order by p.position, l.position`)

  for (const lesson of lessons) {
    entries.push({
      id: `lesson:${lesson.path_slug}:${lesson.slug}`,
      type: 'Lesson',
      title: lesson.title,
      description: lesson.summary,
      href: `/learn/${lesson.path_slug}/${lesson.slug}`,
      meta: `${lesson.path_title} · ${lesson.minutes} min`,
      keywords: [...(lesson.topics ?? []), ...(lesson.objectives ?? [])].join(' '),
    })
  }

  for (const tech of await rows('select * from technologies order by position')) {
    entries.push({
      id: `tech:${tech.slug}`,
      type: 'Technology',
      title: tech.name,
      description: tech.tagline,
      href: `/technologies/${tech.slug}`,
      meta: `${tech.category} · ${tech.level}`,
      keywords: [tech.what, ...(tech.outline ?? []).map((o) => o.title)].join(' '),
    })
  }

  for (const exam of await rows(EXAM_WITH_COUNT)) {
    entries.push({
      id: `exam:${exam.slug}`,
      type: 'Mock exam',
      title: exam.title,
      description: exam.summary,
      href: `/exams/${exam.slug}`,
      meta: `${exam.question_count} questions · ${exam.minutes} min`,
      keywords: (exam.topics ?? []).join(' '),
    })
  }

  for (const project of await rows('select * from projects order by position')) {
    entries.push({
      id: `project:${project.slug}`,
      type: 'Project',
      title: project.name,
      description: project.tagline,
      href: `/projects/${project.slug}`,
      meta: `${project.category} · ${project.status}`,
      keywords: [project.description, ...(project.technologies ?? [])].join(' '),
    })
  }

  for (const entry of await rows('select * from field_entries order by position')) {
    entries.push({
      id: `field:${entry.slug}`,
      type: 'Field',
      title: entry.title,
      description: entry.summary,
      href: `/field/${entry.slug}`,
      meta: `${entry.kind}${entry.client ? ` · ${entry.client}` : ''}`,
      keywords: [entry.kind, entry.sector, entry.client ?? ''].join(' '),
    })
  }

  for (const article of await rows('select * from articles order by published desc nulls last')) {
    entries.push({
      id: `article:${article.slug}`,
      type: 'Article',
      title: article.title,
      description: article.summary,
      href: `/articles/${article.slug}`,
      meta: `${article.topic} · ${article.minutes} min read`,
      keywords: [article.topic, ...(article.technologies ?? [])].join(' '),
    })
  }

  for (const demo of await rows('select * from playground_demos order by position')) {
    entries.push({
      id: `playground:${demo.slug}`,
      type: 'Playground',
      title: demo.title,
      description: demo.tagline,
      href: `/playground/${demo.slug}`,
      meta: `${demo.kind} · ${demo.minutes} min`,
      keywords: [demo.summary, ...(demo.technologies ?? [])].join(' '),
    })
  }

  const docPages = await rows(`
    select p.*, d.name as set_name from doc_pages p
      join doc_sets d on d.slug = p.set_slug
     order by d.position, p.position`)

  for (const page of docPages) {
    entries.push({
      id: `doc:${page.set_slug}:${page.slug}`,
      type: 'Documentation',
      title: page.title,
      description: page.summary,
      href: `/projects/${page.set_slug}/${page.slug}`,
      meta: `${page.set_name} · ${page.group_title}`,
      keywords: `${page.set_name} ${page.group_title}`,
    })
  }

  return entries
}

/* ------------------------------------------------------- dashboard data --- */

export async function getProgressCatalogue() {
  const paths = await rows('select * from paths order by position')
  return Promise.all(
    paths.map(async (p) => {
      const lessons = await rows(
        'select slug, title, minutes, module from lessons where path_slug = $1 order by position',
        [p.slug]
      )
      const minutes = lessons.reduce((t, l) => t + Number(l.minutes), 0)
      return {
        slug: p.slug,
        title: p.title,
        certification: p.certification,
        plate: p.plate ?? 'aperture-glow',
        eyebrow: p.eyebrow,
        level: p.level,
        minutes,
        lessons: lessons.map((l) => ({ ...l, minutes: Number(l.minutes) })),
      }
    })
  )
}

export async function getExamCatalogue() {
  const list = await rows(EXAM_WITH_COUNT)
  return list.map((e) => ({
    slug: e.slug,
    title: e.title,
    minutes: Number(e.minutes),
    questionCount: Number(e.question_count),
    passing: Number(e.passing),
  }))
}

export async function resolveLessonRefs(refs) {
  const out = []
  for (const { path: pathSlug, lesson: lessonSlug } of refs ?? []) {
    const row = await one(
      `select l.slug, l.title, l.minutes, p.slug as path_slug, p.title as path_title
         from lessons l join paths p on p.slug = l.path_slug
        where l.path_slug = $1 and l.slug = $2`,
      [pathSlug, lessonSlug]
    )
    if (row) {
      out.push({
        pathSlug: row.path_slug,
        pathTitle: row.path_title,
        slug: row.slug,
        title: row.title,
        minutes: Number(row.minutes),
        href: `/learn/${row.path_slug}/${row.slug}`,
      })
    }
  }
  return out
}
