import Link from 'next/link'

/**
 * A footer rule, not a site map.
 *
 * The old footer was a marketing footer: three columns of links, a call to
 * action, a tagline. Inside a portal the navigation is already on screen, so
 * all this has to carry is the one thing the sidebar cannot — what this is,
 * who runs it, and where progress is stored.
 */
export default function PortalFoot() {
  return (
    <footer className="pfoot">
      <p className="mono">
        PulpLabs is an AI consultancy. This portal holds the material we use to bring teams up to
        speed on the systems we build — plus the projects we ship in the open.
      </p>

      <div className="pfoot-row">
        <span className="mono">© {new Date().getFullYear()} PulpLabs</span>
        <span className="mono">Progress is stored in this browser</span>
        <Link href="/search" className="mono">
          Search everything
        </Link>
        <a href="https://pulplabs.ai" target="_blank" rel="noreferrer" className="mono">
          pulplabs.ai
        </a>
      </div>
    </footer>
  )
}
