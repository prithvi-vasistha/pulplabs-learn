/**
 * Route loading state.
 *
 * The skeleton mirrors the page-head-then-grid shape every route uses, so the
 * layout does not shift when content arrives.
 */
export default function Loading() {
  return (
    <div className="grain">
      <div className="shell-wide" style={{ paddingBlock: 'clamp(96px, 12vw, 160px)' }} aria-hidden="true">
        <span className="skel" style={{ width: 120 }} />
        <span className="skel skel-t" style={{ width: '52%', height: 56, marginTop: 24 }} />
        <span className="skel" style={{ width: '38%', marginTop: 18 }} />

        <div className="cols-2" style={{ marginTop: 56 }}>
          <span className="skel skel-b" />
          <span className="skel skel-b" />
        </div>
      </div>

      <p className="sr-only" role="status">
        Loading
      </p>
    </div>
  )
}
