import { useEffect, useMemo, useState } from "react"
import data from "../data/hsk-packs.json"
import { Button, TextInput } from "./ui"

type Locale = "en" | "ar" | "ary"
type Level = keyof typeof data.packs

const levels = ["1", "2", "3", "4", "5", "6", "7-9"] as const
const pageSize = 25

const content = {
  en: {
    eyebrow: "HSK 3.1 vocabulary",
    title: "250 words for every level.",
    intro:
      "Browse seven focused study packs drawn from the official syllabus sequence. Search by Hanzi or tone-marked pinyin.",
    back: "Back to review",
    search: "Search this 250-word pack",
    source: "Source & methodology",
    sourceBody:
      "HSK mappings and pinyin come from hsk3.1-syllabus 0.1.0 (MIT). Traditional forms and English definitions come from CC-CEDICT via cedict-json under CC BY-SA 4.0. Arabic and Darija meanings remain unpublished until editorial review.",
    level2:
      "The official Level 2 adds only 204 entries. This pack includes all 204 plus 46 Level 1 review words, which retain their original source level.",
    combined:
      "The official syllabus publishes Levels 7–9 as one combined advanced band.",
    review: "Review from Level",
    words: "words",
    noResults: "No words match this search.",
    previous: "Previous",
    next: "Next",
    page: "Page",
    of: "of",
    part: "Part of speech",
    traditional: "Traditional",
    englishMeaning: "English source definition",
  },
  ar: {
    eyebrow: "مفردات HSK 3.1",
    title: "250 كلمة لكل مستوى.",
    intro:
      "تصفّح سبع حزم دراسية مأخوذة من ترتيب المنهج الرسمي. ابحث بالحروف الصينية أو البينيين المشكول بالنبرات.",
    back: "العودة إلى المراجعة",
    search: "ابحث في حزمة الـ250 كلمة",
    source: "المصدر والمنهجية",
    sourceBody:
      "تأتي مستويات HSK والبينيين من hsk3.1-syllabus بترخيص MIT. تأتي الصيغ التقليدية والتعريفات الإنجليزية من CC-CEDICT بترخيص CC BY-SA 4.0. تبقى المعاني العربية والدارجة غير منشورة حتى المراجعة التحريرية.",
    level2:
      "يضيف المستوى الثاني الرسمي 204 مدخلات فقط. تضم هذه الحزمة جميعها مع 46 كلمة مراجعة من المستوى الأول، مع إبقاء مستوى المصدر الأصلي.",
    combined: "ينشر المنهج الرسمي المستويات 7–9 ضمن نطاق متقدم واحد.",
    review: "مراجعة من المستوى",
    words: "كلمة",
    noResults: "لا توجد كلمات مطابقة.",
    previous: "السابق",
    next: "التالي",
    page: "الصفحة",
    of: "من",
    part: "قسم الكلام",
    traditional: "التقليدية",
    englishMeaning: "تعريف المصدر بالإنجليزية",
  },
  ary: {
    eyebrow: "كلمات HSK 3.1",
    title: "250 كلمة فكل مستوى.",
    intro:
      "تصفّح سبعة ديال الحزم من الترتيب الرسمي. قلّب بالحروف الصينية ولا البينيين بالنغمات.",
    back: "رجع للمراجعة",
    search: "قلّب فحزمة 250 كلمة",
    source: "المصدر والطريقة",
    sourceBody:
      "المستويات والبينيين جايين من hsk3.1-syllabus برخصة MIT. الكتابة التقليدية والتعريفات بالإنجليزية جايين من CC-CEDICT برخصة CC BY-SA 4.0. المعاني بالعربية والدارجة باقين ما منشورينش حتى يتراجعو.",
    level2:
      "المستوى الثاني الرسمي فيه غير 204 كلمات جداد. زدنا 46 كلمة للمراجعة من المستوى اللول وبقينا مبيّنين المستوى الأصلي ديالهم.",
    combined: "المنهج الرسمي كيجمع المستويات 7–9 فنطاق متقدم واحد.",
    review: "مراجعة من المستوى",
    words: "كلمة",
    noResults: "ما لقينا حتى كلمة كاتوافق البحث.",
    previous: "اللي قبل",
    next: "اللي من بعد",
    page: "الصفحة",
    of: "من",
    part: "قسم الكلمة",
    traditional: "التقليدية",
    englishMeaning: "التعريف بالإنجليزية",
  },
} as const

export function VocabularyExplorer({
  locale,
  onBack,
}: {
  locale: Locale
  onBack: () => void
}) {
  const [level, setLevel] = useState<Level>("1")
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const t = content[locale]

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase()
    if (!normalized) return data.packs[level]
    return data.packs[level].filter((word) =>
      `${word.hanzi} ${word.pinyin}`.toLocaleLowerCase().includes(normalized),
    )
  }, [level, query])

  useEffect(() => setPage(1), [level, query])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const words = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="section page-view hsk-explorer">
      <Button variant="ghost" onClick={onBack}>
        ← {t.back}
      </Button>
      <header>
        <p className="eyebrow">{t.eyebrow}</p>
        <h1>{t.title}</h1>
        <p>{t.intro}</p>
      </header>
      <div className="level-tabs" aria-label={t.eyebrow}>
        {levels.map((item) => (
          <button
            aria-pressed={level === item}
            key={item}
            onClick={() => setLevel(item)}
            type="button"
          >
            HSK {item}
            <small>250 {t.words}</small>
          </button>
        ))}
      </div>
      <div className="explorer-toolbar">
        <TextInput
          label={t.search}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t.search}
          value={query}
        />
        <span>
          {filtered.length} {t.words}
        </span>
      </div>
      {level === "2" && <p className="pack-note">{t.level2}</p>}
      {level === "7-9" && <p className="pack-note">{t.combined}</p>}
      {words.length ? (
        <div className="hsk-word-grid">
          {words.map((word) => (
            <article key={`${word.level}-${word.id}`}>
              <span className="word-sequence">#{word.id}</span>
              {word.level !== level && (
                <span className="review-badge">
                  {t.review} {word.level}
                </span>
              )}
              <strong>{word.hanzi}</strong>
              {word.traditional && word.traditional !== word.hanzi && (
                <span className="traditional-form">
                  {t.traditional}: {word.traditional}
                </span>
              )}
              <b>{word.pinyin}</b>
              <p className="source-meaning">
                <span>{t.englishMeaning}</span>
                {word.meaningsEn.join("; ")}
              </p>
              <small>
                {t.part}:{" "}
                {word.partsOfSpeech.length
                  ? word.partsOfSpeech.join(" · ")
                  : "—"}
              </small>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state" role="status">
          <strong>{t.noResults}</strong>
        </div>
      )}
      <div className="explorer-pagination">
        <Button
          disabled={page === 1}
          onClick={() => setPage((current) => current - 1)}
          variant="secondary"
        >
          {t.previous}
        </Button>
        <span>
          {t.page} {page} {t.of} {pageCount}
        </span>
        <Button
          disabled={page === pageCount}
          onClick={() => setPage((current) => current + 1)}
          variant="secondary"
        >
          {t.next}
        </Button>
      </div>
      <aside className="source-note">
        <strong>{t.source}</strong>
        <p>{t.sourceBody}</p>
        <small>
          hsk3.1-syllabus@0.1.0 · MIT · CC-CEDICT via cedict-json · CC BY-SA 4.0
        </small>
      </aside>
    </div>
  )
}
