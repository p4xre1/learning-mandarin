import { useMemo, useState } from "react"
import { ArrowIcon, Button, Card } from "./ui"
import { suppliedGrammarNotes } from "../data/suppliedGrammarNotes"

type Locale = "en" | "ar" | "ary"
type Tab = "daily" | "grammar" | "vocabulary" | "practice" | "conversation" | "roadmap"

const vocabulary = [
  { hanzi: "你好", pinyin: "nǐ hǎo", en: "hello", ar: "مرحبا", category: "Greetings" },
  { hanzi: "学习", pinyin: "xuéxí", en: "to study", ar: "يدرس / يتعلم", category: "Study" },
  { hanzi: "帮助", pinyin: "bāngzhù", en: "to help", ar: "يساعد / مساعدة", category: "Daily life" },
  { hanzi: "喜欢", pinyin: "xǐhuan", en: "to like", ar: "يحب", category: "Daily life" },
  { hanzi: "请问", pinyin: "qǐngwèn", en: "excuse me, may I ask", ar: "عفوا، هل يمكن أن أسأل؟", category: "Travel" },
  { hanzi: "朋友", pinyin: "péngyou", en: "friend", ar: "صديق", category: "People" },
] as const

const copy = {
  en: {
    eyebrow: "Study hub",
    title: "Everything you need for today",
    intro: "One short flow for learning, practice, review, and progress.",
    tabs: ["Daily plan", "Grammar", "Vocabulary", "Practice", "Conversation", "Roadmap"],
    start: "Start",
    review: "Add to review",
    saved: "Saved",
    play: "Play pronunciation",
    search: "Search vocabulary",
    choose: "Choose the correct sentence",
    correct: "Correct",
    tryAgain: "Try again",
    conversation: "Order a drink",
    conversationText: "Practise a useful exchange for a café or restaurant.",
    roadmap: "Your grammar roadmap",
    complete: "Complete",
    dailyTitle: "Your five-minute plan",
    dailyIntro: "One grammar point, three words, and one quick exercise.",
    grammar: "Grammar point",
    words: "Vocabulary",
    exercise: "Quick exercise",
  },
  ar: {
    eyebrow: "مركز الدراسة",
    title: "كل ما تحتاجه لليوم",
    intro: "مسار قصير للتعلم والتدريب والمراجعة وتتبع التقدم.",
    tabs: ["خطة اليوم", "القواعد", "المفردات", "تدريب", "محادثة", "المسار"],
    start: "ابدأ",
    review: "أضف للمراجعة",
    saved: "محفوظ",
    play: "شغّل النطق",
    search: "ابحث في المفردات",
    choose: "اختر الجملة الصحيحة",
    correct: "صحيح",
    tryAgain: "حاول مرة أخرى",
    conversation: "اطلب مشروباً",
    conversationText: "تدرّب على حوار مفيد في مقهى أو مطعم.",
    roadmap: "مسار القواعد",
    complete: "مكتمل",
    dailyTitle: "خطة الخمس دقائق",
    dailyIntro: "قاعدة واحدة وثلاث كلمات وتمرين سريع.",
    grammar: "نقطة قواعد",
    words: "مفردات",
    exercise: "تمرين سريع",
  },
  ary: {
    eyebrow: "مركز القراية",
    title: "كلشي اللي محتاج اليوم",
    intro: "مسار قصير للتعلم والتدريب والمراجعة وتتبع التقدم.",
    tabs: ["خطة اليوم", "القواعد", "الكلمات", "تدريب", "محادثة", "المسار"],
    start: "بدا",
    review: "زيد للمراجعة",
    saved: "محفوظ",
    play: "سمّع النطق",
    search: "قلّب فالكلمات",
    choose: "اختار الجملة الصحيحة",
    correct: "صحيحة",
    tryAgain: "عاود حاول",
    conversation: "طلب شي مشروب",
    conversationText: "تدرّب على حوار مفيد فالقهوة ولا المطعم.",
    roadmap: "مسار القواعد",
    complete: "كملات",
    dailyTitle: "خطة ديال 5 دقايق",
    dailyIntro: "قاعدة وحدة وثلاث كلمات وتمرين سريع.",
    grammar: "نقطة فالقواعد",
    words: "الكلمات",
    exercise: "تمرين سريع",
  },
} as const

export function StudyHub({ locale }: { locale: Locale }) {
  const [tab, setTab] = useState<Tab>("daily")
  const [query, setQuery] = useState("")
  const [saved, setSaved] = useState<string[]>([])
  const [answer, setAnswer] = useState<string | null>(null)
  const t = copy[locale]

  const filteredWords = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase()
    if (!normalized) return vocabulary
    return vocabulary.filter((word) =>
      `${word.hanzi} ${word.pinyin} ${word.en} ${word.ar} ${word.category}`
        .toLocaleLowerCase()
        .includes(normalized),
    )
  }, [query])

  function speak(text: string) {
    if (!("speechSynthesis" in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "zh-CN"
    utterance.rate = 0.8
    window.speechSynthesis.speak(utterance)
  }

  function toggleSaved(word: string) {
    setSaved((current) =>
      current.includes(word)
        ? current.filter((item) => item !== word)
        : [...current, word],
    )
  }

  return (
    <section className="section study-hub" aria-label={t.eyebrow}>
      <header className="study-hub-header">
        <p className="eyebrow">{t.eyebrow}</p>
        <h2>{t.title}</h2>
        <p>{t.intro}</p>
      </header>
      <div className="study-hub-tabs" role="tablist" aria-label={t.eyebrow}>
        {(Object.keys(t.tabs) as Array<keyof typeof t.tabs>).map((key) => {
          const ids: Tab[] = ["daily", "grammar", "vocabulary", "practice", "conversation", "roadmap"]
          const id = ids[Number(key)]
          return (
            <button
              aria-selected={tab === id}
              key={id}
              onClick={() => setTab(id)}
              role="tab"
              type="button"
            >
              {t.tabs[key]}
            </button>
          )
        })}
      </div>
      {tab === "daily" && (
        <div className="study-hub-grid">
          <Card className="study-plan-card">
            <span className="study-card-number">01</span>
            <h3>{t.dailyTitle}</h3>
            <p>{t.dailyIntro}</p>
            <div className="study-plan-list">
              <span><b>{t.grammar}</b>{suppliedGrammarNotes[0].title}</span>
              <span><b>{t.words}</b>{vocabulary.slice(0, 3).map((word) => word.hanzi).join(" · ")}</span>
              <span><b>{t.exercise}</b>{t.choose}</span>
            </div>
          </Card>
          <Card className="study-progress-card">
            <strong>0 / 3</strong>
            <span>{t.complete}</span>
            <div className="study-progress-track"><i /></div>
            <Button onClick={() => setTab("grammar")}>{t.start} <ArrowIcon /></Button>
          </Card>
        </div>
      )}
      {tab === "grammar" && (
        <div className="study-note-grid">
          {suppliedGrammarNotes.map((note) => (
            <Card className="study-note-card" key={note.title}>
              <span>{note.pattern}</span>
              <h3>{note.title}</h3>
              <p>{note.explanation}</p>
              <strong>{note.example}</strong>
              <small>{note.pinyin}</small>
            </Card>
          ))}
        </div>
      )}
      {tab === "vocabulary" && (
        <>
          <label className="study-search">
            <span className="sr-only">{t.search}</span>
            <input onChange={(event) => setQuery(event.target.value)} placeholder={t.search} value={query} />
          </label>
          <div className="study-word-grid">
            {filteredWords.map((word) => (
              <Card className="study-word-card" key={word.hanzi}>
                <span>{word.category}</span>
                <strong>{word.hanzi}</strong>
                <b>{word.pinyin}</b>
                <p>{locale === "en" ? word.en : word.ar}</p>
                <div>
                  <Button variant="secondary" onClick={() => speak(word.hanzi)}>{t.play}</Button>
                  <Button variant="ghost" onClick={() => toggleSaved(word.hanzi)}>
                    {saved.includes(word.hanzi) ? t.saved : t.review}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
      {tab === "practice" && (
        <Card className="study-exercise-card">
          <p className="eyebrow">{t.exercise}</p>
          <h3>{t.choose}</h3>
          <p>How do you say “I am called Lin”?</p>
          <div className="study-answer-grid">
            {["我叫林。", "叫我林。", "林我叫。"].map((option) => (
              <button className={answer === option ? "is-selected" : ""} key={option} onClick={() => setAnswer(option)} type="button">
                {option}
              </button>
            ))}
          </div>
          {answer && <strong className={answer === "我叫林。" ? "study-correct" : "study-wrong"}>{answer === "我叫林。" ? t.correct : t.tryAgain}</strong>}
        </Card>
      )}
      {tab === "conversation" && (
        <Card className="study-conversation-card">
          <span className="study-conversation-character">请</span>
          <div>
            <p className="eyebrow">{t.conversation}</p>
            <h3>{t.conversationText}</h3>
            <p>请给我一杯茶。<br /><small>Qǐng gěi wǒ yì bēi chá.</small></p>
            <Button onClick={() => speak("请给我一杯茶。")}>{t.play}</Button>
          </div>
        </Card>
      )}
      {tab === "roadmap" && (
        <div className="study-roadmap">
          {["Greetings", "Numbers and time", "Family and daily life", "Food and ordering", "Places and directions", "Comparisons"].map((title, index) => (
            <div className={index === 0 ? "is-current" : ""} key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{title}</strong>
              <small>{index === 0 ? t.start : "HSK " + (index < 3 ? "1" : "2")}</small>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

