import Link from 'next/link'
import Cover from '@/components/void/Cover'
import { Difficulty } from '@/components/learn/ui'
import { formatCount, formatMinutes } from '@/lib/format'

/**
 * The catalogue card.
 *
 * Cover art, audience line, title, one sentence, and the two facts that decide
 * whether someone starts: how long it is and how hard it is. Everything else
 * belongs on the course page.
 */
export default function CourseCard({
  href,
  seed,
  eyebrow,
  audience,
  title,
  summary,
  meta,
  level,
  index = 0,
  children,
}) {
  return (
    <li className="cc" data-r style={{ '--rd': `${Math.min(index, 6) * 60}ms` }}>
      <Cover seed={seed} className="cc-cv" />

      <div className="cc-in">
        {audience && <p className="cc-aud mono">{audience}</p>}
        {eyebrow && !audience && <p className="mono">{eyebrow}</p>}

        <h3 className="cc-t">
          <Link href={href} className="stretch-l">
            {title}
          </Link>
        </h3>

        {summary && <p className="body trunc-3">{summary}</p>}

        {children}

        <div className="cc-foot">
          <span className="mono tnum">{meta}</span>
          {level && <Difficulty level={level} />}
        </div>
      </div>
    </li>
  )
}

/** A track, as a catalogue card. */
export function PathCourseCard({ path, index }) {
  return (
    <CourseCard
      href={`/learn/${path.slug}`}
      seed={path.slug}
      audience={AUDIENCE[path.level] ?? path.eyebrow}
      title={path.title}
      summary={path.summary}
      meta={`${formatCount(path.lessonCount, 'lesson')} · ${formatMinutes(path.minutes)}`}
      level={path.level}
      index={index}
    />
  )
}

/**
 * What the card says above the title.
 *
 * This used to be "Great for people new to the AI stack" — which is how a
 * course marketplace sells a course. PulpLabs is a consultancy; this material
 * exists because teams we work with need it. So the line states what the
 * reader is assumed to know, and lets them decide.
 */
export const AUDIENCE = {
  Beginner: 'Assumes no prior AI work',
  Intermediate: 'Assumes you have shipped something',
  Advanced: 'Assumes you are designing the system',
}
