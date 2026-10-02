import { mkdir, writeFile } from "node:fs/promises"
import cedict from "cedict-json"
import vocabulary from "hsk3.1-syllabus"

const levels = ["1", "2", "3", "4", "5", "6", "7-9"]
const flattened = vocabulary.flatMap((entry) =>
  Array.isArray(entry[0]) ? entry : [entry],
)
const dictionary = new Map()

for (const entry of cedict) {
  const current = dictionary.get(entry.simplified) ?? {
    traditional: entry.traditional,
    meaningsEn: [],
  }
  for (const meaning of entry.english) {
    if (
      !current.meaningsEn.includes(meaning) &&
      current.meaningsEn.length < 4
    ) {
      current.meaningsEn.push(meaning)
    }
  }
  dictionary.set(entry.simplified, current)
}

const packs = Object.fromEntries(
  levels.map((level, levelIndex) => {
    const primary = flattened.filter((entry) => entry[1] === level)
    const review =
      primary.length < 250
        ? flattened.filter((entry) =>
            levels.slice(0, levelIndex).includes(entry[1]),
          )
        : []
    return [
      level,
      [...primary, ...review]
        .slice(0, 250)
        .map(([sequence, mappedLevel, hanzi, pinyin, partsOfSpeech]) => {
          const definition = dictionary.get(hanzi)
          return {
            id: sequence,
            level: mappedLevel,
            hanzi,
            traditional: definition?.traditional ?? null,
            pinyin,
            partsOfSpeech,
            meaningsEn: definition?.meaningsEn ?? [],
          }
        }),
    ]
  }),
)

for (const level of levels) {
  if (packs[level].length !== 250) {
    throw new Error(
      `HSK ${level} contains only ${packs[level].length} entries; expected 250`,
    )
  }
}

const output = {
  metadata: {
    curriculum: "HSK 3.1",
    sourcePackage: "hsk3.1-syllabus@0.1.0",
    sourceRepository: "https://github.com/leonsilicon/hsk3.1-syllabus",
    license: "MIT",
    dictionarySource: "cedict-json@1.3.20251213 / CC-CEDICT",
    dictionaryRepository: "https://github.com/matt-tingen/cedict-json",
    dictionaryLicense: "CC-BY-SA-4.0",
    selection:
      "A 250-card study pack for each level, ordered by official syllabus sequence. Level 2 contains all 204 newly assigned Level-2 entries plus 46 Level-1 review entries because the official HSK 3.1 syllabus has only 204 new entries at Level 2. Levels 7–9 are an official combined advanced band.",
    meaningLocales: ["en"],
  },
  packs,
}

const entries = Object.values(packs).flat()
output.metadata.dictionaryMatches = entries.filter(
  (entry) => entry.meaningsEn.length > 0,
).length

await mkdir(new URL("../src/data", import.meta.url), { recursive: true })
await writeFile(
  new URL("../src/data/hsk-packs.json", import.meta.url),
  `${JSON.stringify(output)}\n`,
)

console.log(
  `Generated ${levels.length} packs and ${
    levels.length * 250
  } vocabulary entries; ${output.metadata.dictionaryMatches} have CC-CEDICT definitions.`,
)
