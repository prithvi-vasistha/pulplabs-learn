import Sidebar from '@/components/void/Sidebar'
import PortalFoot from '@/components/void/PortalFoot'
import { currentUser } from '@/lib/auth'

/**
 * The frame every page sits in.
 *
 * One shell, applied everywhere, so a reader is never unsure whether they are
 * still inside the portal. The old marketing shell — full-bleed hero, footer
 * with three columns of links — is gone: a portal has a persistent
 * navigation and a working area, and the working area is the page.
 *
 * The session is resolved here, once, and handed to the navigation. Doing it
 * in the shell rather than in each page means every page knows who is reading
 * without any page having to ask.
 */
export default async function AppShell({ children, wide = false }) {
  const user = await currentUser()

  return (
    <div className="app grain">
      <Sidebar user={user} />

      <div className="app-main">
        <main id="main" className={wide ? 'app-content app-content-wide' : 'app-content'}>
          {children}
        </main>
        <PortalFoot />
      </div>
    </div>
  )
}
