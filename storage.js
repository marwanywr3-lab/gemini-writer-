/**
 * نظام التخزين المحلي وإدارة حالة الرواية
 */

const STORAGE_KEY = 'sard_story_project_data';

const SAMPLE_PROJECT = {
  title: "موسم السفرجل العتيق",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  settings: {
    theme: 'warm',
    font: 'alexandria',
    fontSize: 18,
    dailyGoal: 1000,
    typewriterMode: false
  },
  chapters: [
    {
      id: "ch_1",
      title: "الفصل الأول: رائحة البن القديم",
      subtitle: "دكان الساعاتي عند المغيب - الرياض القديمة",
      status: "complete", // draft, review, complete
      content: "<p>كان يوسف يقف وراء طاولته الخشبية العتيقة، وحوله تتكتك عشرات الساعات المعلقة في جوقة لا تنتهي. رائحة خشب الصندل الممزوجة بزيت التروس والبن المحروق كانت هويته التي يعرفها أهل الحي منذ أربعين عاماً.</p><p>حين فُتح الباب النحاسي وأصدر جلجلة رنينه المألوف، لم يرفع يوسف رأسه على الفور؛ فقد اعتاد أن زبائن الساعة السادسة هم إما مستعجلون يريدون تبديل عقرب مكسور، أو باحثون عن ملاذ من برد المساء.</p><p>لكن الخطى هذه المرة لم تكن مألوفة. كانت خطى خفيفة، مصحوبة برائحة عطر ياسمين أعادت إلى قلبه ذكريات ثلاثين سنة خلت...</p>"
    },
    {
      id: "ch_2",
      title: "الفصل الثاني: رسالة لم تُرسل",
      subtitle: "مواجهة غير متوقعة عند هطول المطر",
      status: "review",
      content: "<p>جلست المرأة على المقعد الجلدي الوحيد في ركن الدكان، ووضعت صندوقاً صغيراً ملفوفاً بقماش مخملي داكن. لم تنطق بكلمة في البداية، بل اكتفت بالنظر إلى الساعة الجدارية ذات الرقاص الفضي.</p><blockquote>«بعض الأمانات يا أبا أحمد لا تسقط بالتقادم، حتى لو ظننا أن الموت أخذ أصحابها.»</blockquote><p>ارتجفت يد يوسف وهو يضع مفك البراغي الدقيق جانباً. كان يعرف ذلك الخط المكتوب على البطاقة قبل أن يلمسها.</p><hr><p>في تلك اللحظة بالذات، انهمر المطر فجأة، يضرب واجهة الزجاج بضربات متلاحقة، كما لو كان شاهداً قديماً عاد ليطالب بحقه في الكلام.</p>"
    },
    {
      id: "ch_3",
      title: "الفصل الثالث: مفتاح السرداب",
      subtitle: "مسودة تمهيدية للفصل القادم",
      status: "draft",
      content: "<p>ما زال الصندوق مقفلاً، والمفتاح النحاسي الصغير في قبضة يوسف يزن كجبل من الذكريات المحرمة...</p>"
    }
  ],
  characters: [
    {
      id: "char_1",
      name: "يوسف النجدي",
      role: "بطل",
      ageOccupation: "٦٢ عاماً، ساعاتي في الديرة",
      goal: "العثور على السلام الداخلي بعد اختفاء شقيقه الأكبر منذ ثلاثة عقود.",
      flaw: "الإفراط في الكتمان، والتردد في البوح بمشاعره حتى يفوت الأوان.",
      notes: "يرتدي دائماً نظارة طبية ذات إطار سلحفاتي قديم، وله عادة دقيقة في فحص ساعته الجيبية كلما شعر بالتوتر."
    },
    {
      id: "char_2",
      name: "نورة القاسم",
      role: "مساند",
      ageOccupation: "٥٥ عاماً، باحثة في التراث الشفهي",
      goal: "إيصال أمانة غامضة تركها والدها قبل وفاته للمصلح يوسف.",
      flaw: "العناد والشك في دوافع الآخرين بسرعة.",
      notes: "صوتها هادئ وعميق، وتحمل في حقيبتها الجلدية دفتراً عتيقاً مليئاً بالملاحظات المكتوبة بحبر بني."
    }
  ],
  lore: [
    {
      id: "lore_1",
      title: "دكان الساعات العتيق (الديرة)",
      category: "مكان",
      desc: "دكان صغير في أزقة الديرة التراثية، جدرانه مغطاة برفوف خشب الساج المحملة بساعات من مختلف العصور، تفوح منه رائحة الهيل وزيت الساعات المكرر."
    },
    {
      id: "lore_2",
      title: "سر الصندوق المخملي",
      category: "حبكة",
      desc: "صندوق ذو قفل تركيبي قديم يحتوي على رسائل مفقودة تخص عائلة القاسم وخريطة لبستان نخل قديم تم الاستيلاء عليه سنة ١٩٨٠."
    }
  ],
  activeChapterId: "ch_1"
};

class StorageManager {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("تعذر قراءة التخزين المحلي، سيتم استخدام النموذج الافتراضي", e);
    }
    return JSON.parse(JSON.stringify(SAMPLE_PROJECT));
  }

  save() {
    try {
      this.data.updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      this.dispatchSavedEvent();
      return true;
    } catch (e) {
      console.error("فشل حفظ البيانات:", e);
      return false;
    }
  }

  dispatchSavedEvent() {
    window.dispatchEvent(new CustomEvent('storySaved', { detail: { time: new Date() } }));
  }

  resetToSample() {
    this.data = JSON.parse(JSON.stringify(SAMPLE_PROJECT));
    this.save();
  }

  createNewProject() {
    this.data = {
      title: "عمل سردي جديد",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: {
        theme: 'warm',
        font: 'alexandria',
        fontSize: 18,
        dailyGoal: 1000,
        typewriterMode: false
      },
      chapters: [
        {
          id: "ch_" + Date.now(),
          title: "الفصل الأول",
          subtitle: "بداية الحكاية...",
          status: "draft",
          content: "<p></p>"
        }
      ],
      characters: [],
      lore: [],
      activeChapterId: null
    };
    this.data.activeChapterId = this.data.chapters[0].id;
    this.save();
  }
}

window.appStorage = new StorageManager();
