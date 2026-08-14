'use client'

import { useProgress } from '@/components/learn/ProgressProvider'

/** Save a page for later. Stored locally, listed on the dashboard. */
export default function SaveToggle({ item }) {
  const { ready, isSaved, toggleSaved } = useProgress()
  const saved = ready && isSaved(item.href)

  return (
    <button
      type="button"
      className="chip"
      aria-pressed={saved}
      onClick={() => toggleSaved(item)}
      disabled={!ready}
    >
      {saved ? 'Saved' : 'Save for later'}
    </button>
  )
}
