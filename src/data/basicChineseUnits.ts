export type BookUnit = {
  id: number
  title: string
  focus: string
  hsk: 1 | 2 | 3 | 4 | 5 | 6
}

export const basicChineseUnits: BookUnit[] = [
  { id: 1, title: "Nouns: singular and plural", focus: "Noun number and measure-word foundations", hsk: 1 },
  { id: 2, title: "Definite reference and demonstratives", focus: "This, that, these, and those in context", hsk: 1 },
  { id: 3, title: "Personal pronouns", focus: "I, you, we, they, and possession", hsk: 1 },
  { id: 4, title: "Interrogative pronouns", focus: "Who, what, which, and where", hsk: 1 },
  { id: 5, title: "Numbers", focus: "Counting, fractions, dates, and approximation", hsk: 1 },
  { id: 6, title: "Measure words", focus: "Classifiers for everyday nouns", hsk: 1 },
  { id: 7, title: "Indefinite plurals", focus: "Some, many, a few, and none", hsk: 2 },
  { id: 8, title: "Times and dates", focus: "Clock time, calendars, and sequence", hsk: 1 },
  { id: 9, title: "More interrogative expressions", focus: "How long, how far, how, and why", hsk: 2 },
  { id: 10, title: "Adjectives", focus: "Attributive and predicative descriptions", hsk: 2 },
  { id: 11, title: "shì and yǒu", focus: "Identity, possession, and existence", hsk: 1 },
  { id: 12, title: "Comparisons", focus: "Comparing, matching, and intensifying", hsk: 2 },
  { id: 13, title: "Verbs and location expressions", focus: "Where actions happen and where things are", hsk: 2 },
  { id: 14, title: "Verbs and time expressions", focus: "Time, duration, and frequency", hsk: 2 },
  { id: 15, title: "Verbs and aspect markers", focus: "Completed, experienced, ongoing, and changing actions", hsk: 3 },
  { id: 16, title: "Modal verbs", focus: "Want, can, must, should, and willingness", hsk: 2 },
  { id: 17, title: "Negators: bù and méi(yǒu)", focus: "Present, future, past, and experience negation", hsk: 2 },
  { id: 18, title: "Types of question (1)", focus: "ma, affirmative-negative questions, and question words", hsk: 1 },
  { id: 19, title: "Types of question (2)", focus: "Tags, alternatives, ba, and emphasis", hsk: 2 },
  { id: 20, title: "Imperatives and exclamations", focus: "Requests, commands, prohibitions, and emphasis", hsk: 1 },
  { id: 21, title: "Complements of direction and location", focus: "Coming, going, entering, exiting, and destinations", hsk: 3 },
  { id: 22, title: "Complements of result and manner", focus: "What an action achieves and how it happens", hsk: 3 },
  { id: 23, title: "Potential complements", focus: "Can or cannot complete an action", hsk: 3 },
  { id: 24, title: "Coverbal phrases", focus: "With, for, from, toward, and other relationships", hsk: 3 },
  { id: 25, title: "Disyllabic prepositions", focus: "Purpose, basis, exception, and reference", hsk: 4 },
]
