import { useMemo, useState } from "react"
import { ArrowIcon, Button } from "./ui"

type Locale = "en" | "ar" | "ary"
type LocalText = {
  en: string
  ar: string
  ary: string
}

type Unit = {
  id: number
  hsk: 1 | 2 | 3 | 4 | 5 | 6
  title: LocalText
  summary: LocalText
  objective: LocalText
  phrase: string
  pinyin: string
  interactive?: boolean
}

const units: Unit[] = [
  {
    id: 1,
    hsk: 1,
    title: {
      en: "First conversations",
      ar: "المحادثات الأولى",
      ary: "أول محادثات",
    },
    summary: {
      en: "Greet someone, introduce yourself, and close a short exchange.",
      ar: "ألقِ التحية وقدّم نفسك واختتم حواراً قصيراً.",
      ary: "سلّم وقدّم راسك وسالي حوار قصير.",
    },
    objective: {
      en: "Use 你好, 我叫…, and 很高兴认识你 in a natural order.",
      ar: "استخدم 你好 و我叫… و很高兴认识你 بترتيب طبيعي.",
      ary: "استعمل 你好 و我叫… و很高兴认识你 بترتيب طبيعي.",
    },
    phrase: "我叫林，很高兴认识你。",
    pinyin: "Wǒ jiào Lín, hěn gāoxìng rènshi nǐ.",
    interactive: true,
  },
  {
    id: 2,
    hsk: 1,
    title: {
      en: "Numbers and time",
      ar: "الأرقام والوقت",
      ary: "الأرقام والوقت",
    },
    summary: {
      en: "Say ages, prices, dates, phone numbers, and simple times.",
      ar: "قل العمر والسعر والتاريخ ورقم الهاتف والوقت البسيط.",
      ary: "قول العمر والثمن والتاريخ والنمرة والوقت.",
    },
    objective: {
      en: "Ask 几点了? and recognize when 二 changes to 两.",
      ar: "اسأل 几点了؟ وميّز متى تتحول 二 إلى 两.",
      ary: "سول 几点了؟ وفرّق فوقاش 二 كاتولي 两.",
    },
    phrase: "现在几点了？",
    pinyin: "Xiànzài jǐ diǎn le?",
  },
  {
    id: 3,
    hsk: 1,
    title: {
      en: "Family and daily life",
      ar: "العائلة والحياة اليومية",
      ary: "العائلة والنهار العادي",
    },
    summary: {
      en: "Talk about close family, home, and everyday routines.",
      ar: "تحدث عن العائلة القريبة والبيت والروتين اليومي.",
      ary: "هضر على العائلة والدار والروتين ديال النهار.",
    },
    objective: {
      en: "Introduce family members and describe one simple daily action.",
      ar: "عرّف بأفراد العائلة وصف فعلاً يومياً بسيطاً.",
      ary: "عرّف بالعائلة ووصف شي حاجة كتديرها كل نهار.",
    },
    phrase: "这是我的家人。",
    pinyin: "Zhè shì wǒ de jiārén.",
  },
  {
    id: 4,
    hsk: 2,
    title: {
      en: "Food and ordering",
      ar: "الطعام والطلب",
      ary: "الماكلة والطلب",
    },
    summary: {
      en: "Read a simple menu, state preferences, and order shared dishes.",
      ar: "اقرأ قائمة بسيطة واذكر تفضيلاتك واطلب أطباقاً مشتركة.",
      ary: "قرا المينيو، قول شنو كيعجبك، وطلب الماكلة.",
    },
    objective: {
      en: "Order with 我要… and ask whether a dish is spicy.",
      ar: "اطلب باستخدام 我要… واسأل إن كان الطبق حاراً.",
      ary: "طلب بـ我要… وسول واش الماكلة حارة.",
    },
    phrase: "这个菜辣不辣？",
    pinyin: "Zhège cài là bu là?",
  },
  {
    id: 5,
    hsk: 2,
    title: {
      en: "Places and directions",
      ar: "الأماكن والاتجاهات",
      ary: "البلايص والطريق",
    },
    summary: {
      en: "Locate common places and follow short walking directions.",
      ar: "حدّد الأماكن الشائعة واتبع إرشادات قصيرة للمشي.",
      ary: "عرف البلايص وتبع شرح قصير للطريق.",
    },
    objective: {
      en: "Combine 在哪里, 往前走, 左边, and 右边.",
      ar: "اجمع بين 在哪里 و往前走 و左边 و右边.",
      ary: "جمع بين 在哪里 و往前走 و左边 و右边.",
    },
    phrase: "地铁站在哪里？",
    pinyin: "Dìtiě zhàn zài nǎlǐ?",
  },
  {
    id: 6,
    hsk: 2,
    title: { en: "Weather and plans", ar: "الطقس والخطط", ary: "الجو والخطط" },
    summary: {
      en: "Describe today’s weather and make a simple plan for tomorrow.",
      ar: "صف طقس اليوم وضع خطة بسيطة للغد.",
      ary: "وصف الجو ديال اليوم ودير خطة لغدا.",
    },
    objective: {
      en: "Use 会 for forecasts and 要 for intended actions.",
      ar: "استخدم 会 للتوقعات و要 للأفعال المقصودة.",
      ary: "استعمل 会 للتوقع و要 للحاجة اللي ناوي تدير.",
    },
    phrase: "明天可能会下雨。",
    pinyin: "Míngtiān kěnéng huì xiàyǔ.",
  },
  {
    id: 7,
    hsk: 3,
    title: {
      en: "Study and work",
      ar: "الدراسة والعمل",
      ary: "القراية والخدمة",
    },
    summary: {
      en: "Explain schedules, responsibilities, and recent progress.",
      ar: "اشرح الجداول والمسؤوليات والتقدّم الأخير.",
      ary: "شرح الوقت والمسؤوليات والتقدّم ديالك.",
    },
    objective: {
      en: "Connect actions with 先…然后… and describe completed work.",
      ar: "اربط الأفعال بـ先…然后… وصف العمل المكتمل.",
      ary: "ربط الأفعال بـ先…然后… وهضر على الخدمة اللي سالات.",
    },
    phrase: "我先开会，然后写报告。",
    pinyin: "Wǒ xiān kāihuì, ránhòu xiě bàogào.",
  },
  {
    id: 8,
    hsk: 3,
    title: {
      en: "Travel and transport",
      ar: "السفر والمواصلات",
      ary: "السفر والمواصلات",
    },
    summary: {
      en: "Compare routes, buy tickets, and handle common travel changes.",
      ar: "قارن الطرق واشترِ التذاكر وتعامل مع تغييرات السفر.",
      ary: "قارن الطريق، شري التذاكر، وتعامل مع التبديلات.",
    },
    objective: {
      en: "Ask about departure, arrival, duration, and ticket changes.",
      ar: "اسأل عن المغادرة والوصول والمدة وتغيير التذكرة.",
      ary: "سول على الخروج والوصول والمدة وتبديل التذكرة.",
    },
    phrase: "这趟车几点出发？",
    pinyin: "Zhè tàng chē jǐ diǎn chūfā?",
  },
  {
    id: 9,
    hsk: 3,
    title: {
      en: "Health and everyday needs",
      ar: "الصحة والاحتياجات اليومية",
      ary: "الصحة والحاجات اليومية",
    },
    summary: {
      en: "Describe common symptoms and ask for practical help.",
      ar: "صف الأعراض الشائعة واطلب مساعدة عملية.",
      ary: "وصف الأعراض وطلب المساعدة.",
    },
    objective: {
      en: "State where something hurts and how long it has continued.",
      ar: "اذكر موضع الألم ومدة استمراره.",
      ary: "قول فين كيوجعك وشحال هادي بدا.",
    },
    phrase: "我头疼了两天。",
    pinyin: "Wǒ tóuténg le liǎng tiān.",
  },
  {
    id: 10,
    hsk: 4,
    title: {
      en: "Opinions and media",
      ar: "الآراء والإعلام",
      ary: "الآراء والإعلام",
    },
    summary: {
      en: "Summarize a short report and support a personal opinion.",
      ar: "لخّص تقريراً قصيراً وادعم رأياً شخصياً.",
      ary: "لخص خبر قصير وشرح الرأي ديالك.",
    },
    objective: {
      en: "Contrast viewpoints with 虽然…但是… and explain a reason.",
      ar: "قارن الآراء باستخدام 虽然…但是… واشرح السبب.",
      ary: "قارن الآراء بـ虽然…但是… وشرح علاش.",
    },
    phrase: "虽然方便，但是也有问题。",
    pinyin: "Suīrán fāngbiàn, dànshì yě yǒu wèntí.",
  },
  {
    id: 11,
    hsk: 4,
    title: {
      en: "Relationships and social life",
      ar: "العلاقات والحياة الاجتماعية",
      ary: "العلاقات والحياة الاجتماعية",
    },
    summary: {
      en: "Describe personalities, resolve misunderstandings, and make invitations.",
      ar: "صف الشخصيات وحل سوء الفهم وقدم الدعوات.",
      ary: "وصف الناس، حل سوء الفهم، ودير العروض.",
    },
    objective: {
      en: "Use 越来越 and communicate a polite disagreement.",
      ar: "استخدم 越来越 وعبّر عن اختلاف مهذب.",
      ary: "استعمل 越来越 وعبّر على الاختلاف بأدب.",
    },
    phrase: "我们越来越了解对方了。",
    pinyin: "Wǒmen yuèláiyuè liǎojiě duìfāng le.",
  },
  {
    id: 12,
    hsk: 4,
    title: {
      en: "Cities and the environment",
      ar: "المدن والبيئة",
      ary: "المدن والبيئة",
    },
    summary: {
      en: "Discuss public space, transport, pollution, and neighborhood change.",
      ar: "ناقش الفضاء العام والمواصلات والتلوث وتغير الأحياء.",
      ary: "هضر على الفضاء العام والمواصلات والتلوث وتبدل الحومة.",
    },
    objective: {
      en: "Describe cause and effect with 因为, 因此, and 影响.",
      ar: "صف السبب والنتيجة باستخدام 因为 و因此 و影响.",
      ary: "شرح السبب والنتيجة بـ因为 و因此 و影响.",
    },
    phrase: "公共交通减少了污染。",
    pinyin: "Gōnggòng jiāotōng jiǎnshǎo le wūrǎn.",
  },
  {
    id: 13,
    hsk: 5,
    title: {
      en: "News and public discussion",
      ar: "الأخبار والنقاش العام",
      ary: "الأخبار والنقاش العام",
    },
    summary: {
      en: "Identify claims, evidence, quotations, and uncertainty in news.",
      ar: "ميّز الادعاءات والأدلة والاقتباسات وعدم اليقين في الأخبار.",
      ary: "فرّق بين الادعاء والدليل والاقتباس وعدم اليقين فالخبر.",
    },
    objective: {
      en: "Report information without presenting uncertain claims as facts.",
      ar: "انقل المعلومات دون تقديم الادعاءات غير المؤكدة كحقائق.",
      ary: "نقل المعلومة بلا ما تقدم شي حاجة ما مؤكداش كحقيقة.",
    },
    phrase: "据报道，目前还没有结论。",
    pinyin: "Jù bàodào, mùqián hái méiyǒu jiélùn.",
  },
  {
    id: 14,
    hsk: 5,
    title: {
      en: "Culture and history",
      ar: "الثقافة والتاريخ",
      ary: "الثقافة والتاريخ",
    },
    summary: {
      en: "Read explanations of customs while separating history from legend.",
      ar: "اقرأ شروح العادات مع الفصل بين التاريخ والأسطورة.",
      ary: "قرا على العادات وفرّق بين التاريخ والحكاية.",
    },
    objective: {
      en: "Sequence events and qualify sources with 据说 and 记载.",
      ar: "رتب الأحداث وقيّد المصادر باستخدام 据说 و记载.",
      ary: "رتب الأحداث وبيّن المصدر بـ据说 و记载.",
    },
    phrase: "根据历史记载，这个习俗很早就有了。",
    pinyin: "Gēnjù lìshǐ jìzǎi, zhège xísú hěn zǎo jiù yǒu le.",
  },
  {
    id: 15,
    hsk: 5,
    title: {
      en: "Formal communication",
      ar: "التواصل الرسمي",
      ary: "التواصل الرسمي",
    },
    summary: {
      en: "Write structured messages, requests, summaries, and short reports.",
      ar: "اكتب رسائل وطلبات وملخصات وتقارير قصيرة ومنظمة.",
      ary: "كتب رسائل وطلبات وملخصات وتقارير مرتبين.",
    },
    objective: {
      en: "Adjust tone for colleagues, institutions, and unfamiliar readers.",
      ar: "كيّف النبرة للزملاء والمؤسسات والقراء غير المعروفين.",
      ary: "بدّل النبرة حسب الزملاء والمؤسسات والناس اللي ما كتعرفهمش.",
    },
    phrase: "感谢您的理解与配合。",
    pinyin: "Gǎnxiè nín de lǐjiě yǔ pèihé.",
  },
  {
    id: 16,
    hsk: 6,
    title: {
      en: "Argument and nuance",
      ar: "الحجّة والدقة",
      ary: "الحجة والدقة",
    },
    summary: {
      en: "Build a balanced argument and respond to counterarguments.",
      ar: "ابنِ حجة متوازنة ورد على الحجج المضادة.",
      ary: "بني حجة متوازنة وجاوب على الرأي المخالف.",
    },
    objective: {
      en: "Use concessions, conditions, and precise degrees of certainty.",
      ar: "استخدم الاستدراك والشروط ودرجات دقيقة من اليقين.",
      ary: "استعمل الاستدراك والشروط وبيّن شحال متأكد.",
    },
    phrase: "即使存在风险，也不能忽视它的价值。",
    pinyin: "Jíshǐ cúnzài fēngxiǎn, yě bù néng hūshì tā de jiàzhí.",
  },
  {
    id: 17,
    hsk: 6,
    title: {
      en: "Literature and storytelling",
      ar: "الأدب والسرد",
      ary: "الأدب والحكاية",
    },
    summary: {
      en: "Follow viewpoint, imagery, implication, and shifts in narrative time.",
      ar: "تابع وجهة النظر والصورة والإيحاء والتحولات الزمنية في السرد.",
      ary: "تبع وجهة النظر والصور والمعنى وتبدل الوقت فالحكاية.",
    },
    objective: {
      en: "Retell a passage while preserving tone and implied meaning.",
      ar: "أعد سرد فقرة مع الحفاظ على النبرة والمعنى الضمني.",
      ary: "عاود الحكاية وخلي نفس النبرة والمعنى اللي ما تقالش مباشرة.",
    },
    phrase: "他没有回答，只是望着窗外。",
    pinyin: "Tā méiyǒu huídá, zhǐshì wàngzhe chuāngwài.",
  },
  {
    id: 18,
    hsk: 6,
    title: {
      en: "Research and professional language",
      ar: "لغة البحث والعمل",
      ary: "لغة البحث والخدمة",
    },
    summary: {
      en: "Explain methods, limitations, trends, and recommendations clearly.",
      ar: "اشرح المنهج والقيود والاتجاهات والتوصيات بوضوح.",
      ary: "شرح الطريقة والحدود والتوجهات والتوصيات بوضوح.",
    },
    objective: {
      en: "Present cautious conclusions supported by specific observations.",
      ar: "قدّم استنتاجات حذرة تدعمها ملاحظات محددة.",
      ary: "قدم نتائج بحذر ودعمها بملاحظات واضحة.",
    },
    phrase: "研究结果表明，这一趋势仍在继续。",
    pinyin: "Yánjiū jiéguǒ biǎomíng, zhè yí qūshì réng zài jìxù.",
  },
]

const copy = {
  en: {
    eyebrow: "Curriculum map",
    title: "18 units, one connected path.",
    intro:
      "Explore practical outcomes from first greetings through advanced professional language. Unit 1 includes an interactive exercise; every other unit currently provides a transparent study guide.",
    all: "All levels",
    unit: "Unit",
    guide: "Study guide",
    interactive: "Interactive",
    objective: "Learning objective",
    key: "Key language",
    start: "Start interactive unit",
  },
  ar: {
    eyebrow: "خريطة المنهج",
    title: "18 وحدة في مسار مترابط.",
    intro:
      "استكشف أهدافاً عملية من التحيات الأولى إلى اللغة المهنية المتقدمة. تتضمن الوحدة الأولى تمريناً تفاعلياً، وتقدم بقية الوحدات أدلة دراسية واضحة.",
    all: "كل المستويات",
    unit: "الوحدة",
    guide: "دليل دراسي",
    interactive: "تفاعلية",
    objective: "هدف التعلّم",
    key: "لغة أساسية",
    start: "ابدأ الوحدة التفاعلية",
  },
  ary: {
    eyebrow: "خريطة البرنامج",
    title: "18 وحدة فمسار واحد.",
    intro:
      "اكتاشف أهداف عملية من أول سلام حتى للغة المهنية المتقدمة. الوحدة اللولة فيها تمرين تفاعلي، والباقي فيهم دلائل واضحة للقراية.",
    all: "المستويات كاملين",
    unit: "الوحدة",
    guide: "دليل للقراية",
    interactive: "تفاعلية",
    objective: "هدف التعلّم",
    key: "اللغة الأساسية",
    start: "بدا الوحدة التفاعلية",
  },
} as const

export function CurriculumCatalog({
  locale,
  onStart,
}: {
  locale: Locale
  onStart: () => void
}) {
  const [level, setLevel] = useState<"all" | 1 | 2 | 3 | 4 | 5 | 6>("all")
  const t = copy[locale]
  const filtered = useMemo(
    () =>
      level === "all" ? units : units.filter((unit) => unit.hsk === level),
    [level],
  )

  return (
    <section className="curriculum-catalog">
      <header>
        <p className="eyebrow">{t.eyebrow}</p>
        <h2>{t.title}</h2>
        <p>{t.intro}</p>
      </header>
      <div className="curriculum-filters">
        <button
          aria-pressed={level === "all"}
          onClick={() => setLevel("all")}
          type="button"
        >
          {t.all}
        </button>
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <button
            aria-pressed={level === item}
            key={item}
            onClick={() => setLevel(item as 1 | 2 | 3 | 4 | 5 | 6)}
            type="button"
          >
            HSK {item}
          </button>
        ))}
      </div>
      <div className="unit-catalog-grid">
        {filtered.map((unit) => (
          <details className="unit-outline" key={unit.id} open={unit.id === 1}>
            <summary>
              <span className="unit-index">
                {String(unit.id).padStart(2, "0")}
              </span>
              <div>
                <small>
                  HSK {unit.hsk} · {t.unit} {unit.id}
                </small>
                <strong>{unit.title[locale]}</strong>
                <p>{unit.summary[locale]}</p>
              </div>
              <span
                className={
                  unit.interactive ? "unit-status is-live" : "unit-status"
                }
              >
                {unit.interactive ? t.interactive : t.guide}
              </span>
            </summary>
            <div className="unit-outline-body">
              <div>
                <span>{t.objective}</span>
                <p>{unit.objective[locale]}</p>
              </div>
              <div className="unit-key-language">
                <span>{t.key}</span>
                <strong>{unit.phrase}</strong>
                <small>{unit.pinyin}</small>
              </div>
              {unit.interactive && (
                <Button onClick={onStart}>
                  {t.start} <ArrowIcon />
                </Button>
              )}
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}
