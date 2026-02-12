const axios = require("axios");

const surahMap = {
  1: ["fatiha", "الفاتحة"],
  2: ["baqarah", "البقرة"],
  3: ["imran", "آل عمران"],
  4: ["nisa", "النساء"],
  5: ["maidah", "المائدة"],
  6: ["anam", "الأنعام"],
  7: ["araf", "الأعراف"],
  8: ["anfal", "الأنفال"],
  9: ["taubah", "التوبة"],
  10: ["yunus", "يونس"],
  11: ["hud", "هود"],
  12: ["yusuf", "يوسف"],
  13: ["raad", "الرعد"],
  14: ["ibrahim", "إبراهيم"],
  15: ["hijr", "الحجر"],
  16: ["nahl", "النحل"],
  17: ["isra", "الإسراء"],
  18: ["kahf", "الكهف"],
  19: ["maryam", "مريم"],
  20: ["taha", "طه"],
  21: ["anbiya", "الأنبياء"],
  22: ["hajj", "الحج"],
  23: ["muminoon", "المؤمنون"],
  24: ["nur", "النور"],
  25: ["furqan", "الفرقان"],
  26: ["shuara", "الشعراء"],
  27: ["naml", "النمل"],
  28: ["qasas", "القصص"],
  29: ["ankabut", "العنكبوت"],
  30: ["rum", "الروم"],
  31: ["luqman", "لقمان"],
  32: ["sajda", "السجدة"],
  33: ["ahzab", "الأحزاب"],
  34: ["saba", "سبأ"],
  35: ["fatir", "فاطر"],
  36: ["yasin", "يس"],
  37: ["saffat", "الصافات"],
  38: ["sad", "ص"],
  39: ["zumar", "الزمر"],
  40: ["ghafir", "غافر"],
  41: ["fussilat", "فصلت"],
  42: ["shura", "الشورى"],
  43: ["zukhruf", "الزخرف"],
  44: ["dukhan", "الدخان"],
  45: ["jasiyah", "الجاثية"],
  46: ["ahqaf", "الأحقاف"],
  47: ["muhammad", "محمد"],
  48: ["fath", "الفتح"],
  49: ["hujurat", "الحجرات"],
  50: ["qaf", "ق"],
  51: ["dhariyat", "الذاريات"],
  52: ["tur", "الطور"],
  53: ["najm", "النجم"],
  54: ["qamar", "القمر"],
  55: ["rahman", "الرحمن"],
  56: ["waqiah", "الواقعة"],
  57: ["hadid", "الحديد"],
  58: ["mujadila", "المجادلة"],
  59: ["hashr", "الحشر"],
  60: ["mumtahanah", "الممتحنة"],
  61: ["saff", "الصف"],
  62: ["jumuah", "الجمعة"],
  63: ["munafiqun", "المنافقون"],
  64: ["taghabun", "التغابن"],
  65: ["talaq", "الطلاق"],
  66: ["tahrim", "التحريم"],
  67: ["mulk", "الملك"],
  68: ["qalam", "القلم"],
  69: ["haqqah", "الحاقة"],
  70: ["ma'arij", "المعارج"],
  71: ["nuh", "نوح"],
  72: ["jinn", "الجن"],
  73: ["muzzammil", "المزمل"],
  74: ["muddaththir", "المدثر"],
  75: ["qiyamah", "القيامة"],
  76: ["insan", "الإنسان"],
  77: ["mursalat", "المرسلات"],
  78: ["naba", "النبأ"],
  79: ["naziyat", "النازعات"],
  80: ["abasa", "عبس"],
  81: ["takwir", "التكوير"],
  82: ["infitar", "الإنفطار"],
  83: ["mutaffifin", "المطففين"],
  84: ["inshiqaq", "الإنشقاق"],
  85: ["buruj", "البروج"],
  86: ["tariq", "الطارق"],
  87: ["ala", "الأعلى"],
  88: ["ghashiyah", "الغاشية"],
  89: ["fajr", "الفجر"],
  90: ["balad", "البلد"],
  91: ["shams", "الشمس"],
  92: ["layl", "الليل"],
  93: ["duha", "الضحى"],
  94: ["sharh", "الشرح"],
  95: ["tin", "التين"],
  96: ["alaq", "العلق"],
  97: ["qadr", "القدر"],
  98: ["bayyinah", "البينة"],
  99: ["zilzal", "الزلزلة"],
  100: ["adiyat", "العاديات"],
  101: ["qari'ah", "القارعة"],
  102: ["takathur", "التكاثر"],
  103: ["asr", "العصر"],
  104: ["humazah", "الهمزة"],
  105: ["fil", "الفيل"],
  106: ["quraish", "قريش"],
  107: ["maun", "الماعون"],
  108: ["kawthar", "الكوثر"],
  109: ["kafirun", "الكافرون"],
  110: ["nasr", "النصر"],
  111: ["masad", "المسد"],
  112: ["ikhlas", "الإخلاص"],
  113: ["falaq", "الفلق"],
  114: ["nas", "الناس"]
};

const driveAudioIds = {
  1: "1QVxonQa7JBcBbuQQHWySwsp4wJpvDonG",
  3: "1QgawsTyDvdrrcDbtD57X13CKCIievFAD",
  112: "1hz3dKc3gyRSHkTz78VnEr-wkM7vCOTW2",
  114: "1rsm7ZmOnqSlUDHhZtFSBL6LM9uREnIdv"
  // 🛑 أضف معرفات Drive هنا أيضاً
};

function getSurahNumber(input) {
  input = input.toLowerCase();
  if (!isNaN(input)) return parseInt(input);
  for (const [num, names] of Object.entries(surahMap)) {
    if (names.some(n => n.toLowerCase() === input)) return parseInt(num);
  }
  return null;
}

module.exports = {
  config: {
    name: "قرآن",
    version: "3.0",
    author: "فاعل خير",
    role: 0,
    shortDescription: "📖 اقرأ واستمع إلى القرآن الكريم (مع الصوت)",
    category: "إسلام",
    guide: {
      ar: "*فرآن قائمة\nقرآن [الاسم|الرقم]\n/قرآن [الاسم|الرقم] صوت"
    }
  },

  onStart: async function ({ api, args, message, event }) {
    if (!args[0]) {
      return message.reply("🕌 أمثلة:\n*قرآن قائمة\n*قرآن الفاتحة\n*قرآن 112\n*قرآن 1 صوت");
    }

    const input = args[0].toLowerCase();
    const type = args[1]?.toLowerCase();

    // 📘 قائمة السور
    if (input === "قائمة") {
      let listText = "📖 ١١٤ سورة:\n\n";
      for (let i = 1; i <= 114; i++) {
        if (surahMap[i]) {
          listText += `${i}. ${surahMap[i][1]}\n`;
        }
      }
      return message.reply(listText);
    }

    // ⛓️ استخراج رقم السورة
    const surahNum = getSurahNumber(input);
    if (!surahNum || surahNum < 1 || surahNum > 114) {
      return message.reply("❌ الرجاء إدخال اسم أو رقم سورة صحيح (1-114).");
    }

    // 🔊 الصوت
    if (type === "صوت") {
      const fileId = driveAudioIds[surahNum];
      if (!fileId) return message.reply("❌ لم تتم إضافة صوت هذه السورة بعد.");

      const audioUrl = `https://docs.google.com/uc?export=download&id=${fileId}`;
      try {
        return api.sendMessage({
          body: `🔊 سورة ${surahMap[surahNum]?.[1] || ""}`,
          attachment: await global.utils.getStreamFromURL(audioUrl)
        }, event.threadID, event.messageID);
      } catch (e) {
        console.error("Audio error:", e.message);
        return message.reply("❌ حدثت مشكلة في إرسال الصوت.");
      }
    }

    // 📖 نص السورة
    try {
      const [arRes, bnRes] = await Promise.all([
        axios.get(`https://api.alquran.cloud/v1/surah/${surahNum}/ar.alafasy`),
        axios.get(`https://api.alquran.cloud/v1/surah/${surahNum}/bn.bengali`)
      ]);

      const ar = arRes.data.data;
      const bn = bnRes.data.data;

      let msg = `📖 سورة ${ar.englishName} (${ar.name})\n\n`;

      for (let i = 0; i < ar.ayahs.length; i++) {
        msg += `${i + 1}. 🕋 ${ar.ayahs[i].text}\n🇧🇩 ${bn.ayahs[i].text}\n\n`;
        if (msg.length > 1800) {
          await message.reply(msg);
          msg = "";
        }
      }

      if (msg) return message.reply(msg);
    } catch (err) {
      console.error("Surah fetch error:", err.message);
      return message.reply("❌ حدث خطأ، يرجى المحاولة مرة أخرى.");
    }
  }
};
