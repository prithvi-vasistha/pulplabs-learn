/**
 * The content API.
 *
 * Every accessor is async even though the data is currently static modules.
 * That is deliberate: when this is backed by an HTTP API or a CMS, the call
 * sites — all of them server components — do not change.
 *
 * Nothing in here reaches for the network, so pages stay statically renderable.
 */

import { technologies, technologyBySlug, CATEGORIES } from '@/data/technologies'
import { paths, pathBySlug, orderedLessons, pathMinutes, DISCLOSURE } from '@/data/paths'
import { exams, examBySlug } from '@/data/exams'
import { projects, projectBySlug, CATALOGUE_NOTE } from '@/data/projects'
import { fieldEntries, fieldBySlug, FIELD_NOTE, KINDS } from '@/data/field'
import { openlcmDocs } from '@/data/docs/openlcm'
import { wheatearDocs } from '@/data/docs/wheatear'

const docSets = [openlcmDocs, wheatearDocs]
const docBySlug = Object.fromEntries(docSets.map((d) => [d.slug, d]))

export const disclosure = DISCLOSURE

/* ---------------------------------------------------------------- paths --- */

export async function getPaths() {
  return paths.map(summarisePath)
}

export function summarisePath(path) {
  return {
    slug: path.slug,
    title: path.title,
    certification: path.certification ?? null,
    plate: path.plate ?? 'aperture-glow',
    eyebrow: path.eyebrow,
    summary: path.summary,
    level: path.level,
    span: path.span,
    minutes: pathMinutes(path),
    lessonCount: path.lessons.length,
    moduleCount: path.modules.length,
    technologies: path.technologies,
    skills: path.skills,
    exams: path.exams,
    projects: path.projects,
  }
}

export async function getPath(slug) {
  const path = pathBySlug[slug]
  if (!path) return null

  const ordered = orderedLessons(path)

  return {
    ...summarisePath(path),
    audience: path.audience,
    prerequisites: path.prerequisites,
    outcomes: path.outcomes,
    covers: path.covers ?? [],
    modules: path.modules.map((module) => ({
      title: module.title,
      lessons: module.lessons
        .map((lessonSlug) => ordered.find((l) => l.slug === lessonSlug))
        .filter(Boolean)
        .map(toLessonSummary),
    })),
    lessons: ordered.map(toLessonSummary),
  }
}

function toLessonSummary(lesson) {
  return {
    slug: lesson.slug,
    title: lesson.title,
    summary: lesson.summary,
    minutes: lesson.minutes,
    topics: lesson.topics,
    module: lesson.module ?? null,
  }
}

/** A lesson with everything the reader needs: body, neighbours, and its path. */
export async function getLesson(pathSlug, lessonSlug) {
  const path = pathBySlug[pathSlug]
  if (!path) return null

  const ordered = orderedLessons(path)
  const index = ordered.findIndex((l) => l.slug === lessonSlug)
  if (index === -1) return null

  const lesson = ordered[index]

  return {
    path: summarisePath(path),
    lessons: ordered.map(toLessonSummary),
    modules: path.modules.map((module) => ({
      title: module.title,
      lessons: module.lessons
        .map((slug) => ordered.find((l) => l.slug === slug))
        .filter(Boolean)
        .map(toLessonSummary),
    })),
    lesson: {
      ...toLessonSummary(lesson),
      objectives: lesson.objectives,
      body: lesson.body,
      exercise: lesson.exercise ?? null,
      related: (lesson.related ?? []).map(resolveRelated).filter(Boolean),
    },
    position: index + 1,
    total: ordered.length,
    previous: index > 0 ? toLessonSummary(ordered[index - 1]) : null,
    next: index < ordered.length - 1 ? toLessonSummary(ordered[index + 1]) : null,
  }
}

function resolveRelated(entry) {
  if (entry.type === 'lesson') {
    const path = pathBySlug[entry.path]
    const lesson = path?.lessons.find((l) => l.slug === entry.lesson)
    if (!lesson) return null
    return { kind: 'Lesson', label: lesson.title, href: `/learn/${path.slug}/${lesson.slug}` }
  }
  if (entry.type === 'exam') {
    const exam = examBySlug[entry.ref]
    if (!exam) return null
    return { kind: 'Mock exam', label: exam.title, href: `/exams/${exam.slug}` }
  }
  if (entry.type === 'tech') {
    const tech = technologyBySlug[entry.ref]
    if (!tech) return null
    return { kind: 'Technology', label: tech.name, href: `/technologies/${tech.slug}` }
  }
  if (entry.type === 'project') {
    const project = projectBySlug[entry.ref]
    if (!project) return null
    return { kind: 'Project', label: project.name, href: `/projects/${project.slug}` }
  }
  return null
}

export async function getAllLessonParams() {
  return paths.flatMap((path) => path.lessons.map((lesson) => ({ path: path.slug, lesson: lesson.slug })))
}

/* --------------------------------------------------------- technologies --- */

export async function getTechnologies() {
  return technologies.map(summariseTechnology)
}

export const technologyCategories = CATEGORIES

/**
 * Every content type that mentions a technology, counted once. This is what
 * makes a technology page the "everything about X" hub rather than a subject
 * blurb: the joins already existed in the data, they were just never surfaced.
 */
function technologyJoins(tech) {
  const techPaths = tech.paths.map((s) => pathBySlug[s]).filter(Boolean)
  const techExams = tech.exams.map((s) => examBySlug[s]).filter(Boolean)
  const techProjects = tech.projects.map((s) => projectBySlug[s]).filter(Boolean)

  // Documentation is reached through the project that owns it, and field
  // entries declare their own technologies — both are reverse lookups.
  const sets = techProjects.map((p) => (p.docs ? docBySlug[p.docs] : null)).filter(Boolean)
  const field = fieldEntries.filter((entry) => (entry.technologies ?? []).includes(tech.slug))

  const lessons = techPaths.flatMap((path) =>
    orderedLessons(path)
      .filter((lesson) => (lesson.topics ?? []).some((t) => matchesTechnology(t, tech)))
      .map((lesson) => ({ ...toLessonSummary(lesson), pathSlug: path.slug, pathTitle: path.title }))
  )

  return { paths: techPaths, exams: techExams, projects: techProjects, docSets: sets, field, lessons }
}

/** Loose match between a lesson topic string and a technology. */
function matchesTechnology(topic, tech) {
  const t = topic.toLowerCase()
  return t.includes(tech.name.toLowerCase()) || t.includes(tech.slug.replace(/-/g, ' '))
}

function summariseTechnology(tech) {
  const joins = technologyJoins(tech)
  return {
    slug: tech.slug,
    name: tech.name,
    category: tech.category,
    level: tech.level,
    tagline: tech.tagline,
    pathCount: joins.paths.length,
    examCount: joins.exams.length,
    lessonCount: joins.lessons.length,
    projectCount: joins.projects.length,
    docCount: joins.docSets.length,
    fieldCount: joins.field.length,
    /** Total pieces of material that mention this subject, across every type. */
    materialCount:
      joins.paths.length +
      joins.lessons.length +
      joins.exams.length +
      joins.projects.length +
      joins.docSets.length +
      joins.field.length,
  }
}

export async function getTechnology(slug) {
  const tech = technologyBySlug[slug]
  if (!tech) return null

  const joins = technologyJoins(tech)

  return {
    ...summariseTechnology(tech),
    what: tech.what,
    why: tech.why,
    outline: tech.outline,
    facts: tech.facts,
    prerequisites: tech.prerequisites.map((s) => pick(technologyBySlug[s], ['slug', 'name', 'tagline'])).filter(Boolean),
    related: tech.related.map((s) => pick(technologyBySlug[s], ['slug', 'name', 'category'])).filter(Boolean),
    paths: joins.paths.map(summarisePath),
    exams: joins.exams.map(summariseExam),
    projects: joins.projects.map(summariseProject),
    lessons: joins.lessons,
    docSets: joins.docSets.map((set) => {
      const owner = projects.find((p) => p.docs === set.slug)
      return {
        slug: set.slug,
        name: set.name,
        version: set.version,
        tagline: set.tagline,
        projectSlug: owner?.slug ?? set.slug,
        pageCount: set.groups.reduce((total, group) => total + group.pages.length, 0),
      }
    }),
    field: joins.field.map(summariseFieldEntry),
  }
}

function pick(source, keys) {
  if (!source) return null
  return Object.fromEntries(keys.map((k) => [k, source[k]]))
}

/* ---------------------------------------------------------------- exams --- */

/** Display order for the families. Easiest entry point first. */
export const EXAM_FAMILIES = [
  {
    name: 'Foundations and practice',
    blurb: 'The vendor-neutral core every certification assumes, and the safety material most of them include.',
  },
  {
    name: 'Claude certifications',
    blurb: 'Preparation for the certification track aimed at people designing and building on Claude.',
  },
  {
    name: 'Retrieval and agents',
    blurb: 'The two system shapes certifications test hardest: what you retrieve, and what runs on its own.',
  },
]

/** Exams grouped for the catalogue, in the order above. Empty groups drop out. */
export async function getExamFamilies() {
  const all = exams.map(summariseExam)
  return EXAM_FAMILIES.map((family) => ({
    ...family,
    exams: all.filter((exam) => exam.family === family.name),
  })).filter((family) => family.exams.length > 0)
}

export function summariseExam(exam) {
  return {
    slug: exam.slug,
    family: exam.family ?? 'Foundations and practice',
    title: exam.title,
    summary: exam.summary,
    level: exam.level,
    minutes: exam.minutes,
    questionCount: exam.questions.length,
    topics: exam.topics,
    technologies: exam.technologies,
    passing: exam.passing,
  }
}

export async function getExams() {
  return exams.map(summariseExam)
}

/** Overview data. Still no questions — the overview page does not need them. */
export async function getExam(slug) {
  const exam = examBySlug[slug]
  if (!exam) return null

  const distribution = {}
  for (const question of exam.questions) {
    distribution[question.topic] = (distribution[question.topic] ?? 0) + 1
  }

  return {
    ...summariseExam(exam),
    rules: exam.rules,
    topicDistribution: Object.entries(distribution).map(([topic, count]) => ({ topic, count })),
    technologyDetail: exam.technologies.map((s) => pick(technologyBySlug[s], ['slug', 'name'])).filter(Boolean),
    relatedPaths: paths.filter((p) => p.exams.includes(slug)).map(summarisePath),
  }
}

export async function getExamSlugs() {
  return exams.map((e) => e.slug)
}

/* ------------------------------------------------------------- projects --- */

export const catalogueNote = CATALOGUE_NOTE

function summariseProject(project) {
  return {
    slug: project.slug,
    name: project.name,
    tagline: project.tagline,
    category: project.category,
    status: project.status,
    technologies: project.technologies,
    hasRepository: Boolean(project.repository),
    repository: project.repository,
    docs: project.docs,
  }
}

export async function getProjects() {
  return projects.map((project) => {
    const set = project.docs ? docBySlug[project.docs] : null
    return {
      ...summariseProject(project),
      docPageCount: set ? set.groups.reduce((total, group) => total + group.pages.length, 0) : 0,
      docGroups: set ? set.groups.map((g) => g.title) : [],
    }
  })
}

export async function getProject(slug) {
  const project = projectBySlug[slug]
  if (!project) return null

  return {
    ...summariseProject(project),
    description: project.description,
    problem: project.problem,
    features: project.features,
    architecture: project.architecture,
    learn: project.learn,
    technologyDetail: project.technologies
      .map((s) => pick(technologyBySlug[s], ['slug', 'name', 'category']))
      .filter(Boolean),
    exams: project.exams.map((s) => examBySlug[s]).filter(Boolean).map(summariseExam),
    /** The full documentation table of contents, so the project page and its
        docs are one destination rather than two parallel trees. */
    docSet: project.docs ? summariseDocSet(docBySlug[project.docs]) : null,
    field: fieldEntries
      .filter((entry) => (entry.technologies ?? []).some((t) => project.technologies.includes(t)))
      .slice(0, 3)
      .map(summariseFieldEntry),
  }
}

/* ----------------------------------------------------------------- docs --- */

function summariseDocSet(set) {
  return {
    slug: set.slug,
    name: set.name,
    tagline: set.tagline,
    version: set.version,
    versionNote: set.versionNote,
    repository: set.repository ?? null,
    pageCount: set.groups.reduce((total, group) => total + group.pages.length, 0),
    groups: set.groups.map((group) => ({
      title: group.title,
      pages: group.pages.map((page) => ({ slug: page.slug, title: page.title, summary: page.summary })),
    })),
  }
}

export async function getDocSets() {
  return docSets.map(summariseDocSet)
}

export async function getDocSet(slug) {
  const set = docBySlug[slug]
  if (!set) return null
  const project = projects.find((p) => p.docs === slug)
  return { ...summariseDocSet(set), project: project ? summariseProject(project) : null }
}

function flattenDocPages(set) {
  return set.groups.flatMap((group) => group.pages.map((page) => ({ ...page, group: group.title })))
}

export async function getDocPage(setSlug, pageSlug) {
  const set = docBySlug[setSlug]
  if (!set) return null

  const flat = flattenDocPages(set)
  const index = flat.findIndex((p) => p.slug === pageSlug)
  if (index === -1) return null

  const summary = await getDocSet(setSlug)

  return {
    set: summary,
    page: flat[index],
    previous: index > 0 ? { slug: flat[index - 1].slug, title: flat[index - 1].title } : null,
    next: index < flat.length - 1 ? { slug: flat[index + 1].slug, title: flat[index + 1].title } : null,
  }
}

export async function getAllDocParams() {
  return docSets.flatMap((set) => flattenDocPages(set).map((page) => ({ project: set.slug, page: page.slug.split('/') })))
}

export async function getDocSetSlugs() {
  return docSets.map((s) => s.slug)
}

/* ---------------------------------------------------------------- field --- */

export const fieldNote = FIELD_NOTE
export const fieldKinds = KINDS

function summariseFieldEntry(entry) {
  return {
    slug: entry.slug,
    kind: entry.kind,
    title: entry.title,
    client: entry.client ?? null,
    logo: entry.logo ?? null,
    sector: entry.sector,
    summary: entry.summary,
    published: entry.published ?? null,
    minutes: entry.minutes,
    plate: entry.plate,
    hasVideo: Boolean(entry.video),
    videoReady: Boolean(entry.video?.id || entry.video?.src),
  }
}

export async function getFieldEntries() {
  return fieldEntries.map(summariseFieldEntry)
}

export async function getFieldEntry(slug) {
  const entry = fieldBySlug[slug]
  if (!entry) return null

  return {
    ...summariseFieldEntry(entry),
    facts: entry.facts ?? [],
    quote: entry.quote ?? null,
    people: entry.people ?? [],
    body: entry.body,
    video: entry.video ?? null,
    learn: entry.learn ?? [],
    technologyDetail: (entry.technologies ?? [])
      .map((t) => pick(technologyBySlug[t], ['slug', 'name', 'category']))
      .filter(Boolean),
  }
}

export async function getFieldSlugs() {
  return fieldEntries.map((e) => e.slug)
}

/* --------------------------------------------------------------- search --- */

/**
 * One index across every content type. Built from the same entities the pages
 * render, so search can never drift from what exists.
 */
export async function getSearchIndex() {
  const entries = []

  for (const path of paths) {
    entries.push({
      id: `path:${path.slug}`,
      type: 'Learning path',
      title: path.title,
      description: path.summary,
      href: `/learn/${path.slug}`,
      meta: `${path.lessons.length} lessons · ${path.level}`,
      keywords: [path.eyebrow, ...path.skills, ...path.technologies].join(' '),
    })

    for (const lesson of orderedLessons(path)) {
      entries.push({
        id: `lesson:${path.slug}:${lesson.slug}`,
        type: 'Lesson',
        title: lesson.title,
        description: lesson.summary,
        href: `/learn/${path.slug}/${lesson.slug}`,
        meta: `${path.title} · ${lesson.minutes} min`,
        keywords: [...lesson.topics, ...(lesson.objectives ?? [])].join(' '),
      })
    }
  }

  for (const tech of technologies) {
    entries.push({
      id: `tech:${tech.slug}`,
      type: 'Technology',
      title: tech.name,
      description: tech.tagline,
      href: `/technologies/${tech.slug}`,
      meta: `${tech.category} · ${tech.level}`,
      keywords: [tech.what, ...tech.outline.map((o) => o.title)].join(' '),
    })
  }

  for (const exam of exams) {
    entries.push({
      id: `exam:${exam.slug}`,
      type: 'Mock exam',
      title: exam.title,
      description: exam.summary,
      href: `/exams/${exam.slug}`,
      meta: `${exam.questions.length} questions · ${exam.minutes} min`,
      keywords: exam.topics.join(' '),
    })
  }

  for (const project of projects) {
    entries.push({
      id: `project:${project.slug}`,
      type: 'Project',
      title: project.name,
      description: project.tagline,
      href: `/projects/${project.slug}`,
      meta: `${project.category} · ${project.status}`,
      keywords: [project.description, ...project.technologies].join(' '),
    })
  }

  for (const entry of fieldEntries) {
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

  for (const set of docSets) {
    for (const page of flattenDocPages(set)) {
      entries.push({
        id: `doc:${set.slug}:${page.slug}`,
        type: 'Documentation',
        title: page.title,
        description: page.summary,
        href: `/projects/${set.slug}/${page.slug}`,
        meta: `${set.name} · ${page.group}`,
        keywords: `${set.name} ${page.group}`,
      })
    }
  }

  return entries
}

/* -------------------------------------------------------- home + lookup --- */

/** Resolve arbitrary content references (used by the dashboard). */
export async function resolveLessonRefs(refs) {
  return refs
    .map(({ path: pathSlug, lesson: lessonSlug }) => {
      const path = pathBySlug[pathSlug]
      const lesson = path?.lessons.find((l) => l.slug === lessonSlug)
      if (!path || !lesson) return null
      return {
        pathSlug: path.slug,
        pathTitle: path.title,
        slug: lesson.slug,
        title: lesson.title,
        minutes: lesson.minutes,
        href: `/learn/${path.slug}/${lesson.slug}`,
      }
    })
    .filter(Boolean)
}

/** Everything the dashboard needs to interpret stored progress, in one call. */
export async function getProgressCatalogue() {
  return paths.map((path) => ({
    slug: path.slug,
    title: path.title,
    certification: path.certification ?? null,
    plate: path.plate ?? 'aperture-glow',
    eyebrow: path.eyebrow,
    level: path.level,
    minutes: pathMinutes(path),
    lessons: orderedLessons(path).map((lesson) => ({
      slug: lesson.slug,
      title: lesson.title,
      minutes: lesson.minutes,
      module: lesson.module,
    })),
  }))
}

export async function getExamCatalogue() {
  return exams.map((exam) => ({
    slug: exam.slug,
    title: exam.title,
    minutes: exam.minutes,
    questionCount: exam.questions.length,
    passing: exam.passing,
  }))
}
