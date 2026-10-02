import { useMemo, useState } from "react"
import { ArrowIcon, Button, Card, TextInput } from "./ui"

type Locale = "en" | "ar" | "ary"
type Category = "all" | "cities" | "food" | "traditions" | "language" | "travel"

type LocalText = {
  en: string
  ar: string
  ary: string
}

type Story = {
  id: string
  category: Exclude<Category, "all">
  title: LocalText
  summary: LocalText
  detail: LocalText
  hanzi: string
  pinyin: string
  image?: {
    url: string
    credit: string
    alt: LocalText
  }
}

type CategoryOption = {
  id: Category
  label: LocalText
}

const text = {
  en: {
    eyebrow: "Culture & place",
    title: "Meet the world behind the words.",
    intro:
      "Explore daily rituals, regional voices, food culture, cities, and practical travel context. Every note includes language you can recognize in real life.",
    search: "Search culture, cities, food, or phrases",
    featured: "Featured city story",
    read: "Read the complete guide",
    library: "Explore the library",
    results: "stories",
    note: "Open cultural note",
    noResults: "No stories match these filters.",
    vocabulary: "Language in context",
    calendar: "A year of traditions",
    calendarIntro:
      "Festival dates follow the lunar calendar and change each year. These are cultural overviews, not fixed calendar dates.",
  },
  ar: {
    eyebrow: "الثقافة والمكان",
    title: "اكتشف العالم وراء الكلمات.",
    intro:
      "استكشف العادات اليومية والأصوات الإقليمية وثقافة الطعام والمدن وسياق السفر. تتضمن كل ملاحظة لغة يمكنك تمييزها في الحياة الواقعية.",
    search: "ابحث في الثقافة أو المدن أو الطعام أو العبارات",
    featured: "قصة مدينة مختارة",
    read: "اقرأ الدليل الكامل",
    library: "استكشف المكتبة",
    results: "موضوعاً",
    note: "افتح الملاحظة الثقافية",
    noResults: "لا توجد موضوعات مطابقة.",
    vocabulary: "اللغة في سياقها",
    calendar: "عام من التقاليد",
    calendarIntro:
      "تتبع مواعيد الأعياد التقويم القمري وتتغير كل عام. هذه لمحات ثقافية وليست تواريخ ثابتة.",
  },
  ary: {
    eyebrow: "الثقافة والبلايص",
    title: "تعرّف على العالم اللي ورا الكلمات.",
    intro:
      "اكتاشف العادات اليومية، اللهجات، الماكلة، المدن، والسفر. كل معلومة فيها لغة تقدر تسمعها وتستعملها فالحياة.",
    search: "قلّب فالثقافة ولا المدن ولا الماكلة ولا الجمل",
    featured: "حكاية مدينة مختارة",
    read: "قرا الدليل كامل",
    library: "اكتاشف المكتبة",
    results: "مواضيع",
    note: "حلّ المعلومة الثقافية",
    noResults: "ما لقينا حتى موضوع كايوافق البحث.",
    vocabulary: "اللغة فالسياق",
    calendar: "عام ديال التقاليد",
    calendarIntro:
      "مواعيد الأعياد كيتبعو التقويم القمري وكيتبدلو كل عام. هادو معلومات ثقافية وماشي تواريخ ثابتة.",
  },
} as const

const categories: CategoryOption[] = [
  {
    id: "all",
    label: { en: "All stories", ar: "كل الموضوعات", ary: "كاملين" },
  },
  { id: "cities", label: { en: "Cities", ar: "المدن", ary: "المدن" } },
  { id: "food", label: { en: "Food", ar: "الطعام", ary: "الماكلة" } },
  {
    id: "traditions",
    label: { en: "Traditions", ar: "التقاليد", ary: "العادات" },
  },
  { id: "language", label: { en: "Language", ar: "اللغة", ary: "اللغة" } },
  { id: "travel", label: { en: "Travel", ar: "السفر", ary: "السفر" } },
]

const stories: Story[] = [
  {
    id: "tea-etiquette",
    category: "traditions",
    title: {
      en: "The quiet language of tea",
      ar: "لغة الشاي الهادئة",
      ary: "اللغة الهادية ديال أتاي",
    },
    summary: {
      en: "Small gestures around pouring and receiving tea carry warmth and respect.",
      ar: "تحمل الإيماءات الصغيرة عند صب الشاي وتلقيه معاني الود والاحترام.",
      ary: "الحركات الصغار ملي كيتصب أتاي فيهم الترحيب والاحترام.",
    },
    detail: {
      en: "In many settings, the host refills cups before they are completely empty. A light verbal 谢谢 is always appropriate; regional finger-tapping customs are optional rather than universal.",
      ar: "في كثير من المجالس يملأ المضيف الكوب قبل أن يفرغ تماماً. قول 谢谢 مناسب دائماً، أما النقر بالأصابع فعادة إقليمية وليست قاعدة عامة.",
      ary: "فبزاف ديال الجلسات، مول الدار كيزيد أتاي قبل ما يفرغ الكاس. 谢谢 ديما مناسبة، أما الضرب بالصبيعات فعادة ديال شي مناطق وماشي قاعدة.",
    },
    hanzi: "请喝茶",
    pinyin: "qǐng hē chá",
    image: {
      url: "/images/tea-set.jpg",
      credit: "五玄土 ORIENTO",
      alt: {
        en: "Tea cups arranged on a table",
        ar: "أكواب شاي مرتبة على طاولة",
        ary: "كيسان ديال أتاي فوق الطابلة",
      },
    },
  },
  {
    id: "lanterns",
    category: "traditions",
    title: {
      en: "Why lanterns glow red",
      ar: "لماذا تتوهج الفوانيس بالأحمر",
      ary: "علاش الفوانيس حمرين",
    },
    summary: {
      en: "Color, reunion, and public celebration meet in one familiar symbol.",
      ar: "يجتمع اللون ولمّ الشمل والاحتفال العام في رمز مألوف.",
      ary: "اللون واللمة والاحتفال كيتجمعو فرمزة وحدة معروفة.",
    },
    detail: {
      en: "Red is strongly associated with celebration and good fortune. Lantern displays are especially visible around Spring Festival and the Lantern Festival, but styles and local customs vary.",
      ar: "يرتبط الأحمر بقوة بالاحتفال والحظ السعيد. تظهر الفوانيس خصوصاً حول عيد الربيع وعيد الفوانيس، مع اختلاف العادات بين المناطق.",
      ary: "الحمر مرتبط بالفرحة والزهر. الفوانيس كيبانو بزاف فعيد الربيع وعيد الفوانيس، والعادات كتختلف من بلاصة لبلاصة.",
    },
    hanzi: "灯笼",
    pinyin: "dēnglong",
    image: {
      url: "/images/lanterns.jpg",
      credit: "Yubin Zhou",
      alt: {
        en: "Rows of red and gold Chinese lanterns",
        ar: "صفوف من الفوانيس الصينية الحمراء والذهبية",
        ary: "صفوف ديال الفوانيس الصينية الحمر والذهبيين",
      },
    },
  },
  {
    id: "water-towns",
    category: "cities",
    title: {
      en: "Water towns south of the Yangtze",
      ar: "المدن المائية جنوب اليانغتسي",
      ary: "مدن الما جنوب اليانغتسي",
    },
    summary: {
      en: "Canals, stone bridges, and white-walled homes shape the Jiangnan landscape.",
      ar: "ترسم القنوات والجسور الحجرية والبيوت البيضاء مشهد جيانغنان.",
      ary: "القنوات والقناطر والديور البيض كيعطيو شكل خاص لجيانغنان.",
    },
    detail: {
      en: "江南 literally means “south of the river” and commonly evokes the lower Yangtze region. Towns such as Zhouzhuang and Wuzhen developed around waterways, trade, and dense neighborhood life.",
      ar: "تعني 江南 حرفياً «جنوب النهر» وتشير غالباً إلى منطقة اليانغتسي السفلى. نشأت مدن مثل تشوجوانغ ووتشن حول الماء والتجارة والأحياء المتقاربة.",
      ary: "江南 كتعني حرفياً «جنوب النهر» وكتشير لمنطقة اليانغتسي السفلى. مدن بحال تشوجوانغ ووتشن كبرو حدا الما والتجارة.",
    },
    hanzi: "江南水乡",
    pinyin: "Jiāngnán shuǐxiāng",
    image: {
      url: "/images/water-town.jpg",
      credit: "Matt Zhang",
      alt: {
        en: "White and dark traditional houses beside water",
        ar: "بيوت تقليدية بيضاء وداكنة بجانب الماء",
        ary: "ديور تقليدية بيض وكحلين حدا الما",
      },
    },
  },
  {
    id: "chengdu",
    category: "cities",
    title: {
      en: "Chengdu at teahouse pace",
      ar: "تشنغدو على إيقاع دار الشاي",
      ary: "تشنغدو بريتم دار أتاي",
    },
    summary: {
      en: "Public parks and teahouses make conversation part of the city’s daily rhythm.",
      ar: "تجعل الحدائق العامة ودور الشاي الحديث جزءاً من إيقاع المدينة اليومي.",
      ary: "الجناين وديور أتاي كيخليو الهدرة جزء من نهار المدينة.",
    },
    detail: {
      en: "Chengdu is often described through a relaxed lifestyle, but it is also a major modern city. In a teahouse, 一碗茶 refers to a bowl or lidded cup of tea rather than a Western-style teacup.",
      ar: "تُوصف تشنغدو بنمطها الهادئ، لكنها أيضاً مدينة حديثة كبرى. في دار الشاي تشير 一碗茶 إلى وعاء أو كوب مغطى، لا إلى فنجان غربي.",
      ary: "تشنغدو معروفة بالجو الهاني ولكنها حتى مدينة عصرية كبيرة. فدار أتاي، 一碗茶 كتعني زلافة ولا كاس مغطى وماشي فنجان غربي.",
    },
    hanzi: "慢慢来",
    pinyin: "mànmàn lái",
  },
  {
    id: "breakfast",
    category: "food",
    title: {
      en: "Breakfast is local",
      ar: "الفطور محلي",
      ary: "الفطور ديال كل بلاصة",
    },
    summary: {
      en: "There is no single Chinese breakfast: climate and region shape the morning table.",
      ar: "لا يوجد فطور صيني واحد؛ يشكل المناخ والمنطقة مائدة الصباح.",
      ary: "ما كاينش فطور صيني واحد؛ كل منطقة والجو ديالها كيشكلو المائدة.",
    },
    detail: {
      en: "Soy milk and youtiao are common in many cities, while rice noodles, congee, steamed buns, and savory pancakes have strong regional homes. Ask 你早上吃什么? to begin a real conversation.",
      ar: "ينتشر حليب الصويا ويوتياو في مدن كثيرة، بينما ترتبط نودلز الأرز والعصيدة والخبز المطهو على البخار بمناطق مختلفة. اسأل 你早上吃什么؟ لبدء حوار.",
      ary: "حليب الصوجا ويوتياو معروفين فمدن كثيرة، والنودلز والعصيدة والخبز مفور كل واحد مشهور فمنطقة. سول 你早上吃什么؟ باش تبدا الهدرة.",
    },
    hanzi: "早饭",
    pinyin: "zǎofàn",
  },
  {
    id: "ordering",
    category: "food",
    title: {
      en: "Ordering without over-ordering",
      ar: "الطلب دون إسراف",
      ary: "طلب الماكلة بلا تبذير",
    },
    summary: {
      en: "Shared dishes change how quantities, preferences, and the bill are discussed.",
      ar: "تغيّر الأطباق المشتركة طريقة الحديث عن الكمية والتفضيلات والحساب.",
      ary: "المواعن المشتركة كيبدلو كيفاش كنهضرو على الكمية والحساب.",
    },
    detail: {
      en: "Dishes are commonly shared. Start with 我们先点这些 and add more if needed. 打包 means to pack leftovers to take away, a useful phrase for reducing waste.",
      ar: "تُشارك الأطباق غالباً. ابدأ بـ我们先点这些 ثم أضف عند الحاجة. تعني 打包 توضيب البقايا لأخذها، وهي عبارة مفيدة لتقليل الهدر.",
      ary: "غالباً الماكلة كتكون مشتركة. بدا بـ我们先点这些 وزيد إلا خاص. 打包 كتعني تجمع الباقي تاخذو معاك.",
    },
    hanzi: "我们先点这些",
    pinyin: "wǒmen xiān diǎn zhèxiē",
  },
  {
    id: "dialects",
    category: "language",
    title: {
      en: "One writing system, many voices",
      ar: "نظام كتابة واحد وأصوات كثيرة",
      ary: "كتابة وحدة وأصوات بزاف",
    },
    summary: {
      en: "Mandarin is the standard spoken language, while regional varieties remain central to identity.",
      ar: "الماندرين هي اللغة المنطوقة المعيارية، وتبقى التنوعات الإقليمية جزءاً من الهوية.",
      ary: "الماندرين هي اللغة المعيارية، واللهجات المحلية باقيين مهمين فالهوية.",
    },
    detail: {
      en: "普通话 is Standard Mandarin. Cantonese, Shanghainese, Hokkien, Hakka, and many other Sinitic varieties can differ greatly in sound and vocabulary. Calling all of them “dialects” can hide that diversity.",
      ar: "تعني 普通话 الماندرين المعيارية. تختلف الكانتونية والشنغهاوية والهوكيين والهاكا وغيرها كثيراً في الصوت والمفردات، وكلمة «لهجات» لا تُظهر دائماً حجم التنوع.",
      ary: "普通话 هي الماندرين المعيارية. الكانتونية والشانغهاوية والهوكيين والهاكا مختلفين بزاف فالصوت والكلمات، وكلمة «لهجات» ما كتبينش التنوع كامل.",
    },
    hanzi: "普通话",
    pinyin: "pǔtōnghuà",
  },
  {
    id: "politeness",
    category: "language",
    title: {
      en: "Politeness beyond 请 and 谢谢",
      ar: "اللباقة أبعد من 请 و谢谢",
      ary: "الأدب ماشي غير 请 و谢谢",
    },
    summary: {
      en: "Tone, context, and softening phrases often matter more than translating “please.”",
      ar: "غالباً ما تهم النبرة والسياق وعبارات التلطيف أكثر من ترجمة «من فضلك».",
      ary: "النبرة والسياق وطريقة الطلب مرات أهم من ترجمة «عافاك».",
    },
    detail: {
      en: "请 is useful but not inserted into every request. 可以…吗? and 麻烦你… soften requests naturally. Address terms and the relationship between speakers also shape what sounds polite.",
      ar: "كلمة 请 مفيدة لكنها لا تدخل في كل طلب. تلطف 可以…吗؟ و麻烦你… الطلب بصورة طبيعية، كما تؤثر العلاقة بين المتحدثين.",
      ary: "请 مفيدة ولكن ما كتدخلش فكل طلب. 可以…吗؟ و麻烦你… كيلطفو الطلب، والعلاقة بين الناس حتى هي مهمة.",
    },
    hanzi: "麻烦你了",
    pinyin: "máfan nǐ le",
  },
  {
    id: "rail",
    category: "travel",
    title: {
      en: "Reading a high-speed rail ticket",
      ar: "قراءة تذكرة القطار السريع",
      ary: "كيفاش تقرا تذكرة الطران السريع",
    },
    summary: {
      en: "Station names, gates, carriage numbers, and seat letters each have a practical label.",
      ar: "لأسماء المحطات والبوابات والعربات والمقاعد تسميات عملية مهمة.",
      ary: "المحطة والباب والعربة والبلاصة كل وحدة عندها كلمة مفيدة.",
    },
    detail: {
      en: "Look for 车次 (train number), 检票口 (ticket gate), 车厢 (carriage), and 座位 (seat). Large cities can have several stations, so confirm the full station name rather than only the city.",
      ar: "ابحث عن 车次 رقم القطار، و检票口 بوابة التحقق، و车厢 العربة، و座位 المقعد. قد تضم المدن الكبيرة محطات عدة، فتحقق من الاسم الكامل.",
      ary: "قلّب على 车次 رقم الطران، 检票口 الباب، 车厢 العربة، و座位 البلاصة. المدن الكبار فيهم محطات بزاف، تأكد من السمية كاملة.",
    },
    hanzi: "高铁",
    pinyin: "gāotiě",
  },
  {
    id: "gifts",
    category: "travel",
    title: {
      en: "A thoughtful gift, simply given",
      ar: "هدية مدروسة ببساطة",
      ary: "هدية مزيانة وبسيطة",
    },
    summary: {
      en: "Context matters more than memorizing a long list of symbolic rules.",
      ar: "السياق أهم من حفظ قائمة طويلة من القواعد الرمزية.",
      ary: "السياق أهم من تحفظ لائحة طويلة ديال القواعد.",
    },
    detail: {
      en: "Regional and family habits vary. A modest local specialty is often a safe choice. Presenting and receiving an item with both hands can signal care, but natural warmth matters more than perfect choreography.",
      ar: "تختلف العادات حسب المنطقة والعائلة. غالباً يكون منتج محلي بسيط خياراً مناسباً. قد يدل تقديم الهدية بكلتا اليدين على الاهتمام، لكن الود الطبيعي أهم.",
      ary: "العادات كتختلف بين المناطق والعائلات. شي حاجة محلية وبسيطة اختيار مزيان. تعطي الهدية بجوج يديك كيبين الاهتمام، ولكن الترحيب الطبيعي أهم.",
    },
    hanzi: "一点心意",
    pinyin: "yìdiǎn xīnyì",
  },
]

const calendar = [
  {
    hanzi: "春节",
    pinyin: "Chūnjié",
    en: "Spring Festival",
    ar: "عيد الربيع",
    ary: "عيد الربيع",
  },
  {
    hanzi: "清明节",
    pinyin: "Qīngmíngjié",
    en: "Qingming Festival",
    ar: "عيد تشينغمينغ",
    ary: "عيد تشينغمينغ",
  },
  {
    hanzi: "端午节",
    pinyin: "Duānwǔjié",
    en: "Dragon Boat Festival",
    ar: "عيد قوارب التنين",
    ary: "عيد قوارب التنين",
  },
  {
    hanzi: "中秋节",
    pinyin: "Zhōngqiūjié",
    en: "Mid-Autumn Festival",
    ar: "عيد منتصف الخريف",
    ary: "عيد وسط الخريف",
  },
] as const

export function DiscoverHub({
  locale,
  onOpenArticle,
}: {
  locale: Locale
  onOpenArticle: () => void
}) {
  const [category, setCategory] = useState<Category>("all")
  const [query, setQuery] = useState("")
  const t = text[locale]

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase()
    return stories.filter((story) => {
      if (category !== "all" && story.category !== category) return false
      if (!normalized) return true
      return `${story.title[locale]} ${story.summary[locale]} ${story.hanzi} ${story.pinyin}`
        .toLocaleLowerCase()
        .includes(normalized)
    })
  }, [category, locale, query])

  return (
    <div className="section page-view discover-hub">
      <header>
        <p className="eyebrow">{t.eyebrow}</p>
        <h1>{t.title}</h1>
        <p>{t.intro}</p>
      </header>

      <article className="discover-feature">
        <img
          alt={
            locale === "en"
              ? "A rainy traditional street in Shanghai"
              : locale === "ar"
                ? "شارع تقليدي ممطر في شنغهاي"
                : "زنقة تقليدية فيها الشتا فشانغهاي"
          }
          src="/images/shanghai-rain.jpg"
        />
        <div>
          <span>{t.featured}</span>
          <h2>
            {
              {
                en: "Rainy streets, warm tea",
                ar: "شوارع ممطرة وشاي دافئ",
                ary: "الشتا فالزنقة وأتاي سخون",
              }[locale]
            }
          </h2>
          <p>
            {
              {
                en: "Everyday phrases for an unhurried afternoon in Shanghai’s older neighborhoods.",
                ar: "عبارات يومية لظهيرة هادئة في أحياء شنغهاي القديمة.",
                ary: "جمل يومية فواحد العشية هانية فأحياء شانغهاي القديمة.",
              }[locale]
            }
          </p>
          <Button onClick={onOpenArticle}>
            {t.read} <ArrowIcon />
          </Button>
        </div>
      </article>
      <p className="discover-credit">Photo: Nuno Alberto · Unsplash</p>

      <section className="discover-library">
        <div className="discover-heading">
          <div>
            <p className="eyebrow">{t.library}</p>
            <h2>
              {filtered.length} {t.results}
            </h2>
          </div>
          <TextInput
            label={t.search}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.search}
            value={query}
          />
        </div>
        <div className="culture-filters">
          {categories.map((item) => (
            <button
              aria-pressed={category === item.id}
              key={item.id}
              onClick={() => setCategory(item.id)}
              type="button"
            >
              {item.label[locale]}
            </button>
          ))}
        </div>
        {filtered.length ? (
          <div className="story-grid">
            {filtered.map((story) => (
              <Card className="story-card" key={story.id}>
                {story.image && (
                  <figure>
                    <img
                      alt={story.image.alt[locale]}
                      loading="lazy"
                      src={story.image.url}
                    />
                    <figcaption>
                      Photo: {story.image.credit} · Unsplash
                    </figcaption>
                  </figure>
                )}
                <div className="story-content">
                  <span>
                    {
                      categories.find((item) => item.id === story.category)
                        ?.label[locale]
                    }
                  </span>
                  <h3>{story.title[locale]}</h3>
                  <p>{story.summary[locale]}</p>
                  <div className="culture-word">
                    <strong>{story.hanzi}</strong>
                    <small>{story.pinyin}</small>
                  </div>
                  <details>
                    <summary>{t.note}</summary>
                    <p>{story.detail[locale]}</p>
                  </details>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="empty-state" role="status">
            <strong>{t.noResults}</strong>
          </div>
        )}
      </section>

      <section className="culture-calendar">
        <div>
          <p className="eyebrow">{t.vocabulary}</p>
          <h2>{t.calendar}</h2>
          <p>{t.calendarIntro}</p>
        </div>
        <div className="calendar-list">
          {calendar.map((festival) => (
            <article key={festival.hanzi}>
              <strong>{festival.hanzi}</strong>
              <span>{festival.pinyin}</span>
              <small>{festival[locale]}</small>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
