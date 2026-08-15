import AppShell from '@/components/void/AppShell'
import Link from 'next/link'
import NextPage from '@/components/void/NextPage'
import Chevron from '@/components/void/Icons'
import { ExamStart } from '@/components/learn/ExamProgress'
import { Crumbs, Difficulty, MetaRow } from '@/components/learn/ui'
import { formatCount, padIndex } from '@/lib/format'

export default function ExamDetail({ exam }) {
  return (
    <AppShell>
        <section className="phead grid-bg">
          <div className="phead-light" aria-hidden="true">
            <img src="/void/aperture-glow.webp" alt="" fetchPriority="high" decoding="async" />
          </div>

          <div className="shell-wide phead-in">
            <Crumbs items={[{ label: 'Mock exams', href: '/exams' }, { label: exam.title }]} />

            <h1 className="d1 phead-h" style={{ marginTop: 18 }}>
              {exam.title}
            </h1>

            <p className="lede phead-l">{exam.summary}</p>

            <div className="phead-meta">
              <MetaRow
                items={[
                  <Difficulty key="level" level={exam.level} />,
                  <span key="q" className="tnum">
                    {formatCount(exam.questionCount, 'question')}
                  </span>,
                  <span key="t" className="tnum">
                    {exam.minutes} minutes
                  </span>,
                  <span key="p" className="tnum">
                    Pass mark {exam.passing}%
                  </span>,
                ]}
              />
            </div>
          </div>
        </section>

        <section className="sec-sm">
          <div className="shell-wide split">
            <div>
              <header className="sec-h" data-r>
                <p className="mono">What it covers</p>
                <h2 className="d2">
                  Topics, <span className="dim">and how many questions each gets.</span>
                </h2>
              </header>

              <div className="tbl-wrap" data-r>
                <table className="tbl">
                  <thead>
                    <tr>
                      <th scope="col">Topic</th>
                      <th scope="col" style={{ width: 140, textAlign: 'right' }}>
                        Questions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {exam.topicDistribution.map((entry) => (
                      <tr key={entry.topic}>
                        <td>{entry.topic}</td>
                        <td className="tnum" style={{ textAlign: 'right' }}>
                          {entry.count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <section style={{ marginTop: 'clamp(44px, 5vw, 68px)' }} aria-labelledby="rules-h">
                <header className="sec-h" data-r>
                  <p className="mono" id="rules-h">
                    Rules
                  </p>
                  <h2 className="d2">Before you start.</h2>
                </header>

                <ul className="index" role="list" data-r>
                  {exam.rules.map((rule, i) => (
                    <li key={rule}>
                      <div className="index-row">
                        <span className="index-n">{padIndex(i + 1)}</span>
                        <span className="index-b">
                          <span className="body">{rule}</span>
                        </span>
                        <span className="index-m" />
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              <div className="callout" data-r style={{ marginTop: 'clamp(32px, 4vw, 44px)' }}>
                <p className="mono">Note</p>
                <p className="h4">Nothing is uploaded</p>
                <p className="body">
                  Grading runs on the server, but the attempt itself — your answers and the result — is kept in
                  this browser. There is no account, and clearing site data clears your history.
                </p>
              </div>
            </div>

            <aside className="rail" aria-label="Start the exam">
              <ExamStart exam={exam} />

              {exam.relatedPaths.length > 0 && (
                <div>
                  <p className="mono" style={{ marginBottom: 12 }}>
                    Learn this material
                  </p>
                  <ul className="rail-list" role="list">
                    {exam.relatedPaths.map((path) => (
                      <li key={path.slug}>
                        <span className="k body tnum">{formatCount(path.lessonCount, 'lesson')}</span>
                        <Link href={`/learn/${path.slug}`} className="v link-quiet">
                          {path.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {exam.technologyDetail.length > 0 && (
                <div>
                  <p className="mono" style={{ marginBottom: 12 }}>
                    Technologies
                  </p>
                  <ul className="tags" role="list">
                    {exam.technologyDetail.map((tech) => (
                      <li key={tech.slug}>
                        <Link href={`/technologies/${tech.slug}`}>{tech.name}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          </div>
        </section>

        <NextPage
          href={exam.relatedPaths.length > 0 ? `/learn/${exam.relatedPaths[0].slug}` : '/learn'}
          title="Preparation tracks"
          label="Learn it first"
        />
      </AppShell>
  )
}
