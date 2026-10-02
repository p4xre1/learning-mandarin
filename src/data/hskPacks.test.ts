import { describe, expect, it } from "vitest"
import data from "./hsk-packs.json"

describe("generated HSK study packs", () => {
  it("contains seven packs of exactly 250 entries", () => {
    expect(Object.keys(data.packs)).toEqual([
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7-9",
    ])
    expect(Object.values(data.packs).every((pack) => pack.length === 250)).toBe(
      true,
    )
  })

  it("retains source levels for the cumulative Level 2 review entries", () => {
    expect(new Set(data.packs["2"].map((word) => word.level))).toEqual(
      new Set(["1", "2"]),
    )
  })

  it("provides licensed English definitions for every generated entry", () => {
    const entries = Object.values(data.packs).flat()
    expect(entries).toHaveLength(1750)
    expect(entries.every((entry) => entry.meaningsEn.length > 0)).toBe(true)
    expect(data.metadata.dictionaryLicense).toBe("CC-BY-SA-4.0")
  })
})
