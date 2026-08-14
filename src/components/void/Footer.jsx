import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="ft">
      <div className="shell-wide">
        <div className="ft-top">
          <div>
            <p className="d3 ft-line">learn.pulplabs.ai</p>
            <p className="body ft-blurb">
              The PulpLabs Learn Lab: certification preparation, mock exams, and the documentation behind the
              tools we build in the open.
            </p>
          </div>
          <Link href="/learn" className="btn">
            Start preparing
          </Link>
        </div>

        <div className="ft-cols">
          <nav aria-label="Prepare">
            <p className="mono">Prepare</p>
            <ul>
              <li>
                <Link href="/learn">Certification tracks</Link>
              </li>
              <li>
                <Link href="/exams">Mock exams</Link>
              </li>
              <li>
                <Link href="/technologies">Technologies</Link>
              </li>
              <li>
                <Link href="/dashboard">Your progress</Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Build">
            <p className="mono">Build</p>
            <ul>
              <li>
                <Link href="/projects">Open-source projects</Link>
              </li>
              <li>
                <Link href="/projects#documentation">Documentation</Link>
              </li>
              <li>
                <Link href="/field">Field</Link>
              </li>
              <li>
                <Link href="/search">Search</Link>
              </li>
            </ul>
          </nav>

          <div>
            <p className="mono">PulpLabs</p>
            <ul>
              <li>
                <a href="https://pulplabs.ai" target="_blank" rel="noreferrer">
                  Main site
                </a>
              </li>
              <li>
                <a href="mailto:hello@pulplabs.ai">hello@pulplabs.ai</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="ft-base">
          <p className="mono">© {new Date().getFullYear()} PulpLabs. All rights reserved.</p>
          <p className="mono">Progress and attempts stay in this browser</p>
        </div>
      </div>
    </footer>
  )
}
