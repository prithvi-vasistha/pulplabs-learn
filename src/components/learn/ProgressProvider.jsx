'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  EMPTY_STATE,
  LESSON_STATUS,
  STORAGE_KEY,
  derivePathProgress,
  lessonKey,
  readState,
  writeState,
} from '@/lib/progress-store'

const ProgressContext = createContext(null)

/**
 * Mounted once in the root layout. Children stay server components — they are
 * passed through, not imported.
 *
 * `ready` is false until the first client read completes, so nothing renders a
 * "0% complete" state that then jumps. Every consumer shows a skeleton or a
 * neutral state until then.
 */
export function ProgressProvider({ children }) {
  const [state, setState] = useState(EMPTY_STATE)
  const [ready, setReady] = useState(false)
  const [writable, setWritable] = useState(true)

  useEffect(() => {
    setState(readState())
    setReady(true)
  }, [])

  // Keep tabs in step.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === STORAGE_KEY) setState(readState())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const commit = useCallback((updater) => {
    setState((current) => {
      const next = updater(current)
      const ok = writeState(next)
      setWritable(ok)
      return next
    })
  }, [])

  const markVisited = useCallback(
    (pathSlug, lessonSlug) => {
      commit((current) => {
        const key = lessonKey(pathSlug, lessonSlug)
        if (current.lessons[key]?.status === LESSON_STATUS.completed) return current
        return {
          ...current,
          lessons: {
            ...current.lessons,
            [key]: { status: LESSON_STATUS.inProgress, at: new Date().toISOString() },
          },
        }
      })
    },
    [commit]
  )

  const setLessonComplete = useCallback(
    (pathSlug, lessonSlug, complete) => {
      commit((current) => ({
        ...current,
        lessons: {
          ...current.lessons,
          [lessonKey(pathSlug, lessonSlug)]: {
            status: complete ? LESSON_STATUS.completed : LESSON_STATUS.inProgress,
            at: new Date().toISOString(),
          },
        },
      }))
    },
    [commit]
  )

  const saveAttempt = useCallback(
    (attempt) => {
      commit((current) => ({
        ...current,
        attempts: [attempt, ...current.attempts.filter((a) => a.id !== attempt.id)].slice(0, 60),
      }))
    },
    [commit]
  )

  const toggleSaved = useCallback(
    (item) => {
      commit((current) => {
        const exists = current.saved.some((s) => s.href === item.href)
        return {
          ...current,
          saved: exists ? current.saved.filter((s) => s.href !== item.href) : [{ ...item }, ...current.saved].slice(0, 60),
        }
      })
    },
    [commit]
  )

  const reset = useCallback(() => {
    commit(() => ({ ...EMPTY_STATE }))
  }, [commit])

  const value = useMemo(
    () => ({
      ready,
      writable,
      state,
      lessonStatus: (pathSlug, lessonSlug) =>
        state.lessons[lessonKey(pathSlug, lessonSlug)]?.status ?? LESSON_STATUS.notStarted,
      isComplete: (pathSlug, lessonSlug) =>
        state.lessons[lessonKey(pathSlug, lessonSlug)]?.status === LESSON_STATUS.completed,
      pathProgress: (pathSlug, lessonSlugs) => derivePathProgress(state, pathSlug, lessonSlugs),
      attempts: state.attempts,
      attemptsFor: (examSlug) => state.attempts.filter((a) => a.examSlug === examSlug),
      getAttempt: (id) => state.attempts.find((a) => a.id === id) ?? null,
      saved: state.saved,
      isSaved: (href) => state.saved.some((s) => s.href === href),
      markVisited,
      setLessonComplete,
      saveAttempt,
      toggleSaved,
      reset,
    }),
    [ready, writable, state, markVisited, setLessonComplete, saveAttempt, toggleSaved, reset]
  )

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress() {
  const context = useContext(ProgressContext)
  if (!context) throw new Error('useProgress must be used inside <ProgressProvider>')
  return context
}
