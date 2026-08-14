'use client'

import { useEffect, useRef, useState } from 'react'

/* ==========================================================================
   LoopVideo — a silent, looping background plate.

   Three gates before a single byte is fetched, because a background video is
   pure decoration and must never cost a visitor who did not ask for it:

     1. prefers-reduced-motion — an autoplaying loop is exactly what that
        setting exists to stop. Poster only.
     2. Save-Data / 2g-3g — the poster is 8KB, the video is 200KB+.
     3. Off-screen — the source is not attached until it scrolls into view.

   The poster carries the composition on its own, so every suppressed path
   still looks finished rather than blank.
   ========================================================================== */
export default function LoopVideo({ src, poster, className = '', opacity = 1, once = false, pauseAt = null }) {
  const wrap = useRef(null)
  const video = useRef(null)
  const [play, setPlay] = useState(false)

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    const c = navigator.connection
    if (c?.saveData || /2g/.test(c?.effectiveType ?? '')) return

    const node = wrap.current
    if (!node) return

    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        setPlay(true)
        io.disconnect()
      },
      { rootMargin: '200px' },
    )
    io.observe(node)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!play) return
    const v = video.current
    // Autoplay can still be refused; the poster stays visible if it is.
    v?.play?.().catch(() => {})
    if (!once || !v) return

    /* Stop on `pauseAt` — the same frame the poster was cut from, so the
       still shown before playback, the frame it settles on, and the static
       background afterwards are all one picture. Nothing jumps. */
    if (pauseAt != null) {
      const watch = () => {
        if (v.currentTime < pauseAt) return
        v.pause()
        v.currentTime = pauseAt
        v.removeEventListener('timeupdate', watch)
      }
      v.addEventListener('timeupdate', watch)
      return () => v.removeEventListener('timeupdate', watch)
    }

    // Otherwise hold the last frame, a hair before the true end — some
    // decoders present a blank frame exactly at duration.
    const stop = () => {
      v.pause()
      v.currentTime = Math.max(0, v.duration - 0.05)
    }
    v.addEventListener('ended', stop)
    return () => v.removeEventListener('ended', stop)
  }, [play, once, pauseAt])

  return (
    <div ref={wrap} className={`loop ${className}`} style={{ opacity }} aria-hidden="true">
      <video
        ref={video}
        poster={poster}
        muted
        /* `once` plays through and holds the last frame. A background that
           restarts every eight seconds pulls the eye back repeatedly; playing
           in once and settling reads as the page arriving, then being still. */
        loop={!once}
        playsInline
        preload="none"
        /* Tells Safari/iOS this is decorative chrome, not media the user
           chose to watch — keeps it out of picture-in-picture and the
           now-playing controls. */
        disablePictureInPicture
        tabIndex={-1}
      >
        {play && (
          <>
            <source src={`${src}.webm`} type="video/webm" />
            <source src={`${src}.mp4`} type="video/mp4" />
          </>
        )}
      </video>
    </div>
  )
}
