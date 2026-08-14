import Link from 'next/link'
import Nav from '@/components/void/Nav'
import Footer from '@/components/void/Footer'
import NextPage from '@/components/void/NextPage'
import LoopVideo from '@/components/void/LoopVideo'
import Chevron from '@/components/void/Icons'
import ContinueLearning from '@/components/learn/ContinueLearning'
import { SectionHead, CloseSection } from '@/components/learn/ui'
import { DocRow, ExamRow, PathCard, ProjectCard, TechCell } from '@/components/learn/cards'
import { Badge } from '@/components/learn/ui'
import {
  disclosure,
  getDocSets,
  getFieldEntries,
  getExams,
  getPaths,
  getProgressCatalogue,
  getProjects,
  getTechnologies,
} from '@/lib/content'

export default async function Home() {
  const [paths, exams, technologies, projects, docSets, catalogue, field] = await Promise.all([
    getPaths(),
    getExams(),
    getTechnologies(),
    getProjects(),
    getDocSets(),
    getProgressCatalogue(),
    getFieldEntries(),
  ])

  const lessonCount = paths.reduce((total, path) => total + path.lessonCount, 0)
  const questionCount = exams.reduce((total, exam) => total + exam.questionCount, 0)

  const facts = [
    { n: paths.length, k: 'Tracks' },
    { n: lessonCount, k: 'Lessons' },
    { n: exams.length, k: 'Mock exams' },
    { n: questionCount, k: 'Questions' },
  ]

  return (
    <div className="grain">
      <Nav />

      <main id="main">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="hero grid-bg">
          <LoopVideo
            className="hero-light"
            src="/void/hero-loop"
            poster="/void/hero-pause.webp"
            opacity={0.85}
            once
            pauseAt={4.2}
          />

          <div className="shell hero-in">
            <p className="mono hero-pill-line">Prepare. Practise. Build.</p>

            <h1 className="d1 hero-h">
              Know the AI stack.
              <br />
              <span className="dim">Prove that you do.</span>
            </h1>

            <p className="lede hero-l measure-w">
              Certification preparation from PulpLabs: structured tracks, mock exams that report by topic, and
              the documentation for what we build in the open.
            </p>

            <div className="hero-cta">
              <Link href="/learn" className="btn">
                Explore preparation tracks <Chevron />
              </Link>
              <Link href="/exams" className="btn btn-ghost">
                Take a mock exam
              </Link>
            </div>
          </div>
        </section>

        {/* ── What is in the Lab ───────────────────────────────────────── */}
        <section className="trust">
          <div className="shell-wide trust-in">
            <span className="mono">In the Lab</span>
            <ul className="trust-logos">
              {paths.map((path) => (
                <li key={path.slug}>{path.eyebrow}</li>
              ))}
            </ul>
            <ul className="trust-counts tnum">
              {facts.map((fact) => (
                <li key={fact.k}>
                  <b>{fact.n}</b> {fact.k.toLowerCase()}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="flow">
          {/* ── Continue ───────────────────────────────────────────────── */}
          <section className="sec-sm">
            <div className="shell-wide">
              <SectionHead eyebrow="Your progress" title="Where you left off." />
              <div data-r>
                <ContinueLearning catalogue={catalogue} />
              </div>
            </div>
          </section>

          {/* ── Tracks ─────────────────────────────────────────────────── */}
          <section className="sec">
            <div className="shell-wide">
              <SectionHead
                eyebrow="Preparation tracks"
                title={
                  <>
                    Structured routes. <span className="dim">Not a reading list.</span>
                  </>
                }
                lede="Each track states who it is for, what it assumes, and what you will be able to do at the end."
                action={
                  <Link href="/learn" className="link">
                    All tracks <Chevron />
                  </Link>
                }
              />

              <ul className="grid-h grid-h-2" role="list">
                {paths.map((path, i) => (
                  <PathCard key={path.slug} path={path} index={i} />
                ))}
              </ul>
            </div>
          </section>

          {/* ── Practice ───────────────────────────────────────────────── */}
          <section className="sec">
            <div className="shell-wide">
              <SectionHead
                eyebrow="Practice"
                title={
                  <>
                    Find the gaps <span className="dim">before the exam does.</span>
                  </>
                }
                lede="Every mock exam reports performance per topic and links each weak area straight back to the lesson that covers it."
                action={
                  <Link href="/exams" className="link">
                    All mock exams <Chevron />
                  </Link>
                }
              />

              <ul className="index" role="list">
                {exams.slice(0, 4).map((exam, i) => (
                  <ExamRow key={exam.slug} exam={exam} index={i} />
                ))}
              </ul>
            </div>
          </section>

          {/* ── Technologies ───────────────────────────────────────────── */}
          <section className="sec">
            <div className="shell-wide">
              <SectionHead
                eyebrow="Technologies"
                title="What the certifications actually test."
                lede="Start from a subject rather than a course. Each one explains what it is, why it matters, and where it sits in the rest of the system."
                action={
                  <Link href="/technologies" className="link">
                    All technologies <Chevron />
                  </Link>
                }
              />

              <ul className="grid-h grid-h-4 grid-h-sm" role="list">
                {technologies.slice(0, 8).map((tech, i) => (
                  <TechCell key={tech.slug} tech={tech} index={i} />
                ))}
              </ul>
            </div>
          </section>

          {/* ── Field ──────────────────────────────────────────────────── */}
          <section className="sec">
            <div className="shell-wide">
              <SectionHead
                eyebrow="Field"
                title={
                  <>
                    The same work, <span className="dim">outside a lesson.</span>
                  </>
                }
                lede="Client case studies, how a PulpLabs engagement is actually run, and recorded conversations with the engineers who build these systems."
                action={
                  <Link href="/field" className="link">
                    All entries <Chevron />
                  </Link>
                }
              />

              <ul className="tiles" role="list">
                {field.slice(0, 3).map((entry, i) => (
                  <li key={entry.slug}>
                    <article className="tile" data-r style={{ '--rd': `${i * 65}ms` }}>
                      <div className="tile-media">
                        <img src={`/void/${entry.plate}.webp`} alt="" loading="lazy" decoding="async" />
                        <span className="tile-badge">
                          <Badge quiet={entry.kind !== 'Interview'} pip={entry.kind === 'Interview'}>
                            {entry.kind}
                          </Badge>
                        </span>
                      </div>
                      <div className="tile-in">
                        <p className="mono">{entry.client ?? entry.sector}</p>
                        <h3 className="h4">
                          <Link href={`/field/${entry.slug}`} className="stretch-l">
                            {entry.title}
                          </Link>
                        </h3>
                        <p className="body trunc-2">{entry.summary}</p>
                      </div>
                    </article>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* ── Builds ─────────────────────────────────────────────────── */}
          <section className="sec">
            <div className="shell-wide">
              <SectionHead
                eyebrow="Builds"
                title={
                  <>
                    What we ship <span className="dim">in the open.</span>
                  </>
                }
                lede="The open-source products and contributions PulpLabs works on — each one connected to the lessons that explain the ideas underneath it."
                action={
                  <Link href="/builds" className="link">
                    All builds <Chevron />
                  </Link>
                }
              />

              <ul className="grid-h grid-h-2" role="list">
                {projects.map((project, i) => (
                  <ProjectCard key={project.slug} project={project} index={i} />
                ))}
              </ul>
            </div>
          </section>

          {/* ── Documentation ──────────────────────────────────────────── */}
          <section className="sec">
            <div className="shell-wide">
              <SectionHead
                eyebrow="Documentation"
                title="Reference, written for the person using it."
                action={
                  <Link href="/docs" className="link">
                    All documentation <Chevron />
                  </Link>
                }
              />

              <ul className="index" role="list">
                {docSets.map((set, i) => (
                  <DocRow key={set.slug} set={set} index={i} />
                ))}
              </ul>

              <p className="note" style={{ marginTop: 28 }}>
                {disclosure}
              </p>
            </div>
          </section>
        </div>

        <CloseSection
          title="Prepare. Practise. Build."
          lede="Work through a track, sit the mock exam, find out what you actually know, then read the source of something built on it."
        >
          <Link href="/learn" className="btn">
            Start preparing <Chevron />
          </Link>
          <Link href="/dashboard" className="btn btn-ghost">
            Your dashboard
          </Link>
        </CloseSection>

        <NextPage href="/learn" title="Preparation tracks" />
      </main>

      <Footer />
    </div>
  )
}
