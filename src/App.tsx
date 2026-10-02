import { lazy, Suspense, useEffect, useMemo, useState } from "react"
import { App as CapacitorApp } from "@capacitor/app"
import {
  ArrowIcon,
  BookmarkIcon,
  Button,
  Card,
  CheckIcon,
  FlameIcon,
  IconButton,
  MarkIcon,
  NavIcon,
  TextInput,
} from "./components/ui"
import {
  clearLearningPreferences,
  migrateWebPreference,
  savePreference,
  setDailyReminder,
  shareLearningData,
} from "./lib/native"
import { dayKey, useLearningProgress } from "./hooks/useLearningProgress"
import type { LocalProfile } from "./lib/secureProfile"

type Locale = "en" | "ar" | "ary"
type View = "home" | "learn" | "review" | "discover" | "profile" | "article" | "guide" | "assistant" | "vocabulary" | "settings" | "legal"

const LegalCenter = lazy(() =>
  import("./components/LegalCenter").then((module) => ({
    default: module.LegalCenter,
  })),
)

const VocabularyExplorer = lazy(() =>
  import("./components/VocabularyExplorer").then((module) => ({
    default: module.VocabularyExplorer,
  })),
)

const DiscoverHub = lazy(() =>
  import("./components/DiscoverHub").then((module) => ({
    default: module.DiscoverHub,
  })),
)

const CurriculumCatalog = lazy(() =>
  import("./components/CurriculumCatalog").then((module) => ({
    default: module.CurriculumCatalog,
  })),
)

const copy = {
  en: {
    nav: ["Home", "Learn", "Review", "Discover", "Profile"],
    greeting: "Good morning",
    intro: "A little progress every day adds up to something remarkable.",
    resume: "Resume lesson",
    daily: "Daily practice",
    due: "cards due",
    begin: "Begin review",
    journey: "Your learning journey",
    activity: "This week",
    continue: "Continue learning",
    seeAll: "See all lessons",
    culture: "Culture, in context",
    cultureText:
      "Go beyond vocabulary with stories from daily life across China.",
    search: "Search lessons and vocabulary",
    updated: "Progress updated",
  },
  ar: {
    nav: ["الرئيسية", "تعلّم", "المراجعة", "اكتشف", "حسابي"],
    greeting: "صباح الخير",
    intro: "تقدّم بسيط كل يوم يصنع نتيجة استثنائية.",
    resume: "تابع الدرس",
    daily: "التدريب اليومي",
    due: "بطاقات للمراجعة",
    begin: "ابدأ المراجعة",
    journey: "رحلتك التعليمية",
    activity: "هذا الأسبوع",
    continue: "واصل التعلّم",
    seeAll: "كل الدروس",
    culture: "الثقافة في سياقها",
    cultureText: "تجاوز المفردات وتعرّف على قصص الحياة اليومية في الصين.",
    search: "ابحث في الدروس والمفردات",
    updated: "تم تحديث التقدّم",
  },
  ary: {
    nav: ["الرئيسية", "تعلّم", "راجع", "اكتاشف", "حسابي"],
    greeting: "صباح الخير",
    intro: "شوية بشوية كل نهار، غادي توصل لنتيجة كبيرة.",
    resume: "كمّل الدرس",
    daily: "تمرين اليوم",
    due: "كارتات خاصك تراجع",
    begin: "بدا المراجعة",
    journey: "المسار ديالك",
    activity: "هاد السيمانة",
    continue: "كمّل التعلّم",
    seeAll: "شوف الدروس كاملين",
    culture: "الثقافة فالسياق",
    cultureText: "ماشي غير الكلمات: اكتاشف حكايات من الحياة اليومية فالصين.",
    search: "قلّب فالدروس والكلمات",
    updated: "تسجّل التقدّم",
  },
} as const

const extraCopy: Record<string, [string, string]> = {
  learner: ["متعلّم", "المتعلّم"],
  "Back to dashboard": ["العودة إلى لوحة التعلّم", "رجع للوحة ديال التعلّم"],
  "Sentence building": ["بناء الجملة", "ركّب الجملة"],
  "How do you say “I am called Lin”?": [
    "كيف تقول «اسمي لين»؟",
    "كيفاش تقول «سميتي لين»؟",
  ],
  "Choose the sentence with the correct word order.": [
    "اختر الجملة ذات الترتيب الصحيح.",
    "اختار الجملة اللي مرتّبة مزيان.",
  ],
  "Exactly right": ["إجابة صحيحة", "صحيحة بالضبط"],
  "Not quite yet": ["ليست صحيحة بعد", "مازال ما صابتش"],
  "Mandarin follows subject + verb + name:": [
    "ترتيب الجملة هو: الفاعل + الفعل + الاسم:",
    "الترتيب فالصينية هو: الفاعل + الفعل + السمية:",
  ],
  Continue: ["متابعة", "كمّل"],
  "Current streak": ["السلسلة الحالية", "السلسلة دابا"],
  day: ["يوم", "نهار"],
  days: ["أيام", "نهارات"],
  "Daily challenge": ["تحدّي اليوم", "تحدي اليوم"],
  "Complete 5 review cards": [
    "أكمل 5 بطاقات للمراجعة",
    "كمّل 5 كارتات ديال المراجعة",
  ],
  "Keep your daily streak alive and finish your quick lesson": [
    "حافظ على سلسلتك اليومية وأنهِ تمرينك السريع.",
    "حافظ على السلسلة ديالك وكمّل التمرين السريع.",
  ],
  "Start review": ["ابدأ المراجعة", "بدا المراجعة"],
  "Learning achievements": ["إنجازات التعلّم", "إنجازات التعلّم"],
  "Download score card": ["تنزيل بطاقة النتيجة", "هبّط بطاقة النتيجة"],
  "Score card": ["بطاقة التقدّم", "بطاقة التقدّم"],
  "Saved to your device": ["تم حفظها على جهازك", "تحفظات فالجهاز ديالك"],
  "Play voice": ["تشغيل الصوت", "شغّل الصوت"],
  "Sound effects": ["المؤثرات الصوتية", "أصوات التفاعل"],
  "Offline AI coach": ["مدرّب ذكي دون اتصال", "مدرّب ذكي بلا نت"],
  "Start a lesson": ["ابدأ درساً", "بدا درس"],
  "Meet your coach": ["تعرّف على مدرّبك", "تعرّف على المدرّب ديالك"],
  "Your Mandarin coach is ready": [
    "مدرّبك في الصينية مستعد",
    "المدرّب ديالك فالصينية واجد",
  ],
  "Try a sentence and get a private correction with voice feedback.": [
    "جرّب جملة واحصل على تصحيح خاص مع ملاحظات صوتية.",
    "جرّب جملة وخذ تصحيح خاص مع ملاحظات بالصوت.",
  ],
  "Open coach": ["افتح المدرّب", "حلّ المدرّب"],
  "Build a five-minute Mandarin habit": [
    "ابنِ عادة صينية في خمس دقائق",
    "بني عادة ديال الصينية فـ5 دقايق",
  ],
  "One small session today. A sharper you tomorrow.": [
    "جلسة صغيرة اليوم، ونسخة أقوى منك غداً.",
    "جلسة صغيرة اليوم، وغدا تكون أحسن.",
  ],
  "Start learning": ["ابدأ التعلّم", "بدا التعلّم"],
  "Add review": ["أضف مراجعة", "زيد المراجعة"],
  "Add grammar": ["أضف قواعد", "زيد القواعد"],
  "Talk to coach": ["تحدث مع المدرّب", "هضر مع المدرّب"],
  "day streak": ["يوم متواصل", "نهار متواصل"],
  "today XP": ["نقطة اليوم", "نقط اليوم"],
  "review cards": ["بطاقات مراجعة", "كارتات المراجعة"],
  "lessons done": ["دروس مكتملة", "دروس كملتيهم"],
  "words learned": ["كلمات متعلّمة", "كلمات تعلمتيهم"],
  "Dark mode": ["الوضع الداكن", "الوضع الليلي"],
  "Use a darker palette across the app.": [
    "استخدم ألواناً داكنة في التطبيق كله.",
    "استعمل ألوان غامقة فالتطبيق كامل.",
  ],
  "Use dark mode": ["تفعيل الوضع الداكن", "فعّل الوضع الليلي"],
  "Use light mode": ["تفعيل الوضع الفاتح", "فعّل الوضع الفاتح"],
  "Private, local, and ready to help": [
    "خاص ومحلي وجاهز للمساعدة",
    "خاص ومحلي وواجد يعاونك",
  ],
  "Daily goal": ["الهدف اليومي", "هدف اليوم"],
  "Review due": ["مراجعة مستحقة", "خاصك تراجع"],
  "Keep words fresh": ["ثبّت الكلمات", "بقا فاكر الكلمات"],
  "In progress": ["قيد التعلّم", "باقي كتكمل"],
  "Module 1": ["الوحدة 1", "الوحدة 1"],
  "Daily review": ["المراجعة اليومية", "مراجعة اليوم"],
  Progress: ["التقدّم", "التقدّم"],
  "View details": ["عرض التفاصيل", "شوف التفاصيل"],
  "Words learned": ["الكلمات المتعلّمة", "الكلمات اللي تعلمتي"],
  "+18 this week": ["+18 هذا الأسبوع", "+18 هاد السيمانة"],
  "Study time": ["وقت الدراسة", "وقت القراية"],
  hrs: ["ساعات", "سوايع"],
  "Current level": ["المستوى الحالي", "المستوى ديالك"],
  "Module 1 of 4": ["الوحدة 1 من 4", "الوحدة 1 من 4"],
  "Beyond the language": ["أبعد من اللغة", "كثر من غير اللغة"],
  "Explore stories": ["استكشف القصص", "اكتاشف الحكايات"],
  "City guide": ["دليل المدينة", "دليل المدينة"],
  "A slower day in Beijing": ["يوم هادئ في بكين", "نهار هاني فبكين"],
  "Courtyards, local breakfast, and the rhythm of the hutongs.": [
    "الساحات والفطور المحلي وإيقاع أحياء الهوتونغ.",
    "الديور القديمة، الفطور المحلي، وجوّ الهوتونغ.",
  ],
  "Learn with a clear path.": ["تعلّم ضمن مسار واضح.", "تعلّم فطريق واضح."],
  "Structured lessons connect useful vocabulary, grammar, listening, and practice. This preview includes one complete interactive exercise.":
    [
      "دروس منظّمة تجمع المفردات والقواعد والاستماع والتطبيق. تتضمن هذه النسخة تمريناً تفاعلياً كاملاً.",
      "دروس مرتّبة كاتجمع الكلمات والقواعد والسماع والتطبيق. هاد النسخة فيها تمرين تفاعلي كامل.",
    ],
  "Foundation lessons": ["دروس الأساس", "دروس البداية"],
  "Make every word stick.": [
    "ثبّت كل كلمة في ذاكرتك.",
    "خلي كل كلمة تبقى فبالك.",
  ],
  "Search this review set by Hanzi, pinyin, or English meaning. Review scheduling remains stored on this device.":
    [
      "ابحث في بطاقات المراجعة بالحروف الصينية أو البينيين أو المعنى. يبقى جدول المراجعة محفوظاً على هذا الجهاز.",
      "قلّب فالكارتات بالحروف الصينية ولا البينيين ولا المعنى. برنامج المراجعة كيبقى محفوظ فهاد الجهاز.",
    ],
  Tone: ["النبرة", "النغمة"],
  "Mark reviewed": ["تمّت المراجعة", "علّمها مراجعة"],
  "No vocabulary found": ["لم نعثر على كلمات", "ما لقينا حتى كلمة"],
  "Try a Hanzi character, pinyin syllable, or English meaning.": [
    "جرّب حرفاً صينياً أو مقطع بينيين أو معنى آخر.",
    "جرّب حرف صيني ولا بينيين ولا معنى آخر.",
  ],
  "Culture & place": ["الثقافة والمكان", "الثقافة والبلايص"],
  "Meet the world behind the words.": [
    "اكتشف العالم وراء الكلمات.",
    "تعرّف على العالم اللي ورا الكلمات.",
  ],
  "Editorial guides put language in context. One sourced preview is available in this initial release.":
    [
      "تضع الأدلة التحريرية اللغة في سياقها. تتوفر معاينة موثّقة في هذه النسخة الأولية.",
      "هاد الدلائل كاتحط اللغة فالسياق ديالها. كاينة معاينة موثوقة فهاد النسخة.",
    ],
  "Travel language": ["لغة السفر", "لغة السفر"],
  "Rainy streets, warm tea": [
    "شوارع ممطرة وشاي دافئ",
    "الشتا فالزنقة وأتاي سخون",
  ],
  "A visual introduction to everyday phrases you will hear around Shanghai’s older neighborhoods.":
    [
      "مدخل بصري إلى العبارات اليومية في أحياء شنغهاي القديمة.",
      "مدخل بصري للعبارات اليومية اللي غادي تسمع فأحياء شانغهاي القديمة.",
    ],
  "Read preview": ["قراءة المعاينة", "قرا المعاينة"],
  "Thoughtful Mandarin learning": ["تعلّم مدروس للصينية", "تعلّم الصينية بذكاء"],
  "Anonymous preview · Progress stays on this device · Online content requires a connection":
    [
      "معاينة دون حساب · التقدّم محفوظ على هذا الجهاز · المحتوى الشبكي يحتاج إلى اتصال",
      "معاينة بلا حساب · التقدّم محفوظ فهاد الجهاز · محتوى النت خاصو الاتصال",
    ],
  Flashcards: ["البطاقات التعليمية", "كارتات الحفظ"],
  "Quick review deck": ["بطاقات للمراجعة السريعة", "كارتات لمراجعة سريعة"],
  reviewed: ["تمت مراجعتها", "تراجعو"],
  "Meaning & pronunciation": ["المعنى والنطق", "المعنى والنطق"],
  "Read this word": ["اقرأ هذه الكلمة", "قرا هاد الكلمة"],
  "Tap to reveal": ["اضغط لإظهار الجواب", "كليكي باش يبان الجواب"],
  Previous: ["السابق", "اللي قبل"],
  Next: ["التالي", "اللي من بعد"],
  "Space to flip · Arrow keys to move": [
    "مسافة للقلب · الأسهم للتنقّل",
    "Space باش تقلب · السهام باش تتحرك",
  ],
  "Review again": ["راجع مجدداً", "عاود راجع"],
  "I knew this": ["كنت أعرفها", "كنت عارفها"],
  "Visual guide": ["دليل بصري", "شرح بالصورة"],
  "See how Mandarin works": ["افهم الصينية بصرياً", "شوف كيفاش خدامة الصينية"],
  "The four tones": ["النبرات الأربع", "النغمات الربعة"],
  "Pitch changes meaning. Follow each contour from left to right.": [
    "تغيّر النبرة المعنى. اتبع كل مسار من اليسار إلى اليمين.",
    "النغمة كاتبدّل المعنى. تبع كل خط من اليسار لليمين.",
  ],
  High: ["عالية", "طالعة"],
  Rising: ["صاعدة", "كاتطلع"],
  Dipping: ["هابطة ثم صاعدة", "كاتهبط وكتطلع"],
  Falling: ["هابطة", "كاتهبط"],
  "Your study rhythm": ["إيقاع دراستك", "ريتم القراية ديالك"],
  "Minutes practiced over the last seven days.": [
    "دقائق التدرّب خلال الأيام السبعة الماضية.",
    "الدقايق اللي قريتي فهاد السبعة أيام.",
  ],
  "minutes this week": ["دقيقة هذا الأسبوع", "دقيقة هاد السيمانة"],
  "18% more": ["أكثر بـ18٪", "كثر بـ18٪"],
  "than last week": ["من الأسبوع الماضي", "من السيمانة اللي فاتت"],
  "Unit 1 · Foundations": ["الوحدة 1 · الأساسيات", "الوحدة 1 · البداية"],
  "Say hello and introduce yourself": ["ألقِ التحية وقدّم نفسك", "سلّم وقدّم راسك"],
  Guidebook: ["دليل الوحدة", "دليل الوحدة"],
  "First words": ["الكلمات الأولى", "الكلمات اللولة"],
  "Start here": ["ابدأ هنا", "بدا من هنا"],
  Introductions: ["التعارف", "التعارف"],
  Practice: ["تدريب", "تمرّن"],
  "Numbers & age": ["الأرقام والعمر", "الأرقام والعمر"],
  Curriculum: ["المنهج", "البرنامج"],
  "Start lesson": ["ابدأ الدرس", "بدا الدرس"],
  "Choose this answer": ["اختر هذه الإجابة", "اختار هاد الجواب"],
  "Introducing yourself": ["تقديم نفسك", "قدّم راسك"],
  "Meet the family": ["تعرّف على العائلة", "تعرّف على العائلة"],
  "Module 1 · Foundations": ["الوحدة 1 · الأساسيات", "الوحدة 1 · البداية"],
  "Module 2 · My world": ["الوحدة 2 · عالمي", "الوحدة 2 · العالم ديالي"],
  "12 min · 8 words": ["12 دقيقة · 8 كلمات", "12 دقيقة · 8 كلمات"],
  "10 min · 12 words": ["10 دقائق · 12 كلمة", "10 دقايق · 12 كلمة"],
  "15 min · 14 words": ["15 دقيقة · 14 كلمة", "15 دقيقة · 14 كلمة"],
  hello: ["مرحباً", "سلام"],
  "I / me": ["أنا", "أنا"],
  "to be called": ["يُسمّى", "كيتسمّى"],
  "very pleased": ["سعيد جداً", "فرحان بزاف"],
  "7 days": ["7 أيام", "7 أيام"],
  "Tuesday, May 20": ["الثلاثاء، 20 مايو", "الثلاث، 20 ماي"],
  "HSK 3.0 · Beginner band": [
    "HSK 3.0 · مستوى المبتدئين",
    "HSK 3.0 · مستوى البداية",
  ],
  "Read ten thousand books, travel ten thousand miles.": [
    "اقرأ عشرة آلاف كتاب وسافر عشرة آلاف ميل.",
    "قرا عشرة آلاف كتاب وسافر عشرة آلاف ميل.",
  ],
  "Great — this card will return later": [
    "رائع — ستعود هذه البطاقة لاحقاً",
    "مزيان — هاد الكارت غادي ترجع من بعد",
  ],
  "Added to your short-term review": [
    "أُضيفت إلى المراجعة القريبة",
    "زدناها للمراجعة القريبة",
  ],
  "The clear path": ["الطريق الواضح", "الطريق الواضح"],
  "Interface language": ["لغة الواجهة", "لغة الواجهة"],
  "Primary navigation": ["التنقّل الرئيسي", "التنقّل الرئيسي"],
  Settings: ["الإعدادات", "الإعدادات"],
  "Study reminders": ["تذكيرات الدراسة", "تنبيهات القراية"],
  "Get a local reminder every day at 7:00 PM.": [
    "استلم تذكيراً محلياً كل يوم الساعة 7:00 مساءً.",
    "يوصلك تنبيه فالجهاز كل نهار مع السبعة دالعشية.",
  ],
  "Enable reminders": ["تفعيل التنبيهات", "فعّل التنبيهات"],
  "Disable reminders": ["إيقاف التنبيهات", "حبس التنبيهات"],
  "Stored only on this device": [
    "محفوظة على هذا الجهاز فقط",
    "محفوظ غير فهاد الجهاز",
  ],
  "Privacy & terms": ["الخصوصية والشروط", "الخصوصية والشروط"],
  Close: ["إغلاق", "سدّ"],
  "My learning": ["تعلّمي", "التعلّم ديالي"],
  "Anonymous learner": ["متعلّم دون حساب", "متعلّم بلا حساب"],
  "Your progress lives privately on this device.": [
    "تقدّمك محفوظ بخصوصية على هذا الجهاز.",
    "التقدّم ديالك محفوظ غير فهاد الجهاز.",
  ],
  "Lessons completed": ["الدروس المكتملة", "الدروس اللي كملتي"],
  "Saved lessons": ["الدروس المحفوظة", "الدروس المحفوظين"],
  "Best streak": ["أفضل سلسلة", "أحسن سلسلة"],
  "Manage settings": ["إدارة الإعدادات", "سيّر الإعدادات"],
  "No saved lessons yet": ["لا توجد دروس محفوظة بعد", "ما حفظتي حتى درس"],
  "Open lesson": ["فتح الدرس", "حلّ الدرس"],
  "Unit guide": ["دليل الوحدة", "دليل الوحدة"],
  "Back to path": ["العودة إلى المسار", "رجع للمسار"],
  "Back to discover": ["العودة إلى الاستكشاف", "رجع للاكتشاف"],
  "Language assistant": ["مساعد اللغة", "مساعد اللغة"],
  "Practice and get instant, offline corrections.": [
    "تدرّب واحصل على تصحيحات فورية دون اتصال.",
    "تمرّن وخذ التصحيح دغيا بلا نت.",
  ],
  "Open assistant": ["فتح المساعد", "حلّ المساعد"],
  "Create local profile": ["إنشاء ملف محلي", "صايب بروفايل محلي"],
  "Unlock profile": ["فتح الملف", "حلّ البروفايل"],
  "Display name": ["الاسم المعروض", "السمية"],
  "4–8 digit PIN": ["رمز من 4 إلى 8 أرقام", "كود من 4 حتى 8 أرقام"],
  "Confirm PIN": ["تأكيد الرمز", "عاود الكود"],
  "PINs do not match": ["الرمزان غير متطابقين", "الكودين ماشي بحال بحال"],
  "Create private profile": ["إنشاء ملف خاص", "صايب بروفايل خاص"],
  Unlock: ["فتح", "حلّ"],
  "PIN protects this profile on this device. It cannot recover deleted data.": [
    "يحمي الرمز هذا الملف على الجهاز، ولا يمكنه استعادة البيانات المحذوفة.",
    "الكود كيحمي البروفايل فهاد الجهاز وما كيقدرش يرجع البيانات الممسوحة.",
  ],
  "Incorrect PIN": ["الرمز غير صحيح", "الكود ما صحيحش"],
  "Too many attempts. Try again shortly.": [
    "محاولات كثيرة. حاول بعد قليل.",
    "محاولات بزاف. عاود من بعد شوية.",
  ],
  "Security & preferences": ["الأمان والتفضيلات", "الأمان والاختيارات"],
  "Lock profile": ["قفل الملف", "سدّ البروفايل"],
  "Reset learning progress": ["إعادة ضبط التقدّم", "مسح التقدّم"],
  "Delete local profile": ["حذف الملف المحلي", "مسح البروفايل"],
  "Export learning data": ["تصدير بيانات التعلّم", "صدّر بيانات التعلّم"],
  "Delete all learning data": [
    "حذف كل بيانات التعلّم",
    "مسح بيانات التعلّم كاملة",
  ],
  "Data & recovery": ["البيانات والاستعادة", "البيانات والاسترجاع"],
  "Bookmark saved": ["تم حفظ الإشارة", "تحفظات العلامة"],
  "Lesson progress: exercise 1 of 1": [
    "تقدّم الدرس: التمرين 1 من 1",
    "تقدّم الدرس: التمرين 1 من 1",
  ],
  "Open learner profile": ["فتح ملف المتعلّم", "حلّ بروفايل المتعلّم"],
  "Daily learning status": ["حالة التعلّم اليومية", "حالة التعلّم ديال اليوم"],
  "Today's learning plan": ["خطة تعلّم اليوم", "خطة القراية ديال اليوم"],
  "Complete the previous lesson to unlock this step": [
    "أكمل الدرس السابق لفتح هذه الخطوة",
    "كمّل الدرس اللي قبل باش تحل هاد المرحلة",
  ],
  "Grade this flashcard": ["قيّم هذه البطاقة", "قيّم هاد الكارت"],
  "Unit 1 lesson path": ["مسار دروس الوحدة 1", "مسار دروس الوحدة 1"],
  "Open practice review": ["فتح مراجعة التدريب", "حلّ مراجعة التمرين"],
  "Locked: Numbers and age": ["مغلق: الأرقام والعمر", "مسدود: الأرقام والعمر"],
  "Visitors walking through the historic Forbidden City in Beijing": [
    "زوار يسيرون في المدينة المحرمة التاريخية في بكين",
    "زوار كيمشيو فالمدينة المحرمة التاريخية فبكين",
  ],
  Locked: ["مغلق", "مسدود"],
  Ready: ["جاهز", "واجد"],
  Completed: ["مكتمل", "تكمّل"],
  "Review lesson": ["راجع الدرس", "راجع الدرس"],
  "HSK vocabulary packs": ["حزم مفردات HSK", "حزم كلمات HSK"],
  "Browse 250 sourced words for every HSK level.": [
    "تصفّح 250 كلمة موثّقة لكل مستوى من HSK.",
    "تصفّح 250 كلمة بالمصدر ديالها فكل مستوى HSK.",
  ],
  "Browse vocabulary": ["تصفّح المفردات", "شوف الكلمات"],
  "Notifications are blocked in device settings.": [
    "التنبيهات محظورة في إعدادات الجهاز.",
    "التنبيهات محبوسين فإعدادات الجهاز.",
  ],
  "Daily reminder enabled": ["تم تفعيل التذكير اليومي", "تفعّل تنبيه كل نهار"],
  "Daily reminder disabled": ["تم إيقاف التذكير اليومي", "تحبس التنبيه اليومي"],
}

function translate(locale: Locale, text: string) {
  if (locale === "en") return text
  const translated = extraCopy[text]
  return translated?.[locale === "ar" ? 0 : 1] ?? text
}

const lessons = [
  {
    id: "introductions",
    module: "Module 1 · Foundations",
    title: "Introducing yourself",
    hanzi: "自我介绍",
    meta: "12 min · 8 words",
    color: "vermilion",
  },
  {
    id: "numbers",
    module: "Module 1 · Foundations",
    title: "Numbers & age",
    hanzi: "数字和年龄",
    meta: "10 min · 12 words",
    color: "jade",
  },
  {
    id: "family",
    module: "Module 2 · My world",
    title: "Meet the family",
    hanzi: "我的家人",
    meta: "15 min · 14 words",
    color: "gold",
  },
] as const

const vocab = [
  { hanzi: "你好", pinyin: "nǐ hǎo", meaning: "hello", tone: "3 · 3" },
  { hanzi: "我", pinyin: "wǒ", meaning: "I / me", tone: "3" },
  { hanzi: "叫", pinyin: "jiào", meaning: "to be called", tone: "4" },
  {
    hanzi: "很高兴",
    pinyin: "hěn gāoxìng",
    meaning: "very pleased",
    tone: "3 · 1 · 4",
  },
] as const

function loadLocale(): Locale {
  const stored = localStorage.getItem("mingdao-locale")
  return stored === "ar" || stored === "ary" ? stored : "en"
}

function loadDarkMode() {
  return localStorage.getItem("mingdao-theme") === "dark"
}

function parseBookmarks(value: string | null) {
  if (!value) return []
  try {
    const parsed = JSON.parse(value) as unknown
    return Array.isArray(parsed)
      ? parsed.filter(
          (item): item is string =>
            typeof item === "string" &&
            lessons.some((lesson) => lesson.id === item),
        )
      : []
  } catch {
    return []
  }
}

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (character) => {
    const entities: Record<string, string> = {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      "'": "&apos;",
      '"': "&quot;",
    }
    return entities[character]
  })
}

function downloadScoreCard({
  displayName,
  locale,
  streak,
  xp,
  lessonsCompleted,
  wordsLearned,
}: {
  displayName: string
  locale: Locale
  streak: number
  xp: number
  lessonsCompleted: number
  wordsLearned: number
}) {
  const labels = {
    en: ["Progress card", "day streak", "today XP", "lessons", "words"],
    ar: ["بطاقة التقدّم", "يوم متواصل", "نقطة اليوم", "دروس", "كلمات"],
    ary: ["بطاقة التقدّم", "نهار متواصل", "نقط اليوم", "دروس", "كلمات"],
  }[locale]
  const name = escapeXml(displayName)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" direction="${
    locale === "en" ? "ltr" : "rtl"
  }">
  <rect width="1200" height="630" rx="42" fill="#243024"/>
  <circle cx="1040" cy="-20" r="250" fill="#58a946" opacity=".9"/>
  <circle cx="1130" cy="530" r="180" fill="#f5b82e" opacity=".85"/>
  <path d="M0 520C180 420 280 610 470 500S780 380 950 500" fill="none" stroke="#ee694e" stroke-width="18" opacity=".9"/>
  <text x="70" y="105" fill="#fff4d2" font-family="sans-serif" font-size="30" font-weight="700">MÍNGDÀO · ${escapeXml(labels[0])}</text>
  <text x="70" y="205" fill="white" font-family="sans-serif" font-size="72" font-weight="900">${name}</text>
  <text x="70" y="270" fill="#d8e8dc" font-family="sans-serif" font-size="28">Keep showing up. That is the skill.</text>
  <g font-family="sans-serif" fill="white">
    <text x="90" y="415" font-size="62" font-weight="900">${streak}</text><text x="90" y="460" font-size="24" fill="#d8e8dc">${escapeXml(labels[1])}</text>
    <text x="360" y="415" font-size="62" font-weight="900">${xp}</text><text x="360" y="460" font-size="24" fill="#d8e8dc">${escapeXml(labels[2])}</text>
    <text x="630" y="415" font-size="62" font-weight="900">${lessonsCompleted}</text><text x="630" y="460" font-size="24" fill="#d8e8dc">${escapeXml(labels[3])}</text>
    <text x="870" y="415" font-size="62" font-weight="900">${wordsLearned}</text><text x="870" y="460" font-size="24" fill="#d8e8dc">${escapeXml(labels[4])}</text>
  </g>
  <text x="70" y="570" fill="#fff4d2" font-family="sans-serif" font-size="22">${new Date().toLocaleDateString()}</text>
</svg>`
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `mingdao-score-${new Date().toISOString().slice(0, 10)}.svg`
  link.click()
  URL.revokeObjectURL(url)
}

function App() {
  const [locale, setLocale] = useState<Locale>(loadLocale)
  const [darkMode, setDarkMode] = useState(loadDarkMode)
  const [view, setView] = useState<View>("home")
  const [search, setSearch] = useState("")
  const [toast, setToast] = useState("")
  const [bookmarks, setBookmarks] = useState<string[]>(() =>
    parseBookmarks(localStorage.getItem("mingdao-bookmarks")),
  )
  const [lessonOpen, setLessonOpen] = useState(false)
  const [answer, setAnswer] = useState<string | null>(null)
  const [flashIndex, setFlashIndex] = useState(0)
  const [flashRevealed, setFlashRevealed] = useState(false)
  const [reviewedCards, setReviewedCards] = useState(0)
  const [reminderEnabled, setReminderEnabled] = useState(false)
  const [reminderHour, setReminderHour] = useState(19)
  const [preferencesReady, setPreferencesReady] = useState(false)
  const [profileExists, setProfileExists] = useState(false)
  const [localProfile, setLocalProfile] = useState<LocalProfile | null>(null)
  const { metrics, progress, recordLesson, recordWord, resetProgress } =
    useLearningProgress()
  const t = copy[locale]
  const rtl = locale !== "en"
  const currentFlash = vocab[flashIndex]
  const tx = (text: string) => translate(locale, text)
  const dueCards = Object.values(progress.wordNextReview ?? {}).filter(
    (dueAt) => new Date(dueAt).getTime() <= Date.now(),
  ).length
  const levelProgress = Math.round(
    (progress.completedLessonIds.length / lessons.length) * 100,
  )
  const introductionsMastery = progress.lessonMastery?.introductions ?? 0
  const formattedStudyTime =
    metrics.totalSeconds < 3600
      ? `${Math.floor(metrics.totalSeconds / 60)} min`
      : `${(metrics.totalSeconds / 3600).toFixed(1)} h`
  const todayKey = dayKey()
  const todaysReviews = progress.dailyReviewedWords?.[todayKey]?.length ?? 0
  const dailyChallengeGoal = 5
  const dailyChallengeProgress = Math.min(
    (todaysReviews / dailyChallengeGoal) * 100,
    100,
  )
  const dailyChallengeXp = Math.max(0, dailyChallengeGoal - todaysReviews) * 2
  const streakUnit = tx(metrics.currentStreak === 1 ? "day" : "days")
  const achievementChips = [
    { label: tx("Current streak"), value: `${metrics.currentStreak}d` },
    { label: tx("Words learned"), value: `${progress.reviewedWords.length}` },
    {
      label: tx("Daily review"),
      value: `${todaysReviews}/${dailyChallengeGoal}`,
    },
  ]

  useEffect(() => {
    localStorage.setItem("mingdao-locale", locale)
    if (preferencesReady) void savePreference("mingdao-locale", locale)
    document.documentElement.lang = locale
    document.documentElement.dir = rtl ? "rtl" : "ltr"
  }, [locale, preferencesReady, rtl])

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light"
    localStorage.setItem("mingdao-theme", darkMode ? "dark" : "light")
    if (preferencesReady) {
      void savePreference("mingdao-theme", darkMode ? "dark" : "light")
    }
  }, [darkMode, preferencesReady])

  useEffect(() => {
    localStorage.setItem("mingdao-bookmarks", JSON.stringify(bookmarks))
    if (preferencesReady) {
      void savePreference("mingdao-bookmarks", JSON.stringify(bookmarks))
    }
  }, [bookmarks, preferencesReady])

  useEffect(() => {
    let active = true
    void Promise.all([
      migrateWebPreference("mingdao-locale"),
      migrateWebPreference("mingdao-bookmarks"),
      migrateWebPreference("mingdao-reminders"),
      migrateWebPreference("mingdao-reminder-hour"),
      migrateWebPreference("mingdao-theme"),
    ]).then(
      ([
        storedLocale,
        storedBookmarks,
        storedReminder,
        storedReminderHour,
        storedTheme,
      ]) => {
        if (!active) return
        if (
          storedLocale === "en" ||
          storedLocale === "ar" ||
          storedLocale === "ary"
        ) {
          setLocale(storedLocale)
        }
        if (storedBookmarks) {
          setBookmarks(parseBookmarks(storedBookmarks))
        }
        setReminderEnabled(storedReminder === "true")
        const parsedReminderHour = Number(storedReminderHour)
        if (parsedReminderHour >= 0 && parsedReminderHour <= 23) {
          setReminderHour(parsedReminderHour)
        }
        setDarkMode(storedTheme === "dark")
        setPreferencesReady(true)
      },
    )
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    void import("./lib/secureProfile").then(({ hasLocalProfile }) =>
      hasLocalProfile().then((exists) => {
        if (active) setProfileExists(exists)
      }),
    )
    let listener: { remove: () => Promise<void> } | undefined
    void CapacitorApp.addListener("appStateChange", ({ isActive }) => {
      if (!isActive) {
        setLocalProfile(null)
        setView((current) =>
          current === "profile" || current === "settings" ? "profile" : current,
        )
      }
    }).then((handle) => {
      if (active) listener = handle
      else void handle.remove()
    })
    return () => {
      active = false
      void listener?.remove()
    }
  }, [])

  useEffect(() => {
    let active = true
    let listener: { remove: () => Promise<void> } | undefined
    void CapacitorApp.addListener("backButton", () => {
      if (lessonOpen) {
        setLessonOpen(false)
        return
      }
      const parent: Partial<Record<View, View>> = {
        article: "discover",
        guide: "learn",
        assistant: "learn",
        vocabulary: "review",
        settings: "profile",
        legal: "home",
        learn: "home",
        review: "home",
        discover: "home",
        profile: "home",
      }
      const destination = parent[view]
      if (destination) {
        setView(destination)
        window.scrollTo({ top: 0 })
      } else {
        void CapacitorApp.minimizeApp()
      }
    }).then((handle) => {
      if (active) listener = handle
      else void handle.remove()
    })
    return () => {
      active = false
      void listener?.remove()
    }
  }, [lessonOpen, view])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(""), 2400)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    if (view !== "review") return

    function handleFlashKeys(event: KeyboardEvent) {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return
      }
      if (event.code === "Space") {
        event.preventDefault()
        setFlashRevealed((current) => !current)
      }
      if (event.key === "ArrowRight") {
        setFlashIndex((current) => (current + 1) % vocab.length)
        setFlashRevealed(false)
      }
      if (event.key === "ArrowLeft") {
        setFlashIndex((current) => (current - 1 + vocab.length) % vocab.length)
        setFlashRevealed(false)
      }
    }

    window.addEventListener("keydown", handleFlashKeys)
    return () => window.removeEventListener("keydown", handleFlashKeys)
  }, [view])

  const filteredVocab = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    if (!query) return vocab
    return vocab.filter((word) =>
      `${word.hanzi} ${word.pinyin} ${word.meaning}`
        .toLocaleLowerCase()
        .includes(query),
    )
  }, [search])

  function switchView(next: View) {
    setView(next)
    setLessonOpen(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function toggleBookmark(id: string) {
    setBookmarks((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    )
    setToast(tx("Bookmark saved"))
  }

  if (lessonOpen) {
    return (
      <main className="lesson-shell">
        <Button variant="ghost" onClick={() => setLessonOpen(false)}>
          ← {tx("Back to dashboard")}
        </Button>
        <div
          className="lesson-progress"
          aria-label={tx("Lesson progress: exercise 1 of 1")}
        >
          <span>{tx("Introductions")}</span>
          <strong>1 / 1</strong>
          <i className={answer === "我叫林。" ? "is-complete" : ""} />
        </div>
        <Card className="lesson-stage">
          <p className="eyebrow">{tx("Sentence building")}</p>
          <h1>{tx("How do you say “I am called Lin”?")}</h1>
          <p className="lesson-hint">
            {tx("Choose the sentence with the correct word order.")}
          </p>
          <div className="answer-grid">
            {["我叫林。", "叫我林。", "林我叫。"].map((option) => (
              <Button
                aria-pressed={answer === option}
                className={
                  answer === option ? "answer answer--selected" : "answer"
                }
                key={option}
                onClick={() => setAnswer(option)}
                variant="secondary"
              >
                <b>{option}</b>
                <span>
                  {option === "我叫林。"
                    ? "Wǒ jiào Lín."
                    : tx("Choose this answer")}
                </span>
              </Button>
            ))}
          </div>
          {answer && (
            <div
              className={
                answer === "我叫林。" ? "feedback success" : "feedback error"
              }
              role="status"
            >
              <CheckIcon />
              <div className="hero-copy-block">
                <strong>
                  {answer === "我叫林。"
                    ? tx("Exactly right")
                    : tx("Not quite yet")}
                </strong>
                <p>
                  {metrics.currentStreak} {streakUnit}
                  <b>我 + 叫 + 林</b>.
                </p>
              </div>
            </div>
          )}
          <Button
            disabled={!answer}
            onClick={() => {
              if (answer === "我叫林。") recordLesson("introductions")
              setToast(t.updated)
              setLessonOpen(false)
            }}
          >
            {tx("Continue")} <ArrowIcon />
          </Button>
        </Card>
      </main>
    )
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <button
          className="brand"
          onClick={() => switchView("home")}
          type="button"
        >
          <span className="brand-mark">
            <MarkIcon />
          </span>
          <span>
            <b>Míngdào</b>
            <small>明道 · {tx("The clear path")}</small>
          </span>
        </button>
        <nav aria-label={tx("Primary navigation")}>
          {(["home", "learn", "review", "discover", "profile"] as const).map(
            (item, index) => (
              <button
                aria-current={view === item ? "page" : undefined}
                key={item}
                onClick={() => switchView(item)}
                type="button"
              >
                <NavIcon name={item} />
                <span>{t.nav[index]}</span>
              </button>
            ),
          )}
        </nav>
        <div className="header-actions">
          <label className="language-select">
            <span className="sr-only">{tx("Interface language")}</span>
            <select
              value={locale}
              onChange={(event) => setLocale(event.target.value as Locale)}
            >
              <option value="en">EN</option>
              <option value="ar">العربية</option>
              <option value="ary">الدارجة</option>
            </select>
          </label>
          <div
            className="streak"
            aria-label={`${metrics.currentStreak} ${tx("Current streak")}`}
          >
            <FlameIcon />
            <b>{metrics.currentStreak}</b>
          </div>
          <button
            className="avatar"
            aria-label={tx("Open learner profile")}
            onClick={() => switchView("profile")}
            type="button"
          >
            {localProfile?.displayName.charAt(0).toUpperCase() ?? "本"}
          </button>
        </div>
      </header>

      <main className={view === "home" ? "dashboard-main" : undefined}>
        {view === "legal" && (
          <Suspense
            fallback={
              <div className="section page-view" aria-busy="true">
                <div className="page-skeleton" />
              </div>
            }
          >
            <LegalCenter locale={locale} onBack={() => switchView("home")} />
          </Suspense>
        )}
        {view === "guide" && (
          <GuidePage
            locale={locale}
            onBack={() => switchView("learn")}
            onStart={() => setLessonOpen(true)}
          />
        )}
        {view === "article" && (
          <ArticlePage
            locale={locale}
            onBack={() => switchView("discover")}
            onPractice={() => switchView("review")}
          />
        )}
        {view === "assistant" && (
          <AssistantPage locale={locale} onBack={() => switchView("learn")} />
        )}
        {view === "vocabulary" && (
          <Suspense
            fallback={
              <div className="section page-view" aria-busy="true">
                <div className="page-skeleton" />
              </div>
            }
          >
            <VocabularyExplorer
              locale={locale}
              onBack={() => switchView("review")}
            />
          </Suspense>
        )}
        {view === "home" && (
          <>
            <section className="hero section">
              <div>
                <p className="date-line">
                  {new Intl.DateTimeFormat(
                    locale === "ary" ? "ar-MA" : locale === "ar" ? "ar" : "en",
                    { weekday: "long", month: "long", day: "numeric" },
                  ).format(new Date())}
                </p>
                <h1>
                  {t.greeting},{" "}
                  <em>{localProfile?.displayName ?? tx("learner")}!</em>
                </h1>
                <p className="hero-copy">{t.intro}</p>
                <div className="hero-actions">
                  <Button variant="dark" onClick={() => switchView("learn")}>
                    {tx("Start learning")} <ArrowIcon />
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => switchView("review")}
                  >
                    {tx("Add review")} <ArrowIcon />
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => switchView("learn")}
                  >
                    {tx("Add grammar")} <ArrowIcon />
                  </Button>
                </div>
              </div>
              <div className="hero-visual" aria-hidden="true">
                <div className="hero-seal">学</div>
                <span className="hero-float hero-float--top">
                  你好 <small>nǐ hǎo</small>
                </span>
                <span className="hero-float hero-float--bottom">
                  +{metrics.todayXp} XP
                </span>
                <span className="hero-orbit hero-orbit--one" />
                <span className="hero-orbit hero-orbit--two" />
              </div>
            </section>

            <section
              className="section coach-preview"
              aria-label={tx("Offline AI coach")}
            >
              <div className="coach-preview-avatar" aria-hidden="true">
                <span>明</span>
                <i />
              </div>
              <div className="coach-preview-copy">
                <span className="pill pill--light">
                  {tx("Offline AI coach")}
                </span>
                <h2>{tx("Your Mandarin coach is ready")}</h2>
                <p>
                  {tx(
                    "Try a sentence and get a private correction with voice feedback.",
                  )}
                </p>
              </div>
            </section>

            <section
              className="section game-strip"
              aria-label={tx("Daily learning status")}
            >
              <button onClick={() => switchView("profile")} type="button">
                <span className="game-icon game-icon--fire">
                  <FlameIcon />
                </span>
                <span>
                  <b>
                    {metrics.currentStreak} {streakUnit}
                  </b>
                  <small>{tx("Current streak")}</small>
                </span>
              </button>
              <button onClick={() => switchView("profile")} type="button">
                <span className="game-icon game-icon--xp">XP</span>
                <span>
                  <b>{metrics.todayXp} / 40</b>
                  <small>{tx("Daily goal")}</small>
                </span>
              </button>
              <button onClick={() => switchView("review")} type="button">
                <span className="game-icon game-icon--review">{dueCards}</span>
                <span>
                  <b>{tx("Review due")}</b>
                  <small>{tx("Keep words fresh")}</small>
                </span>
              </button>
            </section>

            <section
              className="section challenge-panel"
              aria-label="Daily challenge"
            >
              <Card className="daily-challenge">
                <div className="challenge-header">
                  <span className="pill pill--light">
                    {tx("Daily challenge")}
                  </span>
                  <span className="challenge-xp">+{dailyChallengeXp} XP</span>
                </div>
                <div className="challenge-body">
                  <div>
                    <h2>{tx("Complete 5 review cards")}</h2>
                    <p>
                      {tx(
                        "Keep your daily streak alive and finish your quick lesson",
                      )}
                    </p>
                  </div>
                </div>
                <div className="progress-line challenge-progress">
                  <span>
                    <i style={{ width: `${dailyChallengeProgress}%` }} />
                  </span>
                  <small>
                    {todaysReviews}/{dailyChallengeGoal}
                  </small>
                </div>
              </Card>
              <div
                className="achievement-pills"
                aria-label={tx("Learning achievements")}
              >
                {achievementChips.map((chip) => (
                  <div className="achievement-pill" key={chip.label}>
                    <span>{chip.label}</span>
                    <strong>{chip.value}</strong>
                  </div>
                ))}
              </div>
            </section>

            <LearnerJourney
              dueCards={dueCards}
              locale={locale}
              mastery={introductionsMastery}
              onLearn={() => setLessonOpen(true)}
              onReview={() => switchView("review")}
              onProfile={() => switchView("profile")}
            />

            <section
              className="section focus-grid"
              aria-label={tx("Today's learning plan")}
            >
              <Card className="resume-card">
                <div className="resume-art" aria-hidden="true">
                  <span>你</span>
                  <i>nǐ</i>
                </div>
                <div className="resume-content">
                  <span className="pill pill--light">
                    {tx(introductionsMastery > 0 ? "Completed" : "Ready")}
                  </span>
                  <p>HSK 1 · {tx("Module 1")}</p>
                  <h2>{tx("Introductions")}</h2>
                  <div className="progress-line">
                    <span>
                      <i
                        style={{
                          width: `${(introductionsMastery / 3) * 100}%`,
                        }}
                      />
                    </span>
                    <small>{introductionsMastery}/3</small>
                  </div>
                  <span className="pill">{tx("Start learning")}</span>
                </div>
              </Card>

              <Card className="practice-card">
                <div className="practice-top">
                  <span className="review-icon">
                    <span />
                  </span>
                  <span className="pill">{tx("Daily review")}</span>
                </div>
                <div>
                  <p>{t.daily}</p>
                  <h2>
                    {dueCards} <span>{t.due}</span>
                  </h2>
                </div>
                <span className="pill">{tx("Add review")}</span>
              </Card>
            </section>

            <LearningPath
              completed={introductionsMastery > 0}
              locale={locale}
              onGuide={() => switchView("guide")}
              onLesson={() => setLessonOpen(true)}
              onLocked={() =>
                setToast(tx("Complete the previous lesson to unlock this step"))
              }
              onReview={() => switchView("review")}
            />

            <LearningInsights locale={locale} week={metrics.week} />

            <section className="section journey-section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">{tx("Progress")}</p>
                  <h2>{t.journey}</h2>
                </div>
                <Button variant="ghost" onClick={() => switchView("profile")}>
                  {tx("View details")} <ArrowIcon />
                </Button>
              </div>
              <div className="stats-grid">
                <Card className="stat-card">
                  <span>{tx("Words learned")}</span>
                  <strong>{progress.reviewedWords.length}</strong>
                  <small>{tx("Stored only on this device")}</small>
                </Card>
                <Card className="stat-card">
                  <span>{tx("Study time")}</span>
                  <strong>{formattedStudyTime}</strong>
                  <small>{t.activity}</small>
                  <div className="bars" aria-hidden="true">
                    {metrics.week.map((day) => (
                      <i
                        key={day.date.toISOString()}
                        style={{
                          height: `${Math.round(
                            (day.seconds /
                              Math.max(
                                60,
                                ...metrics.week.map((entry) => entry.seconds),
                              )) *
                              100,
                          )}%`,
                        }}
                      />
                    ))}
                  </div>
                </Card>
                <Card className="stat-card level-card">
                  <span>{tx("Current level")}</span>
                  <strong>HSK 1</strong>
                  <small>
                    {progress.completedLessonIds.length} / {lessons.length}
                  </small>
                  <div
                    className="level-ring"
                    style={{
                      background: `conic-gradient(var(--gold) ${levelProgress}%, var(--gold-wash) 0)`,
                    }}
                  >
                    {levelProgress}%
                  </div>
                </Card>
              </div>
            </section>

            <LessonSection
              bookmarks={bookmarks}
              completedLessonIds={progress.completedLessonIds}
              lessonMastery={progress.lessonMastery}
              locale={locale}
              onBookmark={toggleBookmark}
              onOpen={() => setLessonOpen(true)}
              title={t.continue}
              viewAll={() => switchView("learn")}
              viewAllLabel={t.seeAll}
            />

            <section className="culture-section">
              <div className="section culture-heading">
                <div>
                  <p className="eyebrow">{tx("Beyond the language")}</p>
                  <h2>{t.culture}</h2>
                  <p>{t.cultureText}</p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => switchView("discover")}
                >
                  {tx("Explore stories")} <ArrowIcon />
                </Button>
              </div>
              <div className="section culture-grid">
                <article className="culture-feature">
                  <img
                    alt={tx(
                      "Visitors walking through the historic Forbidden City in Beijing",
                    )}
                    src="/images/forbidden-city.jpg"
                  />
                  <div>
                    <span className="pill pill--light">{tx("City guide")}</span>
                    <h3>{tx("A slower day in Beijing")}</h3>
                    <p>
                      {tx(
                        "Courtyards, local breakfast, and the rhythm of the hutongs.",
                      )}
                    </p>
                  </div>
                </article>
                <article className="culture-quote">
                  <span>今日一句</span>
                  <blockquote>“读万卷书，行万里路。”</blockquote>
                  <p>Dú wàn juàn shū, xíng wàn lǐ lù.</p>
                  <small>
                    {tx("Read ten thousand books, travel ten thousand miles.")}
                  </small>
                </article>
              </div>
              <p className="photo-credit section">
                Photo by Ling Tang on Unsplash
              </p>
            </section>
          </>
        )}

        {view === "learn" && (
          <div className="section page-view">
            <p className="eyebrow">{tx("HSK 3.0 · Beginner band")}</p>
            <h1>{tx("Learn with a clear path.")}</h1>
            <p className="page-intro">
              {tx(
                "Structured lessons connect useful vocabulary, grammar, listening, and practice. This preview includes one complete interactive exercise.",
              )}
            </p>
            <Card className="assistant-callout">
              <div className="assistant-orb">正</div>
              <div>
                <h2>{tx("Language assistant")}</h2>
                <p>{tx("Practice and get instant, offline corrections.")}</p>
              </div>
              <Button onClick={() => switchView("assistant")}>
                {tx("Open assistant")} <ArrowIcon />
              </Button>
            </Card>
            <LessonSection
              bookmarks={bookmarks}
              completedLessonIds={progress.completedLessonIds}
              lessonMastery={progress.lessonMastery}
              locale={locale}
              onBookmark={toggleBookmark}
              onOpen={() => setLessonOpen(true)}
              title={tx("Foundation lessons")}
            />
            <Suspense
              fallback={<div className="page-skeleton" aria-busy="true" />}
            >
              <CurriculumCatalog
                locale={locale}
                onStart={() => setLessonOpen(true)}
              />
            </Suspense>
          </div>
        )}

        {view === "review" && (
          <div className="section page-view">
            <p className="eyebrow">{tx("Daily review")}</p>
            <h1>{tx("Make every word stick.")}</h1>
            <p className="page-intro">
              {tx(
                "Search this review set by Hanzi, pinyin, or English meaning. Review scheduling remains stored on this device.",
              )}
            </p>
            <Card className="vocabulary-callout">
              <div>
                <p className="eyebrow">{tx("HSK vocabulary packs")}</p>
                <h2>{tx("Browse 250 sourced words for every HSK level.")}</h2>
              </div>
              <Button onClick={() => switchView("vocabulary")}>
                {tx("Browse vocabulary")} <ArrowIcon />
              </Button>
            </Card>
            <FlashcardDeck
              card={currentFlash}
              current={flashIndex + 1}
              locale={locale}
              revealed={flashRevealed}
              reviewed={reviewedCards}
              total={vocab.length}
              onFlip={() => setFlashRevealed((current) => !current)}
              onGrade={(grade) => {
                recordWord(currentFlash.hanzi, grade === "again" ? 10 : 24 * 60)
                setReviewedCards((current) =>
                  Math.min(current + 1, vocab.length),
                )
                setFlashIndex((current) => (current + 1) % vocab.length)
                setFlashRevealed(false)
                setToast(
                  grade === "known"
                    ? tx("Great — this card will return later")
                    : tx("Added to your short-term review"),
                )
              }}
              onNext={() => {
                setFlashIndex((current) => (current + 1) % vocab.length)
                setFlashRevealed(false)
              }}
              onPrevious={() => {
                setFlashIndex(
                  (current) => (current - 1 + vocab.length) % vocab.length,
                )
                setFlashRevealed(false)
              }}
            />
            <TextInput
              label={t.search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t.search}
              value={search}
            />
            <div className="vocab-grid">
              {filteredVocab.map((word) => (
                <Card className="vocab-card" key={word.hanzi}>
                  <span className="tone">
                    {tx("Tone")} {word.tone}
                  </span>
                  <strong>{word.hanzi}</strong>
                  <b>{word.pinyin}</b>
                  <p>{tx(word.meaning)}</p>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      recordWord(word.hanzi)
                      setToast(`${word.hanzi} ${tx("Mark reviewed")}`)
                    }}
                  >
                    {tx("Mark reviewed")}
                  </Button>
                </Card>
              ))}
            </div>
            {!filteredVocab.length && (
              <div className="empty-state" role="status">
                <strong>{tx("No vocabulary found")}</strong>
                <p>
                  {tx(
                    "Try a Hanzi character, pinyin syllable, or English meaning.",
                  )}
                </p>
              </div>
            )}
          </div>
        )}

        {view === "discover" && (
          <Suspense
            fallback={
              <div className="section page-view" aria-busy="true">
                <div className="page-skeleton" />
              </div>
            }
          >
            <DiscoverHub
              locale={locale}
              onOpenArticle={() => switchView("article")}
            />
          </Suspense>
        )}
        {view === "profile" && !localProfile && (
          <ProfileAccess
            exists={profileExists}
            locale={locale}
            onCreated={(profile) => {
              setLocalProfile(profile)
              setProfileExists(true)
            }}
            onUnlocked={setLocalProfile}
          />
        )}
        {view === "profile" && localProfile && (
          <div className="section page-view profile-page">
            <div className="profile-hero">
              <div className="profile-avatar">
                {localProfile.displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="eyebrow">{tx("My learning")}</p>
                <h1>{localProfile.displayName}</h1>
                <p>{tx("Your progress lives privately on this device.")}</p>
              </div>
              <div className="profile-actions">
                <Button
                  variant="secondary"
                  onClick={() => switchView("settings")}
                >
                  {tx("Manage settings")}
                </Button>
                <Button
                  variant="dark"
                  onClick={() => {
                    downloadScoreCard({
                      displayName: localProfile.displayName,
                      locale,
                      streak: metrics.currentStreak,
                      xp: metrics.todayXp,
                      lessonsCompleted: progress.completedLessonIds.length,
                      wordsLearned: progress.reviewedWords.length,
                    })
                    setToast(tx("Saved to your device"))
                  }}
                >
                  {tx("Download score card")}
                </Button>
              </div>
            </div>
            <div className="profile-stats">
              <Card>
                <span>{tx("Lessons completed")}</span>
                <strong>{progress.completedLessonIds.length}</strong>
                <small>HSK 1 · {levelProgress}%</small>
              </Card>
              <Card>
                <span>{tx("Words learned")}</span>
                <strong>{progress.reviewedWords.length}</strong>
                <small>{tx("Stored only on this device")}</small>
              </Card>
              <Card>
                <span>{tx("Best streak")}</span>
                <strong>{metrics.bestStreak}</strong>
                <small>
                  {metrics.currentStreak} · {tx("Current streak")}
                </small>
              </Card>
            </div>
            <section className="saved-section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">{tx("Saved lessons")}</p>
                  <h2>{bookmarks.length}</h2>
                </div>
              </div>
              {bookmarks.length ? (
                <div className="saved-list">
                  {lessons
                    .filter((lesson) => bookmarks.includes(lesson.id))
                    .map((lesson) => (
                      <Card className="saved-row" key={lesson.id}>
                        <span>{lesson.hanzi}</span>
                        <div>
                          <strong>{tx(lesson.title)}</strong>
                          <small>{tx(lesson.meta)}</small>
                        </div>
                        <Button
                          variant="secondary"
                          disabled={lesson.id !== "introductions"}
                          onClick={() => setLessonOpen(true)}
                        >
                          {tx("Open lesson")}
                        </Button>
                      </Card>
                    ))}
                </div>
              ) : (
                <div className="empty-state">
                  <strong>{tx("No saved lessons yet")}</strong>
                </div>
              )}
            </section>
          </div>
        )}
        {view === "settings" && localProfile && (
          <div className="section page-view settings-page">
            <Button variant="ghost" onClick={() => switchView("profile")}>
              ← {tx("My learning")}
            </Button>
            <header>
              <p className="eyebrow">{tx("Security & preferences")}</p>
              <h1>{tx("Settings")}</h1>
            </header>
            <div className="settings-grid">
              <Card className="settings-panel">
                <h2>{tx("Your learning data")}</h2>
                <p>
                  {tx(
                    "Everything below stays encrypted or stored locally on this device.",
                  )}
                </p>
                <div className="settings-summary">
                  <span>
                    <strong>{progress.completedLessonIds.length}</strong>
                    {tx("lessons")}
                  </span>
                  <span>
                    <strong>{progress.reviewedWords.length}</strong>
                    {tx("words")}
                  </span>
                  <span>
                    <strong>
                      {metrics.totalSeconds < 3600
                        ? `${Math.floor(metrics.totalSeconds / 60)}m`
                        : `${(metrics.totalSeconds / 3600).toFixed(1)}h`}
                    </strong>
                    {tx("study time")}
                  </span>
                </div>
              </Card>
              <Card className="settings-panel">
                <h2>{tx("Interface language")}</h2>
                <p>{tx("Stored only on this device")}</p>
                <select
                  value={locale}
                  onChange={(event) => setLocale(event.target.value as Locale)}
                >
                  <option value="en">English</option>
                  <option value="ar">العربية</option>
                  <option value="ary">الدارجة</option>
                </select>
              </Card>
              <Card className="settings-panel">
                <h2>{tx("Dark mode")}</h2>
                <p>{tx("Use a darker palette across the app.")}</p>
                <Button
                  variant={darkMode ? "secondary" : "primary"}
                  onClick={() => setDarkMode((current) => !current)}
                >
                  {tx(darkMode ? "Use light mode" : "Use dark mode")}
                </Button>
              </Card>
              <Card className="settings-panel">
                <h2>{tx("Study reminders")}</h2>
                <p>
                  {tx("Get a local reminder every day at your chosen time.")}
                </p>
                <label className="settings-field">
                  <span>{tx("Reminder time")}</span>
                  <select
                    value={reminderHour}
                    onChange={(event) => {
                      const hour = Number(event.target.value)
                      setReminderHour(hour)
                      if (reminderEnabled) {
                        void setDailyReminder(true, locale, hour).catch(() =>
                          setToast(
                            tx("Notifications are blocked in device settings."),
                          ),
                        )
                      }
                    }}
                  >
                    <option value={7}>7:00 AM</option>
                    <option value={12}>12:00 PM</option>
                    <option value={19}>7:00 PM</option>
                    <option value={21}>9:00 PM</option>
                  </select>
                </label>
                <Button
                  variant={reminderEnabled ? "secondary" : "primary"}
                  onClick={async () => {
                    try {
                      const enabled = await setDailyReminder(
                        !reminderEnabled,
                        locale,
                        reminderHour,
                      )
                      setReminderEnabled(enabled)
                    } catch {
                      setToast(
                        tx("Notifications are blocked in device settings."),
                      )
                    }
                  }}
                >
                  {tx(
                    reminderEnabled ? "Disable reminders" : "Enable reminders",
                  )}
                </Button>
              </Card>
              <Card className="settings-panel">
                <h2>{tx("Security & preferences")}</h2>
                <p>
                  {tx(
                    "PIN protects this profile on this device. It cannot recover deleted data.",
                  )}
                </p>
                <div className="settings-actions">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setLocalProfile(null)
                      switchView("profile")
                    }}
                  >
                    {tx("Lock profile")}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      if (window.confirm(tx("Reset learning progress"))) {
                        resetProgress()
                      }
                    }}
                  >
                    {tx("Reset learning progress")}
                  </Button>
                </div>
              </Card>
              <Card className="settings-panel settings-panel--legal">
                <h2>{tx("Privacy & terms")}</h2>
                <Button variant="secondary" onClick={() => switchView("legal")}>
                  {tx("Privacy & terms")} <ArrowIcon />
                </Button>
              </Card>
              <Card className="settings-panel">
                <h2>{tx("Data & recovery")}</h2>
                <p>{tx("Stored only on this device")}</p>
                <div className="settings-actions">
                  <Button
                    variant="secondary"
                    onClick={() =>
                      void shareLearningData({
                        schemaVersion: 2,
                        exportedAt: new Date().toISOString(),
                        locale,
                        bookmarks,
                        progress,
                      })
                    }
                  >
                    {tx("Export learning data")}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={async () => {
                      if (!window.confirm(tx("Delete all learning data")))
                        return
                      await clearLearningPreferences()
                      resetProgress()
                      setBookmarks([])
                      setReminderEnabled(false)
                      setDarkMode(false)
                    }}
                  >
                    {tx("Delete all learning data")}
                  </Button>
                </div>
              </Card>
              <Card className="settings-panel settings-panel--danger">
                <h2>{tx("Delete local profile")}</h2>
                <p>{tx("Your progress lives privately on this device.")}</p>
                <Button
                  variant="secondary"
                  onClick={async () => {
                    if (!window.confirm(tx("Delete local profile"))) return
                    const { deleteLocalProfile } = await import(
                      "./lib/secureProfile"
                    )
                    await deleteLocalProfile()
                    setLocalProfile(null)
                    setProfileExists(false)
                    switchView("profile")
                  }}
                >
                  {tx("Delete local profile")}
                </Button>
              </Card>
            </div>
            <SettingsToolbox
              dueCards={dueCards}
              locale={locale}
              mastery={introductionsMastery}
              metrics={metrics}
              onAssistant={() => switchView("assistant")}
              onDiscover={() => switchView("discover")}
              onExport={() =>
                void shareLearningData({
                  schemaVersion: 2,
                  exportedAt: new Date().toISOString(),
                  locale,
                  bookmarks,
                  progress,
                })
              }
              onGuide={() => switchView("guide")}
              onLearn={() => setLessonOpen(true)}
              onLock={() => {
                setLocalProfile(null)
                switchView("profile")
              }}
              onPrivacy={() => switchView("legal")}
              onProfile={() => switchView("profile")}
              onReset={() => {
                if (window.confirm(tx("Reset learning progress"))) {
                  resetProgress()
                }
              }}
              onReview={() => switchView("review")}
              onVocabulary={() => switchView("vocabulary")}
              reminderEnabled={reminderEnabled}
              onReminder={async () => {
                try {
                  const enabled = await setDailyReminder(
                    !reminderEnabled,
                    locale,
                    reminderHour,
                  )
                  setReminderEnabled(enabled)
                } catch {
                  setToast(tx("Notifications are blocked in device settings."))
                }
              }}
            />
          </div>
        )}
      </main>

      <footer>
        <div className="section">
          <div className="brand footer-brand">
            <span className="brand-mark">
              <MarkIcon />
            </span>
            <span>
              <b>Míngdào</b>
              <small>{tx("Thoughtful Mandarin learning")}</small>
            </span>
          </div>
          <p>
            {tx(
              "Anonymous preview · Progress stays on this device · Online content requires a connection",
            )}
          </p>
          <Button variant="ghost" onClick={() => switchView("legal")}>
            {tx("Privacy & terms")}
          </Button>
        </div>
      </footer>

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  )
}

function SettingsToolbox({
  dueCards,
  locale,
  mastery,
  metrics,
  onAssistant,
  onDiscover,
  onExport,
  onGuide,
  onLearn,
  onLock,
  onPrivacy,
  onProfile,
  onReset,
  onReview,
  onVocabulary,
  onReminder,
  reminderEnabled,
}: {
  dueCards: number
  locale: Locale
  mastery: number
  metrics: {
    currentStreak: number
    todayXp: number
    totalSeconds: number
  }
  onAssistant: () => void
  onDiscover: () => void
  onExport: () => void
  onGuide: () => void
  onLearn: () => void
  onLock: () => void
  onPrivacy: () => void
  onProfile: () => void
  onReset: () => void
  onReview: () => void
  onVocabulary: () => void
  onReminder: () => void
  reminderEnabled: boolean
}) {
  const tx = (text: string) => translate(locale, text)
  const tools = [
    {
      title: "Start lesson",
      detail: "Begin a focused practice",
      action: onLearn,
    },
    {
      title: "Review cards",
      detail: `${dueCards} cards due`,
      action: onReview,
    },
    { title: "Vocabulary", detail: "Search HSK words", action: onVocabulary },
    { title: "Unit guide", detail: "See goals and grammar", action: onGuide },
    {
      title: "Language assistant",
      detail: "Practice offline",
      action: onAssistant,
    },
    {
      title: "Discover stories",
      detail: "Learn in context",
      action: onDiscover,
    },
    { title: "Learning path", detail: "Continue your route", action: onLearn },
    { title: "My profile", detail: "View your progress", action: onProfile },
    { title: "Export data", detail: "Share a JSON backup", action: onExport },
    {
      title: "Privacy & terms",
      detail: "Read the local data policy",
      action: onPrivacy,
    },
    { title: "Lock profile", detail: "Hide private progress", action: onLock },
    {
      title: reminderEnabled ? "Disable reminders" : "Enable reminders",
      detail: "Set a daily nudge",
      action: onReminder,
    },
    {
      title: "Current streak",
      detail: `${metrics.currentStreak} active days`,
      action: onProfile,
      value: `${metrics.currentStreak}d`,
    },
    {
      title: "Today's XP",
      detail: "Your daily effort",
      action: onProfile,
      value: `${metrics.todayXp}`,
    },
    {
      title: "Review queue",
      detail: "Words waiting to return",
      action: onReview,
      value: `${dueCards}`,
    },
    {
      title: "Lesson mastery",
      detail: "Introductions foundation",
      action: onLearn,
      value: `${mastery}/3`,
    },
    {
      title: "Study time",
      detail: "All-time device total",
      action: onProfile,
      value:
        metrics.totalSeconds < 3600
          ? `${Math.floor(metrics.totalSeconds / 60)}m`
          : `${(metrics.totalSeconds / 3600).toFixed(1)}h`,
    },
    {
      title: "Lessons completed",
      detail: "Private progress count",
      action: onProfile,
    },
    {
      title: "Words learned",
      detail: "Private review count",
      action: onReview,
    },
    {
      title: "Reset progress",
      detail: "Start the learning path again",
      action: onReset,
    },
  ]

  return (
    <section className="settings-tools" aria-labelledby="settings-tools-title">
      <div className="settings-tools-heading">
        <div>
          <p className="eyebrow">{tx("Tools")}</p>
          <h2 id="settings-tools-title">
            {tx("Everything you need in one place")}
          </h2>
        </div>
        <span>
          {tools.length} {tx("local tools")}
        </span>
      </div>
      <div className="settings-tools-grid">
        {tools.map((tool, index) => (
          <button
            className="settings-tool"
            key={tool.title}
            onClick={tool.action}
            type="button"
          >
            <span className="settings-tool-number">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="settings-tool-copy">
              <strong>{tx(tool.title)}</strong>
              <small>{tool.value ?? tx(tool.detail)}</small>
            </span>
            <ArrowIcon />
          </button>
        ))}
      </div>
    </section>
  )
}

function LandingHero({
  dueCards,
  locale,
  metrics,
  profileName,
  wordsLearned,
  lessonsCompleted,
  onCoach,
  onLearn,
  onProfile,
  onReview,
  onScore,
}: {
  dueCards: number
  locale: Locale
  metrics: {
    currentStreak: number
    todayXp: number
  }
  profileName: string
  wordsLearned: number
  lessonsCompleted: number
  onCoach: () => void
  onLearn: () => void
  onProfile: () => void
  onReview: () => void
  onScore: () => void
}) {
  const tx = (text: string) => translate(locale, text)
  const date = new Intl.DateTimeFormat(
    locale === "ary" ? "ar-MA" : locale === "ar" ? "ar" : "en",
    { weekday: "long", month: "long", day: "numeric" },
  ).format(new Date())

  return (
    <section className="landing-hero section">
      <div className="landing-hero-main">
        <p className="landing-kicker">MÍNGDÀO / 01</p>
        <p className="date-line">{date}</p>
        <h1>
          {tx("Build a five-minute Mandarin habit")} <em>{profileName}.</em>
        </h1>
        <p className="landing-lede">
          {tx("One small session today. A sharper you tomorrow.")}
        </p>
        <div className="landing-actions">
          <Button variant="dark" onClick={onLearn}>
            {tx("Start learning")} <ArrowIcon />
          </Button>
          <Button variant="secondary" onClick={onCoach}>
            {tx("Talk to coach")} <ArrowIcon />
          </Button>
        </div>
      </div>
      <div className="landing-stage" aria-hidden="true">
        <span className="landing-stage-label">今天</span>
        <strong>学</strong>
        <span className="landing-stage-pinyin">xué · learn</span>
        <i className="landing-ring landing-ring--one" />
        <i className="landing-ring landing-ring--two" />
        <span className="landing-sticker landing-sticker--hello">你好</span>
        <span className="landing-sticker landing-sticker--xp">
          +{metrics.todayXp} XP
        </span>
      </div>
      <div className="landing-scorecards" aria-label={tx("Progress")}>
        <button
          className="landing-score landing-score--streak"
          onClick={onProfile}
          type="button"
        >
          <span>01</span>
          <strong>{metrics.currentStreak}</strong>
          <small>{tx("day streak")}</small>
        </button>
        <button
          className="landing-score landing-score--review"
          onClick={onReview}
          type="button"
        >
          <span>02</span>
          <strong>{dueCards}</strong>
          <small>{tx("review cards")}</small>
        </button>
        <button
          className="landing-score landing-score--words"
          onClick={onProfile}
          type="button"
        >
          <span>03</span>
          <strong>{wordsLearned}</strong>
          <small>{tx("words learned")}</small>
        </button>
        <button
          className="landing-score landing-score--lessons"
          onClick={onScore}
          type="button"
        >
          <span>04</span>
          <strong>{lessonsCompleted}</strong>
          <small>{tx("lessons done")}</small>
        </button>
      </div>
    </section>
  )
}

function ProfileAccess({
  exists,
  locale,
  onCreated,
  onUnlocked,
}: {
  exists: boolean
  locale: Locale
  onCreated: (profile: LocalProfile) => void
  onUnlocked: (profile: LocalProfile) => void
}) {
  const [name, setName] = useState("")
  const [pin, setPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const tx = (text: string) => translate(locale, text)

  async function submit() {
    if (!/^\d{4,8}$/.test(pin) || (!exists && !name.trim())) {
      setError(tx("4–8 digit PIN"))
      return
    }
    if (!exists && pin !== confirmPin) {
      setError(tx("PINs do not match"))
      return
    }
    setBusy(true)
    setError("")
    try {
      if (!exists) {
        const { createLocalProfile } = await import("./lib/secureProfile")
        const profile = await createLocalProfile(name, pin)
        onCreated(profile)
        return
      }
      const { unlockLocalProfile } = await import("./lib/secureProfile")
      const result = await unlockLocalProfile(pin)
      if (result.status === "success") {
        onUnlocked(result.profile)
      } else if (result.status === "locked") {
        setError(
          `${tx("Too many attempts. Try again shortly.")} ${result.retryAfter ?? 30}s`,
        )
      } else {
        setError(`${tx("Incorrect PIN")} · ${result.attemptsRemaining ?? 0}`)
      }
    } finally {
      setPin("")
      setBusy(false)
    }
  }

  return (
    <div className="section profile-access">
      <div className="vault-visual" aria-hidden="true">
        <span>安</span>
        <i />
      </div>
      <div className="vault-form">
        <p className="eyebrow">
          {exists ? tx("Unlock profile") : tx("Create local profile")}
        </p>
        <h1>{exists ? tx("Unlock profile") : tx("Create private profile")}</h1>
        <p>
          {tx(
            "PIN protects this profile on this device. It cannot recover deleted data.",
          )}
        </p>
        {!exists && (
          <label>
            <span>{tx("Display name")}</span>
            <input
              autoComplete="name"
              maxLength={40}
              onChange={(event) => setName(event.target.value)}
              value={name}
            />
          </label>
        )}
        <label>
          <span>{tx("4–8 digit PIN")}</span>
          <input
            autoComplete={exists ? "current-password" : "new-password"}
            inputMode="numeric"
            maxLength={8}
            onChange={(event) => setPin(event.target.value.replace(/\D/g, ""))}
            onKeyDown={(event) => {
              if (event.key === "Enter") void submit()
            }}
            type="password"
            value={pin}
          />
        </label>
        {!exists && (
          <label>
            <span>{tx("Confirm PIN")}</span>
            <input
              autoComplete="new-password"
              inputMode="numeric"
              maxLength={8}
              onChange={(event) =>
                setConfirmPin(event.target.value.replace(/\D/g, ""))
              }
              type="password"
              value={confirmPin}
            />
          </label>
        )}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <Button disabled={busy} onClick={() => void submit()}>
          {exists ? tx("Unlock") : tx("Create private profile")}
        </Button>
      </div>
    </div>
  )
}

function AssistantPage({
  locale,
  onBack,
}: {
  locale: Locale
  onBack: () => void
}) {
  const [input, setInput] = useState("")
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [messages, setMessages] = useState<{
    input: string
    correction: string
    explanation: string
    correct: boolean
  }[]>([])
  const tx = (text: string) => translate(locale, text)
  const content = {
    en: {
      title: "Practice with clear corrections",
      intro:
        "This offline assistant checks the beginner patterns included in this app. It is rule-based, not generative AI.",
      placeholder: "Try: 我叫林 or 你好",
      check: "Check my sentence",
      correct: "Correct",
      correction: "Suggested correction",
      empty: "Enter a short beginner Mandarin sentence.",
      unknown:
        "This pattern is outside the offline checker. No correction was applied.",
    },
    ar: {
      title: "تدرّب مع تصحيحات واضحة",
      intro:
        "يتحقق هذا المساعد دون اتصال من أنماط المبتدئين الموجودة في التطبيق. يعتمد على قواعد محددة وليس ذكاءً اصطناعياً توليدياً.",
      placeholder: "جرّب: 我叫林 أو 你好",
      check: "تحقق من جملتي",
      correct: "صحيحة",
      correction: "التصحيح المقترح",
      empty: "اكتب جملة صينية قصيرة للمبتدئين.",
      unknown: "هذا النمط خارج نطاق المدقق دون اتصال، لذلك لم يُطبّق تصحيح.",
    },
    ary: {
      title: "تمرّن مع تصحيح واضح",
      intro:
        "هاد المساعد بلا نت كيراجع غير تراكيب البداية اللي فالتطبيق. خدام بقواعد محددة وماشي ذكاء اصطناعي توليدي.",
      placeholder: "جرّب: 我叫林 ولا 你好",
      check: "راجع الجملة",
      correct: "صحيحة",
      correction: "التصحيح المقترح",
      empty: "كتب جملة صينية قصيرة ديال البداية.",
      unknown:
        "هاد التركيبة ما داخلاش فالمدقق بلا نت، وداكشي علاش ما صححناهاش.",
    },
  }[locale]

  function speak(text: string) {
    if (!("speechSynthesis" in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang =
      locale === "en" ? "zh-CN" : locale === "ar" ? "zh-CN" : "zh-CN"
    utterance.rate = 0.82
    window.speechSynthesis.speak(utterance)
  }

  function playFeedback(correct: boolean) {
    if (
      !soundEnabled ||
      !("AudioContext" in window || "webkitAudioContext" in window)
    )
      return
    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!AudioContextClass) return
    const context = new AudioContextClass()
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = "sine"
    oscillator.frequency.value = correct ? 660 : 220
    gain.gain.setValueAtTime(0.0001, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.18)
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start()
    oscillator.stop(context.currentTime + 0.2)
    void context.close()
  }

  function checkSentence() {
    const sentence = input.trim().replace(/[。.!؟?]+$/, "")
    if (!sentence) return
    const compact = sentence.replace(/\s+/g, "")
    let result = {
      input: sentence,
      correction: sentence,
      explanation: content.unknown,
      correct: false,
    }
    if (compact === "你好") {
      result = {
        input: sentence,
        correction: "你好。",
        explanation:
          locale === "en"
            ? "A natural greeting. The two third tones are commonly pronounced with the first one rising in connected speech."
            : locale === "ar"
              ? "تحية طبيعية. عند وصل النبرتين الثالثة، تُنطق الأولى غالباً بصعود."
              : "تحية طبيعية. ملي كيجيو جوج نغمات ثالثة، اللولة غالباً كاتطلع.",
        correct: true,
      }
    } else if (/^我叫[\p{Script=Han}A-Za-z]+$/u.test(compact)) {
      result = {
        input: sentence,
        correction: `${compact}。`,
        explanation:
          locale === "en"
            ? "Correct subject + verb + name order: 我 + 叫 + name."
            : locale === "ar"
              ? "الترتيب صحيح: الفاعل 我 ثم الفعل 叫 ثم الاسم."
              : "الترتيب صحيح: 我 ومن بعدها 叫 ومن بعدها السمية.",
        correct: true,
      }
    } else if (/^叫我/.test(compact)) {
      result = {
        input: sentence,
        correction: `我叫${compact.slice(2)}。`,
        explanation:
          locale === "en"
            ? "Put the subject 我 before the verb 叫."
            : locale === "ar"
              ? "ضع الفاعل 我 قبل الفعل 叫."
              : "حط 我 قبل الفعل 叫.",
        correct: false,
      }
    } else if (/hello|مرحبا|سلام/i.test(compact)) {
      result = {
        input: sentence,
        correction: "你好。",
        explanation:
          locale === "en"
            ? "Use 你好 (nǐ hǎo) for a general hello."
            : locale === "ar"
              ? "استخدم 你好 ‏(nǐ hǎo) للتحية العامة."
              : "استعمل 你好 ‏(nǐ hǎo) باش تسلّم.",
        correct: false,
      }
    }
    setMessages((current) => [result, ...current].slice(0, 8))
    playFeedback(result.correct)
    speak(result.correction)
    setInput("")
  }

  return (
    <div className="section detail-page assistant-page">
      <Button variant="ghost" onClick={onBack}>
        ← {tx("Back to path")}
      </Button>
      <header>
        <div className="coach-heading">
          <div className="coach-avatar" aria-hidden="true">
            <span>明</span>
            <i />
          </div>
          <div>
            <span className="detail-badge">{tx("Offline AI coach")}</span>
            <p className="coach-status">
              {tx("Private, local, and ready to help")}
            </p>
          </div>
        </div>
        <h1>{content.title}</h1>
        <p>{content.intro}</p>
      </header>
      <div className="assistant-workspace">
        <div className="coach-controls">
          <Button
            aria-pressed={soundEnabled}
            variant={soundEnabled ? "secondary" : "ghost"}
            onClick={() => setSoundEnabled((current) => !current)}
          >
            {tx("Sound effects")}: {soundEnabled ? "ON" : "OFF"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => speak("你好，我是你的中文教练。")}
          >
            {tx("Play voice")}
          </Button>
        </div>
        <Card className="assistant-composer">
          <label>
            <span className="sr-only">{content.placeholder}</span>
            <input
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") checkSentence()
              }}
              placeholder={content.placeholder}
              value={input}
            />
          </label>
          <Button disabled={!input.trim()} onClick={checkSentence}>
            {content.check}
          </Button>
        </Card>
        <div className="correction-list" aria-live="polite">
          {messages.map((message, index) => (
            <Card
              className={`correction-card ${
                message.correct ? "correction-card--correct" : ""
              }`}
              key={`${message.input}-${index}`}
            >
              <span>
                {message.correct ? content.correct : content.correction}
              </span>
              <div>
                <del>{message.correct ? null : message.input}</del>
                <strong>{message.correction}</strong>
              </div>
              <p>{message.explanation}</p>
              <Button variant="ghost" onClick={() => speak(message.correction)}>
                {tx("Play voice")}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

function GuidePage({
  locale,
  onBack,
  onStart,
}: {
  locale: Locale
  onBack: () => void
  onStart: () => void
}) {
  const content = {
    en: {
      title: "Your first Mandarin conversations",
      intro:
        "Unit 1 builds a practical foundation: greet someone, say your name, and recognize the sound patterns that make Mandarin clear.",
      objectives: "By the end of this unit",
      goals: [
        "Greet someone naturally in a short exchange",
        "Introduce yourself using 我叫…",
        "Recognize and produce the four basic tone contours",
      ],
      grammar: "One useful pattern",
      grammarBody:
        "我叫 + name means “I am called + name.” Mandarin does not need an equivalent of “am” in this pattern.",
      start: "Start the unit",
      time: "About 35 minutes · 3 lessons · 20 words",
    },
    ar: {
      title: "محادثاتك الأولى بالصينية",
      intro:
        "تبني الوحدة الأولى أساساً عملياً: ألقِ التحية، قل اسمك، وتعرّف على الأنماط الصوتية التي توضح المعنى.",
      objectives: "في نهاية هذه الوحدة",
      goals: [
        "إلقاء التحية بصورة طبيعية في حوار قصير",
        "تقديم نفسك باستخدام 我叫…",
        "تمييز مسارات النبرات الأربع ونطقها",
      ],
      grammar: "نمط مفيد",
      grammarBody:
        "تعني 我叫 + الاسم: «اسمي…». لا تحتاج الصينية إلى فعل مقابل لـ«أكون» في هذا النمط.",
      start: "ابدأ الوحدة",
      time: "نحو 35 دقيقة · 3 دروس · 20 كلمة",
    },
    ary: {
      title: "أول محادثات ديالك بالصينية",
      intro:
        "الوحدة اللولة كاتعطيك أساس عملي: سلّم، قول سميتك، وتعرّف على النغمات اللي كاتوضح المعنى.",
      objectives: "ملي تكمل هاد الوحدة",
      goals: [
        "تسلّم بشكل طبيعي فحوار قصير",
        "تقدّم راسك باستعمال 我叫…",
        "تفرّق بين النغمات الربعة وتنطقهم",
      ],
      grammar: "تركيبة مفيدة",
      grammarBody:
        "我叫 + السمية كتعني «سميتي…». فهاد التركيبة الصينية ما كتحتاجش فعل بحال «نكون».",
      start: "بدا الوحدة",
      time: "تقريباً 35 دقيقة · 3 دروس · 20 كلمة",
    },
  }[locale]
  const tx = (text: string) => translate(locale, text)

  return (
    <div className="section detail-page guide-page">
      <Button variant="ghost" onClick={onBack}>
        ← {tx("Back to path")}
      </Button>
      <header>
        <span className="detail-badge">HSK 1 · {tx("Unit guide")}</span>
        <h1>{content.title}</h1>
        <p>{content.intro}</p>
        <div className="detail-actions">
          <Button onClick={onStart}>
            {content.start} <ArrowIcon />
          </Button>
          <span>{content.time}</span>
        </div>
      </header>
      <div className="guide-grid">
        <Card className="objective-card">
          <span className="guide-number">01</span>
          <h2>{content.objectives}</h2>
          <ul>
            {content.goals.map((goal) => (
              <li key={goal}>
                <CheckIcon /> <span>{goal}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="pattern-card">
          <span className="guide-number">02</span>
          <h2>{content.grammar}</h2>
          <strong>
            我叫林。<small>Wǒ jiào Lín.</small>
          </strong>
          <p>{content.grammarBody}</p>
        </Card>
        <Card className="unit-vocab">
          <span className="guide-number">03</span>
          <h2>{tx("First words")}</h2>
          <div>
            {vocab.map((word) => (
              <span key={word.hanzi}>
                <b>{word.hanzi}</b>
                <small>{word.pinyin}</small>
                <em>{tx(word.meaning)}</em>
              </span>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

function ArticlePage({
  locale,
  onBack,
  onPractice,
}: {
  locale: Locale
  onBack: () => void
  onPractice: () => void
}) {
  const content = {
    en: {
      title: "Rainy streets, warm tea",
      dek: "A small language guide to an unhurried afternoon in Shanghai’s older neighborhoods.",
      paragraphs: [
        "Rain changes the rhythm of Shanghai. Umbrellas gather beneath plane trees, shop signs glow against wet stone, and the nearest tea room becomes an invitation to slow down.",
        "A simple 请问 (qǐngwèn, “excuse me, may I ask…”) is a useful beginning when asking for directions. Pair it with 在哪里? (zài nǎlǐ, “where is…?”) and you have a polite pattern that travels well.",
        "Inside a tea room, 我要一杯茶 (wǒ yào yì bēi chá) means “I would like a cup of tea.” The tone change in 一杯 is worth noticing: 一 is pronounced with a fourth tone before a first-tone syllable.",
      ],
      phrases: "Phrases to take with you",
      practice: "Practice these words",
    },
    ar: {
      title: "شوارع ممطرة وشاي دافئ",
      dek: "دليل لغوي صغير لقضاء ظهيرة هادئة في أحياء شنغهاي القديمة.",
      paragraphs: [
        "يغيّر المطر إيقاع شنغهاي. تجتمع المظلات تحت الأشجار، وتنعكس اللافتات على الحجارة المبللة، وتدعوك أقرب دار شاي إلى التمهّل.",
        "تُعد 请问 ‏(qǐngwèn، «عذراً، هل يمكنني أن أسأل…») بداية مفيدة عند طلب الاتجاهات. أضف 在哪里؟ ‏(zài nǎlǐ، «أين…؟») لتحصل على صيغة مهذبة.",
        "في دار الشاي تعني 我要一杯茶 ‏(wǒ yào yì bēi chá): «أريد كوباً من الشاي». انتبه إلى تغيّر نبرة 一杯 قبل المقطع ذي النبرة الأولى.",
      ],
      phrases: "عبارات مفيدة",
      practice: "تدرّب على هذه الكلمات",
    },
    ary: {
      title: "الشتا فالزنقة وأتاي سخون",
      dek: "دليل صغير للغة فواحد العشية هانية فأحياء شانغهاي القديمة.",
      paragraphs: [
        "الشتا كاتبدّل ريتم شانغهاي. المظلات كيتجمعو تحت الشجر، الضو كينعكس فالحجر المبلل، وأقرب دار ديال أتاي كاتخليك تهدّن شوية.",
        "请问 ‏(qǐngwèn، «سمح ليا نسول…») بداية مفيدة ملي كتسول على الطريق. زيد 在哪里؟ ‏(zài nǎlǐ، «فين كاين…؟») وعندك جملة مؤدبة.",
        "فدار أتاي، 我要一杯茶 ‏(wǒ yào yì bēi chá) كتعني «بغيت كاس ديال أتاي». رد البال كيفاش كتتبدّل نغمة 一杯 قبل المقطع بالنغمة اللولة.",
      ],
      phrases: "جمل تاخذهم معاك",
      practice: "تمرّن على هاد الكلمات",
    },
  }[locale]
  const tx = (text: string) => translate(locale, text)

  return (
    <article className="detail-page article-page">
      <div className="section article-topbar">
        <Button variant="ghost" onClick={onBack}>
          ← {tx("Back to discover")}
        </Button>
      </div>
      <div className="article-hero">
        <img alt={content.title} src="/images/shanghai-rain.jpg" />
        <div>
          <span>{tx("Travel language")}</span>
          <h1>{content.title}</h1>
          <p>{content.dek}</p>
        </div>
      </div>
      <div className="article-body">
        <div className="article-copy">
          {content.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <aside>
          <p className="eyebrow">{content.phrases}</p>
          {[
            ["请问", "qǐngwèn"],
            ["在哪里？", "zài nǎlǐ?"],
            ["我要一杯茶", "wǒ yào yì bēi chá"],
          ].map(([hanzi, pinyin]) => (
            <div key={hanzi}>
              <strong>{hanzi}</strong>
              <span>{pinyin}</span>
            </div>
          ))}
          <Button onClick={onPractice}>{content.practice}</Button>
        </aside>
      </div>
    </article>
  )
}

function FlashcardDeck({
  card,
  current,
  locale,
  onFlip,
  onGrade,
  onNext,
  onPrevious,
  revealed,
  reviewed,
  total,
}: {
  card: typeof vocab[number]
  current: number
  locale: Locale
  onFlip: () => void
  onGrade: (grade: "again" | "known") => void
  onNext: () => void
  onPrevious: () => void
  revealed: boolean
  reviewed: number
  total: number
}) {
  const tx = (text: string) => translate(locale, text)
  return (
    <section className="flash-section" aria-labelledby="flash-title">
      <div className="flash-heading">
        <div>
          <span className="eyebrow">{tx("Flashcards")}</span>
          <h2 id="flash-title">{tx("Quick review deck")}</h2>
        </div>
        <div className="deck-progress">
          <span>
            {reviewed} {tx("reviewed")}
          </span>
          <i>
            <b style={{ width: `${(reviewed / total) * 100}%` }} />
          </i>
        </div>
      </div>
      <div className="flash-layout">
        <div
          className="flash-counter"
          aria-label={`Card ${current} of ${total}`}
        >
          {current} / {total}
        </div>
        <button
          aria-label={
            revealed ? "Hide flashcard answer" : "Reveal flashcard answer"
          }
          className={`flash-card ${revealed ? "flash-card--revealed" : ""}`}
          onClick={onFlip}
          type="button"
        >
          <span className="flash-label">
            {revealed ? tx("Meaning & pronunciation") : tx("Read this word")}
          </span>
          <strong>{card.hanzi}</strong>
          {revealed ? (
            <span className="flash-answer">
              <b>{card.pinyin}</b>
              <span>{tx(card.meaning)}</span>
              <small>
                {tx("Tone")} · {card.tone}
              </small>
            </span>
          ) : (
            <span className="flash-prompt">{tx("Tap to reveal")}</span>
          )}
        </button>
        <div className="flash-navigation">
          <Button variant="secondary" onClick={onPrevious}>
            ← {tx("Previous")}
          </Button>
          <small>{tx("Space to flip · Arrow keys to move")}</small>
          <Button variant="secondary" onClick={onNext}>
            {tx("Next")} →
          </Button>
        </div>
        {revealed && (
          <div className="flash-grades" aria-label={tx("Grade this flashcard")}>
            <Button variant="secondary" onClick={() => onGrade("again")}>
              {tx("Review again")}
            </Button>
            <Button onClick={() => onGrade("known")}>
              {tx("I knew this")}
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}

type WeekEntry = {
  date: Date
  seconds: number
}

function LearningInsights({
  locale,
  week,
}: {
  locale: Locale
  week: WeekEntry[]
}) {
  const tx = (text: string) => translate(locale, text)
  const weekMinutes = Math.floor(
    week.reduce((sum, day) => sum + day.seconds, 0) / 60,
  )
  const maxSeconds = Math.max(60, ...week.map((day) => day.seconds))
  const tones = [
    { number: "1", name: "High", pinyin: "mā", path: "M5 12 L55 12" },
    { number: "2", name: "Rising", pinyin: "má", path: "M5 38 L55 10" },
    { number: "3", name: "Dipping", pinyin: "mǎ", path: "M5 18 Q28 48 55 12" },
    { number: "4", name: "Falling", pinyin: "mà", path: "M5 8 L55 40" },
  ]

  return (
    <section className="section insights-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{tx("Visual guide")}</p>
          <h2>{tx("See how Mandarin works")}</h2>
        </div>
      </div>
      <div className="insights-grid">
        <Card className="tone-chart">
          <div className="insight-title">
            <span className="insight-icon">声</span>
            <div>
              <h3>{tx("The four tones")}</h3>
              <p>
                {tx(
                  "Pitch changes meaning. Follow each contour from left to right.",
                )}
              </p>
            </div>
          </div>
          <div className="tone-grid">
            {tones.map((tone) => (
              <div
                className={`tone-item tone-item--${tone.number}`}
                key={tone.number}
              >
                <span>{tone.number}</span>
                <svg aria-hidden="true" viewBox="0 0 60 48">
                  <path d={tone.path} />
                </svg>
                <div>
                  <b>{tone.pinyin}</b>
                  <small>{tx(tone.name)}</small>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="weekly-chart">
          <div className="insight-title">
            <span className="insight-icon insight-icon--gold">周</span>
            <div>
              <h3>{tx("Your study rhythm")}</h3>
              <p>{tx("Minutes practiced over the last seven days.")}</p>
            </div>
          </div>
          <div className="week-total">
            <strong>{weekMinutes}</strong>
            <span>{tx("minutes this week")}</span>
          </div>
          <div
            className="week-bars"
            aria-label={`${weekMinutes} ${tx("minutes this week")}`}
          >
            {week.map((day) => {
              const minutes = Math.floor(day.seconds / 60)
              return (
                <div key={day.date.toISOString()}>
                  <i
                    style={{
                      height: `${Math.max((day.seconds / maxSeconds) * 75, 4)}px`,
                    }}
                  >
                    <span>{minutes}</span>
                  </i>
                  <small>
                    {new Intl.DateTimeFormat(
                      locale === "ary"
                        ? "ar-MA"
                        : locale === "ar"
                          ? "ar"
                          : "en",
                      { weekday: "narrow" },
                    ).format(day.date)}
                  </small>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </section>
  )
}

function LearningPath({
  completed,
  locale,
  onGuide,
  onLesson,
  onLocked,
  onReview,
}: {
  completed: boolean
  locale: Locale
  onGuide: () => void
  onLesson: () => void
  onLocked: () => void
  onReview: () => void
}) {
  const tx = (text: string) => translate(locale, text)
  return (
    <section className="section path-section">
      <div className="path-header">
        <div>
          <span>{tx("Unit 1 · Foundations")}</span>
          <h2>{tx("Say hello and introduce yourself")}</h2>
        </div>
        <button onClick={onGuide} type="button">
          {tx("Guidebook")}
        </button>
      </div>
      <div className="learning-path" aria-label={tx("Unit 1 lesson path")}>
        <div
          className={`path-step ${
            completed ? "path-step--done" : "path-step--current"
          }`}
        >
          {!completed && <div className="path-tooltip">{tx("Start here")}</div>}
          <button
            aria-label={tx("Introductions")}
            onClick={onLesson}
            type="button"
          >
            {completed ? <CheckIcon /> : <span>你</span>}
          </button>
          <span>{tx("Introductions")}</span>
        </div>
        <div className="path-step path-step--review">
          <button
            aria-label={tx("Open practice review")}
            onClick={onReview}
            type="button"
          >
            <span>练</span>
          </button>
          <span>{tx("Practice")}</span>
        </div>
        <div className="path-step path-step--locked">
          <button
            aria-label={tx("Locked: Numbers and age")}
            onClick={onLocked}
            type="button"
          >
            <span>锁</span>
          </button>
          <span>{tx("Numbers & age")}</span>
        </div>
      </div>
    </section>
  )
}

function LearnerJourney({
  dueCards,
  locale,
  mastery,
  onLearn,
  onReview,
  onProfile,
}: {
  dueCards: number
  locale: Locale
  mastery: number
  onLearn: () => void
  onReview: () => void
  onProfile: () => void
}) {
  const journeyCopy = {
    en: {
      eyebrow: "Your next step",
      title: "A clear path from first word to confidence",
      intro:
        "Learn a little, review it later, and come back whenever you are ready.",
      steps: ["Start", "Learn", "Review", "Master"],
      firstLesson: "Begin your first lesson",
      firstComplete: "Your first lesson is complete",
      foundation: "Build your first foundation",
      mastery: "lesson mastery",
      cardsReady: "cards ready today",
      keepFresh: "Review keeps words fresh",
      mastered: "Foundation mastered",
      returnLater: "Return until it feels natural",
    },
    ar: {
      eyebrow: "خطوتك التالية",
      title: "طريق واضح من أول كلمة إلى الثقة",
      intro: "تعلّم قليلاً، راجع لاحقاً، وعد عندما تكون مستعداً.",
      steps: ["ابدأ", "تعلّم", "راجع", "أتقن"],
      firstLesson: "ابدأ أول درس لك",
      firstComplete: "أكملت أول درس لك",
      foundation: "ابنِ أساسك الأول",
      mastery: "إتقان الدرس",
      cardsReady: "بطاقات جاهزة اليوم",
      keepFresh: "المراجعة تثبّت الكلمات",
      mastered: "أتقنت الأساسيات",
      returnLater: "عد حتى تصبح طبيعية",
    },
    ary: {
      eyebrow: "الخطوة الجاية",
      title: "طريق واضح من أول كلمة حتى تولّي واثق",
      intro: "تعلّم شوية، راجع من بعد، ورجع ملي تكون واجد.",
      steps: ["بدا", "تعلّم", "راجع", "تقن"],
      firstLesson: "بدا أول درس ديالك",
      firstComplete: "كمّلتي أول درس ديالك",
      foundation: "بني الأساس اللول ديالك",
      mastery: "إتقان الدرس",
      cardsReady: "كارتات واجدين اليوم",
      keepFresh: "المراجعة كاتثبت الكلمات",
      mastered: "تقنت الأساسيات",
      returnLater: "رجع حتى تولّي طبيعية",
    },
  }[locale]
  const currentStep = mastery === 0 ? 0 : dueCards > 0 ? 2 : mastery < 3 ? 1 : 3
  const steps = [
    {
      title: journeyCopy.steps[0],
      detail:
        mastery === 0 ? journeyCopy.firstLesson : journeyCopy.firstComplete,
      action: mastery === 0 ? onLearn : undefined,
    },
    {
      title: journeyCopy.steps[1],
      detail:
        mastery > 0
          ? `${mastery}/3 ${journeyCopy.mastery}`
          : journeyCopy.foundation,
      action: mastery > 0 && mastery < 3 ? onLearn : undefined,
    },
    {
      title: journeyCopy.steps[2],
      detail:
        dueCards > 0
          ? `${dueCards} ${journeyCopy.cardsReady}`
          : journeyCopy.keepFresh,
      action: onReview,
    },
    {
      title: journeyCopy.steps[3],
      detail: mastery >= 3 ? journeyCopy.mastered : journeyCopy.returnLater,
      action: mastery >= 3 ? onProfile : undefined,
    },
  ]

  return (
    <section
      className="section learner-journey"
      aria-labelledby="journey-title"
    >
      <div className="journey-intro">
        <p className="eyebrow">{journeyCopy.eyebrow}</p>
        <h2 id="journey-title">{journeyCopy.title}</h2>
        <p>{journeyCopy.intro}</p>
      </div>
      <div className="journey-steps">
        {steps.map((step, index) => {
          const complete = index < currentStep
          const current = index === currentStep
          const content = (
            <>
              <span className="journey-step-number">
                {complete ? <CheckIcon /> : index + 1}
              </span>
              <span>
                <strong>{step.title}</strong>
                <small>{step.detail}</small>
              </span>
            </>
          )
          return step.action ? (
            <button
              className={`journey-step ${complete ? "is-complete" : ""} ${
                current ? "is-current" : ""
              }`}
              key={step.title}
              onClick={step.action}
              type="button"
            >
              {content}
            </button>
          ) : (
            <div
              className={`journey-step ${complete ? "is-complete" : ""} ${
                current ? "is-current" : ""
              }`}
              key={step.title}
            >
              {content}
            </div>
          )
        })}
      </div>
    </section>
  )
}

function LessonSection({
  bookmarks,
  completedLessonIds,
  lessonMastery,
  locale,
  onBookmark,
  onOpen,
  title,
  viewAll,
  viewAllLabel,
}: {
  bookmarks: string[]
  completedLessonIds: string[]
  lessonMastery: Record<string, number>
  locale: Locale
  onBookmark: (id: string) => void
  onOpen: () => void
  title: string
  viewAll?: () => void
  viewAllLabel?: string
}) {
  const tx = (text: string) => translate(locale, text)
  return (
    <section className="section lessons-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{tx("Curriculum")}</p>
          <h2>{title}</h2>
        </div>
        {viewAll && (
          <Button variant="ghost" onClick={viewAll}>
            {viewAllLabel} <ArrowIcon />
          </Button>
        )}
      </div>
      <div className="lesson-grid">
        {lessons.map((lesson) => (
          <Card className="lesson-card" key={lesson.id}>
            <div className={`lesson-visual lesson-visual--${lesson.color}`}>
              <span>{lesson.hanzi}</span>
              <IconButton
                label={
                  bookmarks.includes(lesson.id)
                    ? "Remove bookmark"
                    : "Bookmark lesson"
                }
                onClick={() => onBookmark(lesson.id)}
              >
                <BookmarkIcon filled={bookmarks.includes(lesson.id)} />
              </IconButton>
            </div>
            <div className="lesson-info">
              <p>{tx(lesson.module)}</p>
              <h3>{tx(lesson.title)}</h3>
              <span>{tx(lesson.meta)}</span>
              {completedLessonIds.includes(lesson.id) ? (
                <div className="mini-progress">
                  <i>
                    <b
                      style={{
                        width: `${((lessonMastery[lesson.id] ?? 1) / 3) * 100}%`,
                      }}
                    />
                  </i>
                  <small>{lessonMastery[lesson.id] ?? 1}/3</small>
                </div>
              ) : lesson.id === "introductions" ? (
                <Button variant="ghost" onClick={onOpen}>
                  {tx("Start lesson")} <ArrowIcon />
                </Button>
              ) : (
                <Button variant="ghost" disabled>
                  {tx("Locked")}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}

export default App
