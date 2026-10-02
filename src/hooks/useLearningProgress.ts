import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { readPreference, savePreference } from "../lib/native"

export type LearningProgress = {
  version: 2
  dailySeconds: Record<string, number>
  dailyXp: Record<string, number>
  completedLessonIds: string[]
  reviewedWords: string[]
  wordNextReview: Record<string, string>
  dailyReviewedWords: Record<string, string[]>
}

const emptyProgress: LearningProgress = {
  version: 2,
  dailySeconds: {},
  dailyXp: {},
  completedLessonIds: [],
  reviewedWords: [],
  wordNextReview: {},
  dailyReviewedWords: {},
}

export function dayKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function parseProgress(value: string | null): LearningProgress {
  if (!value) return emptyProgress
  try {
    const parsed = JSON.parse(value) as Partial<LearningProgress>
    return {
      version: 2,
      dailySeconds: parsed.dailySeconds ?? {},
      dailyXp: parsed.dailyXp ?? {},
      completedLessonIds: parsed.completedLessonIds ?? [],
      reviewedWords: parsed.reviewedWords ?? [],
      wordNextReview: parsed.wordNextReview ?? {},
      dailyReviewedWords: parsed.dailyReviewedWords ?? {},
    }
  } catch {
    return emptyProgress
  }
}

export function applyLessonCompletion(
  current: LearningProgress,
  id: string,
  now = new Date(),
): LearningProgress {
  const today = dayKey(now)
  const completedLessonIds = current.completedLessonIds ?? []
  const isNew = !completedLessonIds.includes(id)
  return {
    ...current,
    completedLessonIds: isNew
      ? [...completedLessonIds, id]
      : completedLessonIds,
    dailyXp: {
      ...(current.dailyXp ?? {}),
      [today]: (current.dailyXp?.[today] ?? 0) + (isNew ? 20 : 0),
    },
  }
}

export function applyWordReview(
  current: LearningProgress,
  hanzi: string,
  delayMinutes = 24 * 60,
  now = new Date(),
): LearningProgress {
  const today = dayKey(now)
  const creditedToday = current.dailyReviewedWords?.[today] ?? []
  const earnsXp = !creditedToday.includes(hanzi)
  return {
    ...current,
    reviewedWords: (current.reviewedWords ?? []).includes(hanzi)
      ? (current.reviewedWords ?? [])
      : [...(current.reviewedWords ?? []), hanzi],
    wordNextReview: {
      ...(current.wordNextReview ?? {}),
      [hanzi]: new Date(now.getTime() + delayMinutes * 60_000).toISOString(),
    },
    dailyReviewedWords: {
      ...(current.dailyReviewedWords ?? {}),
      [today]: earnsXp ? [...creditedToday, hanzi] : creditedToday,
    },
    dailyXp: {
      ...(current.dailyXp ?? {}),
      [today]: (current.dailyXp?.[today] ?? 0) + (earnsXp ? 2 : 0),
    },
  }
}

export function useLearningProgress() {
  const [progress, setProgress] = useState<LearningProgress>(emptyProgress)
  const [ready, setReady] = useState(false)
  const lastTick = useRef(Date.now())

  useEffect(() => {
    let active = true
    void readPreference("mingdao-progress").then((stored) => {
      if (!active) return
      setProgress(parseProgress(stored))
      setReady(true)
      lastTick.current = Date.now()
    })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!ready) return
    void savePreference("mingdao-progress", JSON.stringify(progress))
  }, [progress, ready])

  useEffect(() => {
    if (!ready) return
    const timer = window.setInterval(() => {
      const now = Date.now()
      const elapsed = Math.min(30, Math.floor((now - lastTick.current) / 1000))
      lastTick.current = now
      if (document.visibilityState !== "visible" || elapsed <= 0) return
      const today = dayKey()
      setProgress((current) => ({
        ...current,
        dailySeconds: {
          ...(current.dailySeconds ?? {}),
          [today]: (current.dailySeconds?.[today] ?? 0) + elapsed,
        },
      }))
    }, 15_000)
    return () => window.clearInterval(timer)
  }, [ready])

  const recordLesson = useCallback((id: string) => {
    setProgress((current) => applyLessonCompletion(current, id))
  }, [])

  const recordWord = useCallback((hanzi: string, delayMinutes = 24 * 60) => {
    setProgress((current) => applyWordReview(current, hanzi, delayMinutes))
  }, [])

  const resetProgress = useCallback(() => setProgress(emptyProgress), [])

  const metrics = useMemo(() => {
    const today = dayKey()
    const activeDays = new Set([
      ...Object.entries(progress.dailySeconds ?? {})
        .filter(([, seconds]) => seconds > 0)
        .map(([date]) => date),
      ...Object.entries(progress.dailyXp ?? {})
        .filter(([, xp]) => xp > 0)
        .map(([date]) => date),
    ])

    let currentStreak = 0
    const cursor = new Date()
    if (!activeDays.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1)
    while (activeDays.has(dayKey(cursor))) {
      currentStreak += 1
      cursor.setDate(cursor.getDate() - 1)
    }

    const sortedDays = [...activeDays].sort()
    let bestStreak = 0
    let run = 0
    let previous: Date | null = null
    for (const key of sortedDays) {
      const date = new Date(`${key}T12:00:00`)
      const difference = previous
        ? Math.round((date.getTime() - previous.getTime()) / 86_400_000)
        : 0
      run = previous && difference === 1 ? run + 1 : 1
      bestStreak = Math.max(bestStreak, run)
      previous = date
    }

    const week = Array.from({ length: 7 }, (_, index) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - index))
      return {
        date,
        seconds: progress.dailySeconds?.[dayKey(date)] ?? 0,
      }
    })

    return {
      currentStreak,
      bestStreak,
      todayXp: progress.dailyXp?.[today] ?? 0,
      totalSeconds: Object.values(progress.dailySeconds ?? {}).reduce(
        (sum, seconds) => sum + seconds,
        0,
      ),
      week,
    }
  }, [progress])

  return {
    metrics,
    progress,
    ready,
    recordLesson,
    recordWord,
    resetProgress,
  }
}
