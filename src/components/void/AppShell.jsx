import Sidebar from '@/components/void/Sidebar'
import PortalFoot from '@/components/void/PortalFoot'

/**
 * The frame every page sits in.
 *
 * One shell, applied everywhere, so a reader is never unsure whether they are
 * still inside the portal. The old marketing shell — full-bleed hero, footer
 * with three columns of links — is gone: a portal has a persistent
 * navigation and a working area, and the working area is the page.
 */
export default function AppShell({ children, wide = false }) {
  return (
    <div className="app grain">
      <Sidebar />

      <div className="app-main">
        <main id="main" className={wide ? 'app-content app-content-wide' : 'app-content'}>
          {children}
        </main>
        <PortalFoot />
      </div>
    </div>
  )
}
