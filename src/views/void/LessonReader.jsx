import AppShell from '@/components/void/AppShell'
import Link from 'next/link'
import Chevron, { ChevronLeft, ChevronDown, Clock } from '@/components/void/Icons'
import Prose from '@/components/learn/Prose'
import { renderInline } from '@/components/learn/inline'
import Toc from '@/components/learn/Toc'
import { LessonComplete, LessonOutline, LessonVisit } from '@/components/learn/LessonProgress'
import SaveToggle from '@/components/learn/SaveToggle'
import { Crumbs, MetaRow } from '@/components/learn/ui'
import { formatMinutes } from '@/lib/format'
import { tableOfContents } from '@/lib/toc'

export default function LessonReader({ data }) {
  const { path, lesson, lessons, modules, position, total, previous, next } = data
  const headings = tableOfContents(lesson.body)

  return (
    <AppShell wide>
      <LessonVisit pathSlug={path.slug} lessonSlug={lesson.slug} />

      <div className="shell-wide reader">
          <aside className="reader-side" aria-label="Path contents">
            <LessonOutline
              pathSlug={path.slug}
              pathTitle={path.title}
              modules={modules}
              lessons={lessons}
              currentSlug={lesson.slug}
            />
          </aside>

          <article className="reader-main">
            <Crumbs
              items={[
                { label: 'Learn', href: '/learn' },
                { label: path.title, href: `/learn/${path.slug}` },
                { label: lesson.title },
              ]}
            />

            <header className="lesson-head">
              <p className="mono" style={{ marginTop: 20 }}>
                {lesson.module ? `${lesson.module} · ` : ''}Lesson {position} of {total}
              </p>

              <h1 className="d2">{lesson.title}</h1>
              <p className="lede">{lesson.summary}</p>

              <div className="lesson-head-foot">
                <MetaRow
                  items={[
                    <span key="time" className="tnum" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <Clock /> {formatMinutes(lesson.minutes)}
                    </span>,
                    ...lesson.topics.map((topic) => <span key={topic}>{topic}</span>),
                  ]}
                />

                <SaveToggle
                  item={{
                    href: `/learn/${path.slug}/${lesson.slug}`,
                    label: lesson.title,
                    type: 'Lesson',
                  }}
                />
              </div>
            </header>

            <details className="outline-mob">
              <summary>
                Path contents
                <ChevronDown />
              </summary>
              <div className="outline-mob-in">
                <LessonOutline
                  pathSlug={path.slug}
                  pathTitle={path.title}
                  modules={modules}
                  lessons={lessons}
                  currentSlug={lesson.slug}
                />
              </div>
            </details>

            {lesson.objectives?.length > 0 && (
              <section className="objectives" aria-labelledby="objectives-h">
                <p className="mono" id="objectives-h">
                  After this lesson you can
                </p>
                <ul role="list">
                  {lesson.objectives.map((objective, i) => (
                    <li key={objective}>
                      <span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <Prose blocks={lesson.body} />

            {lesson.exercise && (
              <section className="exercise" aria-labelledby="exercise-h">
                <div className="exercise-h">
                  <p className="mono" id="exercise-h">
                    Practice
                  </p>
                  <p className="body" style={{ maxWidth: '62ch' }}>
                    {renderInline(lesson.exercise.prompt)}
                  </p>
                </div>
                <details>
                  <summary>
                    Show the approach
                    <ChevronDown />
                  </summary>
                  <div className="exercise-a">
                    <p className="body" style={{ maxWidth: '62ch' }}>
                      {renderInline(lesson.exercise.approach)}
                    </p>
                  </div>
                </details>
              </section>
            )}

            {lesson.related?.length > 0 && (
              <section style={{ marginTop: 'clamp(40px, 5vw, 60px)' }} aria-labelledby="related-h">
                <p className="mono" id="related-h">
                  Related
                </p>
                <ul className="related-list" role="list">
                  {lesson.related.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href}>
                        <span>
                          <span className="mono" style={{ display: 'block', marginBottom: 4 }}>
                            {item.kind}
                          </span>
                          <span className="h4">{item.label}</span>
                        </span>
                        <Chevron />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <LessonComplete pathSlug={path.slug} lessonSlug={lesson.slug} next={next} />

            <nav className="pager" aria-label="Lesson navigation">
              {previous ? (
                <Link href={`/learn/${path.slug}/${previous.slug}`} className="pg-prev">
                  <span className="mono">
                    <ChevronLeft /> Previous
                  </span>
                  <span className="h4">{previous.title}</span>
                </Link>
              ) : (
                <div className="pg-prev">
                  <span className="mono">Start of path</span>
                  <span className="h4 dim">{path.title}</span>
                </div>
              )}

              {next ? (
                <Link href={`/learn/${path.slug}/${next.slug}`} className="pg-next">
                  <span className="mono">
                    Next <Chevron />
                  </span>
                  <span className="h4">{next.title}</span>
                </Link>
              ) : (
                <Link href={`/learn/${path.slug}`} className="pg-next">
                  <span className="mono">
                    End of path <Chevron />
                  </span>
                  <span className="h4">Back to {path.title}</span>
                </Link>
              )}
            </nav>
          </article>

        <div className="reader-toc">
          <Toc headings={headings} />
        </div>
      </div>
    </AppShell>
  )
}
