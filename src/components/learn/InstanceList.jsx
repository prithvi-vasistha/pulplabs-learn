'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

/**
 * Demo instances currently leased to this account.
 *
 * Shown on the profile because a lease is a thing you are holding, and a
 * portal that hands out resources without ever showing you what you are
 * holding is how people end up with four of them.
 */
export default function InstanceList({ instances }) {
  const router = useRouter()
  const [busy, setBusy] = useState(null)

  if (instances.length === 0) {
    return (
      <p className="note">
        No demo instances running. Starting one from the <Link href="/playground">playground</Link> leases it to your
        account for 45 minutes.
      </p>
    )
  }

  return (
    <ul className="inst" role="list">
      {instances.map((instance) => (
        <li key={instance.id}>
          <div>
            <Link href={`/playground/${instance.demoSlug}`} className="h4">
              {instance.title}
            </Link>
            <p className="mono">
              {instance.runs} of {instance.quota} runs · expires {relative(instance.expiresAt)}
            </p>
          </div>
          <div className="inst-a">
            <span className="mono tnum inst-id">{instance.id.slice(0, 8)}</span>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              disabled={busy === instance.id}
              onClick={async () => {
                setBusy(instance.id)
                await fetch(`/api/playground/${instance.demoSlug}/session?id=${encodeURIComponent(instance.id)}`, {
                  method: 'DELETE',
                }).catch(() => null)
                setBusy(null)
                router.refresh()
              }}
            >
              {busy === instance.id ? 'Ending…' : 'End'}
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}

function relative(iso) {
  const minutes = Math.round((new Date(iso).getTime() - Date.now()) / 60000)
  if (minutes <= 0) return 'now'
  if (minutes < 60) return `in ${minutes} min`
  return `in ${Math.round(minutes / 60)} h`
}
