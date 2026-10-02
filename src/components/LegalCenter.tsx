import { Button } from "./ui"

type Locale = "en" | "ar" | "ary"

const legalContent = {
  en: {
    eyebrow: "Legal & privacy",
    title: "Your learning, your device, your choice.",
    intro:
      "These notices explain how this version of Míngdào works. They apply to the mobile application and its included learning content.",
    back: "Back to learning",
    sections: [
      {
        title: "Privacy policy",
        paragraphs: [
          "Míngdào does not require an account and does not currently operate an advertising, analytics, or user-profile service. We do not sell personal information.",
          "Your selected language, bookmarks, study progress, review state, and reminder preference are stored on your device. They remain there unless you remove the app, clear its data, or reset them from device settings.",
          "Fonts and credited culture photographs are bundled with the application. This release does not send learning activity, profile data, or media requests to an analytics, advertising, font, or image service.",
        ],
      },
      {
        title: "Notifications and permissions",
        paragraphs: [
          "Daily study reminders are optional. Míngdào requests notification permission only after you choose to enable them. Reminders are scheduled locally for 7:00 PM in your device time zone.",
          "You can disable reminders inside the app or in iOS or Android settings. The app does not use notification permission for advertising.",
        ],
      },
      {
        title: "Terms of use",
        paragraphs: [
          "Míngdào provides educational information and practice tools. It does not guarantee examination results, fluency, uninterrupted availability, or that every translation is suitable for every context.",
          "You may use the app for personal learning. You may not reverse engineer protected services, distribute included media without its applicable license, interfere with the app, or use it unlawfully.",
          "The app and its original content are provided as available. To the extent permitted by applicable law, the publisher is not liable for indirect loss arising from use of the app. Consumer rights that cannot legally be excluded remain unaffected.",
        ],
      },
      {
        title: "Local profile security and assistant",
        paragraphs: [
          "A local profile PIN is processed on your device. The PIN is not stored. It derives an encryption key using PBKDF2, and the profile record is encrypted with AES-GCM. Five failed attempts cause a temporary lockout. This app-level protection does not replace your device passcode or protect a compromised operating system.",
          "The language assistant works offline with a limited set of authored correction rules. It does not send sentences to an AI service, and it must not be treated as a complete grammar checker.",
          "Study time counts only foreground app activity in short intervals. Streaks, XP, reviewed words, and lesson completion are calculated from recorded local actions and begin at zero.",
        ],
      },
      {
        title: "Content, licenses, and children",
        paragraphs: [
          "Chinese examples are educational content and should be checked with a qualified speaker for high-stakes use. Third-party photographs remain owned by their credited creators and providers.",
          "HSK sequence and level metadata is generated from hsk3.1-syllabus under the MIT License. Traditional forms and English definitions are adapted from CC-CEDICT via cedict-json under CC BY-SA 4.0. Dictionary-derived data remains available under that share-alike license.",
          "The app is designed for general audiences and does not knowingly collect children’s personal information. A parent or guardian should supervise younger learners and manage device permissions.",
          "Open-source software notices are available through the package manifests distributed with the application.",
        ],
      },
      {
        title: "Data deletion and changes",
        paragraphs: [
          "Because learning data is stored locally, uninstalling the app or clearing its storage deletes that data. There is currently no server copy to restore.",
          "Material changes to these notices will be shown in an app update. Continued use after an update means the revised terms apply, subject to mandatory local law.",
        ],
      },
    ],
    version:
      "Legal notice version 1.0 · Publisher identity and support contact must be configured before store release.",
  },
  ar: {
    eyebrow: "القانون والخصوصية",
    title: "تعلّمك وجهازك واختيارك.",
    intro:
      "توضح هذه الإشعارات طريقة عمل نسخة مينغداو الحالية، وتنطبق على تطبيق الهاتف ومحتواه التعليمي.",
    back: "العودة إلى التعلّم",
    sections: [
      {
        title: "سياسة الخصوصية",
        paragraphs: [
          "لا يتطلب مينغداو حساباً، ولا يستخدم حالياً الإعلانات أو تحليلات المستخدمين أو ملفاتهم الشخصية، ولا نبيع المعلومات الشخصية.",
          "تُحفظ اللغة والإشارات المرجعية والتقدّم وحالة المراجعة وتفضيل التنبيهات على جهازك. تبقى هناك حتى تحذف التطبيق أو بياناته.",
          "الخطوط والصور الثقافية المنسوبة لأصحابها مضمّنة داخل التطبيق. لا يرسل هذا الإصدار نشاط التعلّم أو بيانات الملف أو طلبات الوسائط إلى خدمات التحليل أو الإعلان أو الخطوط أو الصور.",
        ],
      },
      {
        title: "التنبيهات والأذونات",
        paragraphs: [
          "تنبيهات الدراسة اليومية اختيارية. يطلب التطبيق الإذن فقط بعد تفعيلها، وتُجدول محلياً للساعة السابعة مساءً حسب توقيت جهازك.",
          "يمكنك تعطيلها من التطبيق أو إعدادات iOS وAndroid. لا تُستخدم التنبيهات للإعلانات.",
        ],
      },
      {
        title: "شروط الاستخدام",
        paragraphs: [
          "يوفر مينغداو محتوى تعليمياً وأدوات تدريب، ولا يضمن نتائج الامتحانات أو الطلاقة أو التوفر المستمر.",
          "يمكنك استخدام التطبيق للتعلّم الشخصي. يُمنع إساءة استخدامه أو توزيع الوسائط خلاف ترخيصها أو استخدامه بصورة غير قانونية.",
          "يُقدّم التطبيق كما هو متاح. لا تُستبعد حقوق المستهلك التي لا يسمح القانون باستبعادها.",
        ],
      },
      {
        title: "أمان الملف المحلي والمساعد",
        paragraphs: [
          "تتم معالجة رمز الملف المحلي على جهازك ولا يُخزّن. يُشتق منه مفتاح عبر PBKDF2 ويُشفّر الملف بـAES-GCM. تؤدي خمس محاولات فاشلة إلى قفل مؤقت. لا تغني هذه الحماية عن رمز الجهاز ولا تحمي نظام تشغيل مخترقاً.",
          "يعمل مساعد اللغة دون اتصال وفق مجموعة محدودة من قواعد التصحيح المكتوبة، ولا يرسل الجمل إلى خدمة ذكاء اصطناعي ولا يُعد مدققاً نحوياً كاملاً.",
          "يُحتسب وقت الدراسة أثناء استخدام التطبيق في الواجهة فقط. تبدأ السلسلة والنقاط والكلمات والدروس من الصفر وتُحسب من الإجراءات المحلية المسجلة.",
        ],
      },
      {
        title: "المحتوى والتراخيص والأطفال",
        paragraphs: [
          "الأمثلة الصينية تعليمية، وينبغي مراجعتها مع مختص عند الاستخدام المهم. تبقى حقوق الصور لأصحابها المذكورين.",
          "تأتي بيانات مستويات HSK من hsk3.1-syllabus بترخيص MIT، وتأتي الصيغ التقليدية والتعريفات الإنجليزية من CC-CEDICT عبر cedict-json بترخيص CC BY-SA 4.0.",
          "التطبيق موجه للجمهور العام ولا يجمع عن علم بيانات الأطفال. ينبغي لولي الأمر الإشراف على المتعلّمين الصغار.",
        ],
      },
      {
        title: "حذف البيانات والتغييرات",
        paragraphs: [
          "حذف التطبيق أو مسح تخزينه يحذف بيانات التعلّم المحلية، ولا توجد حالياً نسخة خادمية لاستعادتها.",
          "ستظهر التغييرات المهمة في تحديث للتطبيق، مع بقاء أحكام القانون المحلي الإلزامية سارية.",
        ],
      },
    ],
    version:
      "إصدار الإشعار القانوني 1.0 · يجب ضبط هوية الناشر ووسيلة الدعم قبل النشر في المتاجر.",
  },
  ary: {
    eyebrow: "القانون والخصوصية",
    title: "التعلّم ديالك، الجهاز ديالك، والاختيار ديالك.",
    intro:
      "هاد المعلومات كاتشرح كيفاش خدامة النسخة الحالية ديال مينغداو فالتليفون والمحتوى التعليمي ديالها.",
    back: "رجع للتعلّم",
    sections: [
      {
        title: "سياسة الخصوصية",
        paragraphs: [
          "مينغداو ما كيطلبش حساب، وما فيه دابا لا إشهارات لا تتبّع لا بروفايلات ديال المستخدمين، وما كنبيعوش المعلومات الشخصية.",
          "اللغة والمفضلات والتقدّم والمراجعة واختيار التنبيهات كيتحفظو غير فالجهاز ديالك حتى تمسح التطبيق ولا البيانات ديالو.",
          "الخطوط والصور الثقافية داخلين فالتطبيق ومعاهم النسبة لأصحابهم. هاد النسخة ما كترسلش نشاط التعلّم ولا بيانات البروفايل ولا طلبات الصور لشي خدمة ديال التتبع ولا الإشهار.",
        ],
      },
      {
        title: "التنبيهات والصلاحيات",
        paragraphs: [
          "تنبيه القراية اليومي اختياري. التطبيق كيطلب الصلاحية غير ملي كتفعّلو، وكيبرمج التنبيه مع السبعة دالعشية بتوقيت الجهاز.",
          "تقدر تحيد التنبيهات من التطبيق ولا من إعدادات iOS وAndroid، وما كنستعملوهاش للإشهار.",
        ],
      },
      {
        title: "شروط الاستعمال",
        paragraphs: [
          "مينغداو كيعطي محتوى تعليمي وتمارين، وما كيضمنش نتيجة الامتحان ولا الطلاقة ولا الخدمة بلا انقطاع.",
          "تقدر تستعمل التطبيق للقراية الشخصية. ممنوع تسيء الاستعمال ديالو ولا توزّع المحتوى بلا احترام الرخصة ولا تستعملو فشي حاجة مخالفة للقانون.",
          "التطبيق متوفر بالحالة ديالو، وحقوق المستهلك اللي القانون ما كيسمحش نحيدوها كتبقى محفوظة.",
        ],
      },
      {
        title: "أمان البروفايل والمساعد",
        paragraphs: [
          "الكود كيتعالج غير فالجهاز وما كيتخزنش. كيتصاوب منو مفتاح بـPBKDF2 والبروفايل كيتشفّر بـAES-GCM. خمس محاولات غالطة كيديرو قفل مؤقت. هاد الحماية ما كتعوضش كود الجهاز وما كتحميش نظام مخترق.",
          "مساعد اللغة خدام بلا نت بقواعد تصحيح محدودة ومكتوبة. ما كيرسلش الجمل لشي خدمة ذكاء اصطناعي وماشي مدقق كامل ديال القواعد.",
          "وقت القراية كيتحسب غير ملي التطبيق مفتوح فالواجهة. السلسلة والنقط والكلمات والدروس كيبداو من صفر وكيتحسبو من الاستعمال الحقيقي.",
        ],
      },
      {
        title: "المحتوى والرخص والأطفال",
        paragraphs: [
          "الأمثلة الصينية للتعلّم، والأحسن تراجعها مع مختص فالاستعمالات المهمة. حقوق الصور باقية عند المالكين ديالها.",
          "بيانات HSK جاية من hsk3.1-syllabus برخصة MIT، والكتابة التقليدية والتعريفات بالإنجليزية من CC-CEDICT عبر cedict-json برخصة CC BY-SA 4.0.",
          "التطبيق للعموم وما كيجمعش عن قصد معلومات الأطفال. خاص الوالدين يشرفو على الصغار والصلاحيات ديال الجهاز.",
        ],
      },
      {
        title: "مسح البيانات والتغييرات",
        paragraphs: [
          "إلا مسحتي التطبيق ولا التخزين ديالو غادي يتمسح التقدّم المحلي، وما كايناش دابا نسخة فالسيرفر ترجعها.",
          "أي تغيير مهم غادي يبان فتحديث للتطبيق، والقانون المحلي الإجباري كيبقى مطبّق.",
        ],
      },
    ],
    version:
      "نسخة المعلومات القانونية 1.0 · خاص هوية الناشر ووسيلة الدعم يتحددو قبل النشر فالمتاجر.",
  },
} as const

export function LegalCenter({
  locale,
  onBack,
}: {
  locale: Locale
  onBack: () => void
}) {
  const content = legalContent[locale]

  return (
    <div className="section legal-page">
      <Button variant="ghost" onClick={onBack}>
        ← {content.back}
      </Button>
      <header>
        <p className="eyebrow">{content.eyebrow}</p>
        <h1>{content.title}</h1>
        <p>{content.intro}</p>
      </header>
      <div className="legal-sections">
        {content.sections.map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}
      </div>
      <small className="legal-version">{content.version}</small>
    </div>
  )
}
