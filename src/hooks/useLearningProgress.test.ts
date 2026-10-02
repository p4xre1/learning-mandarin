import { describe, expect, it } from "vitest"
import {
  applyLessonCompletion,
  applyWordReview,
  dayKey,
  parseProgress,
} from "./useLearningProgress"

describe("learning progress", () => {
  it("migrates older and incomplete records to schema version 2", () => {
    const progress = parseProgress(
      JSON.stringify({
        version: 1,
        completedLessonIds: ["introductions"],
      }),
    )

    expect(progress.version).toBe(2)
    expect(progress.completedLessonIds).toEqual(["introductions"])
    expect(progress.dailySeconds).toEqual({})
    expect(progress.wordNextReview).toEqual({})
    expect(progress.dailyReviewedWords).toEqual({})
  })

  it("awards lesson XP only for the first completion", () => {
    const now = new Date("2026-02-15T12:00:00")
    const initial = parseProgress(null)
    const first = applyLessonCompletion(initial, "introductions", now)
    const repeated = applyLessonCompletion(first, "introductions", now)

    expect(repeated.completedLessonIds).toEqual(["introductions"])
    expect(repeated.dailyXp[dayKey(now)]).toBe(20)
  })

  it("awards review XP once per word per local day", () => {
    const firstDay = new Date("2026-02-15T12:00:00")
    const secondDay = new Date("2026-02-16T12:00:00")
    const initial = parseProgress(null)
    const first = applyWordReview(initial, "你好", 10, firstDay)
    const repeated = applyWordReview(first, "你好", 10, firstDay)
    const nextDay = applyWordReview(repeated, "你好", 10, secondDay)

    expect(repeated.dailyXp[dayKey(firstDay)]).toBe(2)
    expect(nextDay.dailyXp[dayKey(secondDay)]).toBe(2)
    expect(nextDay.reviewedWords).toEqual(["你好"])
  })
})
