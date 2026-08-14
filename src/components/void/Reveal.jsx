'use client'

import { useEffect } from 'react'

/**
 * One document-level IntersectionObserver for every [data-r] element, plus a
 * MutationObserver so client-rendered content is picked up. Mounted once, in
 * the root layout — never import this in a page.
 *
 * Reveal is one-way: an element that has arrived never animates again.
 */
export default function Reveal() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduced) {
      document.querySelectorAll('[data-r]').forEach((el) => el.setAttribute('data-r', '1'))
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // Reveal on entry — and also for anything that is already *above* the
          // viewport. A deep link, a restored scroll position, or a jump to an
          // anchor would otherwise leave passed-over content permanently at
          // opacity 0, because it never enters the viewport from below.
          const passed = !entry.isIntersecting && entry.boundingClientRect.bottom < 0
          if (!entry.isIntersecting && !passed) continue

          entry.target.setAttribute('data-r', '1')
          io.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.08 }
    )

    const watch = (root) => {
      const nodes = root instanceof Element && root.matches('[data-r]') ? [root] : []
      if (root.querySelectorAll) nodes.push(...root.querySelectorAll('[data-r]'))
      for (const node of nodes) {
        if (node.getAttribute('data-r') === '1') continue
        io.observe(node)
      }
    }

    watch(document.body)

    const mo = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node.nodeType === 1) watch(node)
        }
      }
    })

    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [])

  return null
}
