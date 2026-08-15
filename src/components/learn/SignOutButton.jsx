'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignOutButton({ className = 'btn btn-ghost btn-sm' }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  return (
    <button
      type="button"
      className={className}
      disabled={pending}
      onClick={async () => {
        setPending(true)
        await fetch('/api/auth/logout', { method: 'POST' }).catch(() => null)
        router.push('/')
        router.refresh()
      }}
    >
      {pending ? 'Signing out…' : 'Sign out'}
    </button>
  )
}
