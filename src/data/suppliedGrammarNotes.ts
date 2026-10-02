export type GrammarNote = {
  title: string
  pattern: string
  explanation: string
  example: string
  pinyin: string
}

export const suppliedGrammarNotes: GrammarNote[] = [
  {
    title: "Four tones change meaning",
    pattern: "mā · má · mǎ · mà",
    explanation:
      "Learn each new word with its tone. The same syllable can mean a mother, hemp, horse, or scold depending on the tone.",
    example: "妈 · 麻 · 马 · 骂",
    pinyin: "mā · má · mǎ · mà",
  },
  {
    title: "把 construction",
    pattern: "Subject + 把 + object + verb",
    explanation:
      "Use 把 when the sentence focuses on what happens to a specific object.",
    example: "请把书放在桌子上。",
    pinyin: "Qǐng bǎ shū fàng zài zhuōzi shàng.",
  },
  {
    title: "被 passive",
    pattern: "Subject + 被 + agent + verb",
    explanation:
      "Use 被 to foreground the person or thing affected by an action.",
    example: "我的自行车被人拿走了。",
    pinyin: "Wǒ de zìxíngchē bèi rén ná zǒu le.",
  },
  {
    title: "Adverbial 地",
    pattern: "Adjective + 地 + verb",
    explanation:
      "地 links a description of manner to the action that follows it.",
    example: "她认真地学习。",
    pinyin: "Tā rènzhēn de xuéxí.",
  },
  {
    title: "不但…而且…",
    pattern: "不但 A，而且 B",
    explanation:
      "This paired structure means not only A, but also B.",
    example: "他不但会说中文，而且会写汉字。",
    pinyin: "Tā búdàn huì shuō Zhōngwén, érqiě huì xiě Hànzì.",
  },
  {
    title: "从来 with negation",
    pattern: "从来 + 不 / 没(有) + verb",
    explanation:
      "从来 emphasizes that something has never happened or is never done.",
    example: "我从来没有去过北京。",
    pinyin: "Wǒ cónglái méiyǒu qù guo Běijīng.",
  },
]
