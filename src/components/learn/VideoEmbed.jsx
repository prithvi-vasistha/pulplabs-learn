'use client'

import { useState } from 'react'

/**
 * A video frame that contacts nobody until the reader asks it to.
 *
 * The same principle as LoopVideo in §8, applied to a third party: a facade
 * carries the composition — a light plate, the title, the duration — and the
 * embed is only created on click. YouTube is loaded through the
 * privacy-enhanced domain, and no cookie or request reaches it beforehand.
 *
 * `video.id` of null is a real state, not a bug: the recording does not exist
 * yet. The frame says so rather than showing a play button that does nothing.
 */
export default function VideoEmbed({ video, plate = 'aperture-glow' }) {
  const [playing, setPlaying] = useState(false)

  if (!video) return null

  const { provider = 'youtube', id, title, duration, note, src } = video
  const available = provider === 'file' ? Boolean(src) : Boolean(id)

  if (!available) {
    return (
      <div className="video">
        <div className="video-plate" aria-hidden="true">
          <img src={`/void/${plate}.webp`} alt="" loading="lazy" decoding="async" />
        </div>
        <div className="video-off">
          <p className="mono">Recording not published</p>
          <p className="h4">{title}</p>
          {note && <p className="body">{note}</p>}
        </div>
      </div>
    )
  }

  if (!playing) {
    return (
      <div className="video">
        <div className="video-plate" aria-hidden="true">
          <img src={`/void/${plate}.webp`} alt="" loading="lazy" decoding="async" />
        </div>

        <button type="button" className="video-facade" onClick={() => setPlaying(true)}>
          <span className="video-play" aria-hidden="true">
            <svg width="18" height="20" viewBox="0 0 18 20" fill="currentColor" focusable="false">
              <path d="M17 8.27a2 2 0 0 1 0 3.46L3 19.79A2 2 0 0 1 0 18.05V1.95A2 2 0 0 1 3 .21z" />
            </svg>
          </span>
          <span className="video-t">{title}</span>
          <span className="sr-only">
            Play video{duration ? `, ${duration}` : ''}
            {provider === 'youtube' ? ', loads from YouTube' : ''}
          </span>
        </button>

        <div className="video-meta">
          {duration && <span className="mono tnum">{duration}</span>}
          {provider === 'youtube' && <span className="mono">YouTube</span>}
        </div>
      </div>
    )
  }

  return (
    <div className="video">
      {provider === 'file' ? (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video src={src} controls autoPlay playsInline />
      ) : (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      )}
    </div>
  )
}
