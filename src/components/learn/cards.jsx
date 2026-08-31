import Link from 'next/link'
import Chevron, { ArrowRight } from '@/components/void/Icons'
import { Badge, Difficulty } from '@/components/learn/ui'
import { formatCount, formatMinutes, padIndex } from '@/lib/format'

/**
 * Content cards and rows, shared by the home page and every index page.
 *
 * Grids are used where items are peers to be compared; the dense index (§6) is
 * used where items are scanned in order for one match. Nothing here invents a
 * new container shape.
 */

export function PathCard({ path, index }) {
  return (
    <li className="lift stretch" data-r style={index != null ? { '--rd': `${index * 65}ms` } : undefined}>
      <div className="card-top">
        <p className="mono">{path.eyebrow}</p>
        <Difficulty level={path.level} />
      </div>

      <h3 className="d3">
        <Link href={`/learn/${path.slug}`} className="stretch-l">
          {path.title}
        </Link>
      </h3>

      <p className="body trunc-3">{path.summary}</p>

      <ul className="tags" role="list">
        {path.skills.slice(0, 4).map((skill) => (
          <li key={skill}>{skill}</li>
        ))}
      </ul>

      <div className="card-foot">
        <span className="mono tnum">
          {formatCount(path.lessonCount, 'lesson')} · {formatMinutes(path.minutes)}
        </span>
        <span className="link">
          Open path <Chevron />
        </span>
      </div>
    </li>
  )
}

export function ExamRow({ exam, index }) {
  return (
    <li data-r style={{ '--rd': `${index * 65}ms` }}>
      <Link href={`/exams/${exam.slug}`} className="index-row">
        <span className="index-n">{padIndex(index + 1)}</span>
        <span className="index-b">
          <span className="h4" style={{ display: 'block' }}>
            {exam.title}
          </span>
          <span className="body trunc-2" style={{ display: 'block' }}>
            {exam.summary}
          </span>
        </span>
        <span className="index-m">
          <Difficulty level={exam.level} />
          <span className="mono tnum">
            {formatCount(exam.questionCount, 'question')} · {exam.minutes} min
          </span>
        </span>
      </Link>
    </li>
  )
}

export function TechCell({ tech, index }) {
  return (
    <li className="lift stretch" data-r style={{ '--rd': `${Math.min(index, 5) * 55}ms` }}>
      <div className="card-top">
        <p className="mono">{tech.category}</p>
        {/* How much we have written on it is the question a browser is
            actually asking, so answer it on the card. */}
        <span className="mono tnum">{tech.articleCount || '—'}</span>
      </div>
      <h3 className="h4">
        <Link href={`/technologies/${tech.slug}`} className="stretch-l">
          {tech.name}
        </Link>
      </h3>
      <p className="body trunc-2">{tech.tagline}</p>
    </li>
  )
}

export function ProjectCard({ project, index }) {
  return (
    <li className="lift stretch" data-r style={{ '--rd': `${index * 65}ms` }}>
      <div className="card-top">
        <p className="mono">{project.category}</p>
        <Badge quiet={project.status !== 'In development'} pip={project.status === 'In development'}>
          {project.status}
        </Badge>
      </div>

      <h3 className="d3">
        <Link href={`/projects/${project.slug}`} className="stretch-l">
          {project.name}
        </Link>
      </h3>

      <p className="body trunc-3">{project.tagline}</p>

      <div className="card-foot">
        <span className="mono">{project.technologies.join(' · ')}</span>
        {/* Source and documentation are facts about the project, so they belong
            on the project's own card rather than in a parallel section. */}
        <span className="mono tnum">
          {project.docPageCount > 0 ? `${formatCount(project.docPageCount, 'doc page')}` : 'Repository only'}
        </span>
      </div>
    </li>
  )
}

export function DocRow({ set, index }) {
  const first = set.groups[0]?.pages[0]
  const href = first ? `/projects/${set.slug}/${first.slug}` : `/projects/${set.slug}`

  return (
    <li data-r style={{ '--rd': `${index * 65}ms` }}>
      <Link href={href} className="index-row">
        <span className="index-n">{padIndex(index + 1)}</span>
        <span className="index-b">
          <span className="h4" style={{ display: 'block' }}>
            {set.name}
          </span>
          <span className="body trunc-2" style={{ display: 'block' }}>
            {set.tagline}
          </span>
        </span>
        <span className="index-m">
          <span className="mono">{set.version}</span>
          <span className="mono tnum">{formatCount(set.pageCount, 'page')}</span>
        </span>
      </Link>
    </li>
  )
}

export function LessonRow({ lesson, pathSlug, index, done = false, current = false }) {
  return (
    <li>
      <Link href={`/learn/${pathSlug}/${lesson.slug}`} className="index-row">
        <span className="index-n">{padIndex(index + 1)}</span>
        <span className="index-b">
          <span className="h4" style={{ display: 'block' }}>
            {lesson.title}
          </span>
          <span className="body trunc-2" style={{ display: 'block' }}>
            {lesson.summary}
          </span>
        </span>
        <span className="index-m">
          {current && <Badge solid>Continue</Badge>}
          {done && !current && <Badge>Completed</Badge>}
          <span className="mono tnum">{formatMinutes(lesson.minutes)}</span>
        </span>
      </Link>
    </li>
  )
}

export function NextStep({ href, label, title }) {
  return (
    <Link href={href} className="panel panel-sm stretch lift-panel">
      <p className="mono">{label}</p>
      <p className="h4" style={{ marginTop: 8 }}>
        {title}
      </p>
      <span className="link" style={{ marginTop: 12 }}>
        Open <ArrowRight size={14} />
      </span>
    </Link>
  )
}
