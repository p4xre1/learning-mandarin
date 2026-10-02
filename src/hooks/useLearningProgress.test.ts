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
    expect(progress.lessonMastery).toEqual({})
    expect(progress.wordNextReview).toEqual({})
    expect(progress.dailyReviewedWords).toEqual({})
  })

  it("drops malformed persisted fields without crashing", () => {
    const progress = parseProgress(
      JSON.stringify({
        dailySeconds: { today: 120, broken: "120" },
        dailyXp: null,
        completedLessonIds: ["introductions", 42],
        wordNextReview: { 你好: "2026-02-15T12:00:00Z", broken: "soon" },
      }),
    )

    expect(progress.dailySeconds).toEqual({ today: 120 })
    expect(progress.dailyXp).toEqual({})
    expect(progress.completedLessonIds).toEqual(["introductions"])
    expect(progress.wordNextReview).toEqual({
      你好: "2026-02-15T12:00:00Z",
    })
  })

  it("awards lesson XP only for the first completion", () => {
    const now = new Date("2026-02-15T12:00:00")
    const initial = parseProgress(null)
    const first = applyLessonCompletion(initial, "introductions", now)
    const repeated = applyLessonCompletion(first, "introductions", now)

    expect(repeated.completedLessonIds).toEqual(["introductions"])
    expect(repeated.lessonMastery.introductions).toBe(2)
    expect(repeated.dailyXp[dayKey(now)]).toBe(20)
  })

  it("caps lesson mastery at three completions", () => {
    const now = new Date("2026-02-15T12:00:00")
    const initial = parseProgress(null)
    const mastered = [1, 2, 3, 4].reduce(
      (current) => applyLessonCompletion(current, "introductions", now),
      initial,
    )

    expect(mastered.lessonMastery.introductions).toBe(3)
    expect(mastered.dailyXp[dayKey(now)]).toBe(20)
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

  it("ignores malformed persisted progress data instead of trusting it", () => {
    const progress = parseProgress(
      JSON.stringify({
        version: 2,
        dailySeconds: "oops",
        dailyXp: { "2026-02-15": "not-a-number" },
        completedLessonIds: "introductions",
        reviewedWords: { value: "你好" },
        wordNextReview: { 你好: 123 },
        dailyReviewedWords: { "2026-02-15": "bad" },
      }),
    )

    expect(progress.dailySeconds).toEqual({})
    expect(progress.dailyXp).toEqual({})
    expect(progress.completedLessonIds).toEqual([])
    expect(progress.lessonMastery).toEqual({})
    expect(progress.reviewedWords).toEqual([])
    expect(progress.wordNextReview).toEqual({})
    expect(progress.dailyReviewedWords).toEqual({})
  })
})
