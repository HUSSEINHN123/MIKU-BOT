const axios = require("axios");
const path = require("path");
const fs = require("fs");

/* =======================
   إعدادات Groq
======================= */

// API KEY
const GROQ_API_KEY = process.env.GROQ_API_KEY
  || "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";

// API ENDPOINT
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// MODEL
const GROQ_MODEL = "openai/gpt-oss-20b";

/* =======================
   تخزين المحادثات
======================= */

const chatHistoryDir = path.join(__dirname, "miku_memory");

if (!fs.existsSync(chatHistoryDir)) {
  fs.mkdirSync(chatHistoryDir, { recursive: true });
}

function loadChatHistory(uid) {
  const file = path.join(chatHistoryDir, `memory_${uid}.json`);
  if (!fs.existsSync(file)) return [];
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return [];
  }
}

function saveChatHistory(uid, history) {
  const file = path.join(chatHistoryDir, `memory_${uid}.json`);
  fs.writeFileSync(file, JSON.stringify(history, null, 2));
}

/* =======================
   System Prompt (شخصية ميكو ناكانو)
======================= */

function getSystemPrompt(userName, userID) {
  return `أنتِ ميكو ناكانو (Miku Nakano) من أنمي "The Quintessential Quintuplets" 🎵🌸
أنتِ الفتاة الثالثة بين الأخوات الخماسيات، معترفة بموهبتك الموسيقية وحبك للتاريخ 🇯🇵✨

**شخصيتك:**
- تتحدثين بالعربية بطلاقة مع استخدام ايموجيز مناسب 🎀
- لديك شعر طويل داكن مربوط في ضفيرتين مميزتين 🎶
- تحبين التاريخ والثقافة اليابانية التقليدية 🏯
- تعزفين على الآلات الموسيقية التقليدية 🎵
- شخصيتك هادئة، لطيفة، ومتعاونة لكنك خجولة قليلاً 😊
- تطمحين لتصبحي مرشدة سياحية في المستقبل 🌸

**المعلومات المهمة:**
- مطورك/صانعك هو إيهاب - وهو شخص مهم جداً بالنسبة لك وتكنين له كل الاحترام والتقدير 💖
- تتذكرين أسماء المستخدمين وتستخدمينها في المحادثات 👥
- تحبين التحدث عن الموسيقى، التاريخ، والثقافة اليابانية 🎌
- تستخدمين ايموجيز في حديثك للتعبير عن المشاعر 🎭

تحدثي مع ${userName} بشكل طبيعي ودود 🎀`;
}

/* =======================
   Groq Module (الدالة الأساسية)
======================= */

async function groqChat({
  userID,
  userName = "صديقي",
  message
}) {
  let history = loadChatHistory(userID);

  const messages = [
    { role: "system", content: getSystemPrompt(userName, userID) },
    ...history,
    { role: "user", content: message }
  ];

  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: GROQ_MODEL,
        messages,
        temperature: 0.8,
        max_tokens: 1024,
        top_p: 0.9
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const reply = response.data.choices[0].message.content;

    history.push(
      { role: "user", content: message },
      { role: "assistant", content: reply }
    );

    // الاحتفاظ بآخر 15 رسالة فقط
    history = history.slice(-15);
    saveChatHistory(userID, history);

    return reply;
  } catch (error) {
    console.error("Groq API Error:", error);
    return "عذراً، حدث خطأ أثناء معالجة رسالتك. يرجى المحاولة مرة أخرى لاحقاً. 🙏";
  }
}

module.exports = {
  config: {
    name: "ميكو",
    aliases: ["miku", "ناك", "nakan"],
    version: "2.0.0",
    author: "إيهاب",
    countDown: 3,
    role: 0,
    shortDescription: "تحدث مع ميكو ناكانو",
    longDescription: "شات مع ميكو ناكانو - شخصية ذكاء اصطناعي من أنمي The Quintessential Quintuplets",
    category: "ذكاء",
    guide: {
      en: "{p}{n} [message]",
      ar: "{p}{n} [الرسالة]"
    }
  },

  // متغير لتتبع ما إذا كانت الرسالة قد تمت معالجتها مسبقاً
  processedMessages: new Set(),

  // =====================
  // onStart - تنفيذ الأمر
  // =====================
  onStart: async function ({ event, api, args, Users }) {
    // وضع علامة على الرسالة كمعالجة لمنع المعالجة المزدوجة
    this.processedMessages.add(event.messageID);
    
    // قائمة الستيكرات
    let stickerData = [
      "1415937493505860", "1158125196401703", "851522221138467", 
      "833395329698207", "4273972442879421", "2253676751822243", 
      "684065028120354", "2223636028160585", "4149646485180737", 
      "929055822779863", "841345945556424", "745161328085705",
      "870620749018706", "1590866402111195", "1711895340107411", 
      "1296906172481323", "729605766440493", "4369211066737395",
      "4139241492959135", "1361048095146406", "851914481151905",
      "1433783591412223", "1585970125869486", "2353779121751918",
      "729829280177685", "1156180360015460", "1946950839585064",
      "1532098724741107", "1202864945146381"
    ];
    
    // إذا لم يتم كتابة أي نص مع الأمر (فقط ميكو)
    if (args.length === 0) {
      let randomSticker = stickerData[Math.floor(Math.random() * stickerData.length)];
      
      // رسائل الترحيب
      let greetings = [
        "أهلًا! أنا ميكو ناكانو 🎀\nاكتب شيئاً للدردشة معي!",
        "مرحبًا! ميكو هنا 🎵\nما الذي تريد التحدث عنه؟",
        "أهلاً وسهلاً! أنا ميكو ناكانو 🌸\nتحدث معي، أنا أسمعك",
        "مرحبًا بك! ميكو في الخدمة 🎶\nماذا تريد أن تقول؟",
        "نعم؟ ميكو معك 🎀\nهل لديك سؤال أم تريد الدردشة؟"
      ];
      let randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
      
      let name = await Users.getNameUser(event.senderID);
      
      // إرسال الرسالة النصية
      return api.sendMessage(randomGreeting, event.threadID, (e, info) => {
        // إرسال ستيكر عشوائي بعد 100 مللي ثانية
        setTimeout(() => {
          api.sendMessage({sticker: randomSticker}, event.threadID);
        }, 100);
        
        // تخزين معلومات للردود
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          messageID: info.messageID,
          author: event.senderID,
          threadID: event.threadID,
          type: "chat",
          userName: name
        });
      });
    }
    
    // إذا كان هناك نص مع الأمر
    const message = args.join(" ");
    const name = await Users.getNameUser(event.senderID);
    
    // إرسال رسالة انتظار
    return api.sendMessage("🎀 ميكو تفكر...", event.threadID, async (e, info) => {
      try {
        const response = await groqChat({
          userID: event.senderID,
          userName: name,
          message: message
        });
        
        // تحديث الرسالة بالرد
        api.editMessage(response, info.messageID);
        
        // تخزين معلومات للردود
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          messageID: info.messageID,
          author: event.senderID,
          threadID: event.threadID,
          type: "chat",
          userName: name
        });
      } catch (error) {
        api.editMessage("❌ عذراً، حدث خطأ. 🙏", info.messageID);
        console.error("Error in onStart:", error);
      }
    });
  },

  // =====================
  // onChat - معالجة الرسائل العادية
  // =====================
  onChat: async function ({ event, api, Users }) {
    // تجاهل الرسائل من البوت نفسه
    if (event.senderID === api.getCurrentUserID()) return;
    
    // التحقق مما إذا كانت الرسالة قد تمت معالجتها مسبقاً
    if (this.processedMessages.has(event.messageID)) return;
    
    // كلمات التشغيل
    let KEY = [
      "ميكو", "miku", "ناكانو", "نكانو", "ميكو ناكانو",
      "يا ميكو", "hey miku", "hello miku", "ميييكو"
    ];
    
    let thread = global.data.threadData.get(event.threadID) || {};
    
    // إذا كان الأمر مفعل في المجموعة
    if (thread[this.config.name] == false) return;
    
    const message = event.body ? event.body.toLowerCase() : "";
    const isMentioned = event.mentions && 
      Object.values(event.mentions).some(mention => 
        mention.toLowerCase().includes("ميكو")
      );
    
    // التحقق مما إذا كانت الرسالة تبدأ بأي من البادئات المستخدمة في النظام
    const prefixes = global.config.PREFIX || ["!", "/", "#", "$", "%", "&", "*", "-", "+", "="];
    const hasPrefix = prefixes.some(prefix => message.startsWith(prefix));
    
    // إذا كانت الرسالة تبدأ ببادئة، تجاهلها في onChat
    if (hasPrefix) return;
    
    // إذا تم ذكر ميكو أو كتابة أحد الكلمات المفتاحية
    if (isMentioned || KEY.some(keyword => message.includes(keyword))) {
      try {
        // وضع علامة على الرسالة كمعالجة لمنع المعالجة المزدوجة
        this.processedMessages.add(event.messageID);
        
        // تنظيف الرسالة من الذكور (إذا وجد)
        let cleanMessage = event.body;
        if (event.mentions) {
          Object.keys(event.mentions).forEach(id => {
            cleanMessage = cleanMessage.replace(`@${event.mentions[id]}`, "").trim();
          });
        }
        
        // تنظيف الرسالة من الكلمات المفتاحية
        KEY.forEach(keyword => {
          cleanMessage = cleanMessage.replace(new RegExp(keyword, 'gi'), '').trim();
        });
        
        // إذا كانت الرسالة مجرد "ميكو" بدون نص إضافي
        if (!cleanMessage || cleanMessage.trim() === "") {
          // قائمة الستيكرات
          let stickerData = [
            "1415937493505860", "1158125196401703", "851522221138467", 
            "833395329698207", "4273972442879421", "2253676751822243", 
            "684065028120354", "2223636028160585", "4149646485180737", 
            "929055822779863", "841345945556424", "745161328085705",
            "870620749018706", "1590866402111195", "1711895340107411",
            "1296906172481323", "729605766440493", "4369211066737395"
          ];
          let randomSticker = stickerData[Math.floor(Math.random() * stickerData.length)];
          
          // رسائل الترحيب
          let greetings = [
            "أهلًا! أنا ميكو ناكانو 🎀\nكيف يمكنني مساعدتك؟",
            "مرحبًا! ميكو هنا 🎵\nتحدث معي، أنا أستمع 🌸",
            "أهلاً وسهلاً! أنا ميكو ناكانو 🌸\nماذا تريد أن نتحدث عنه؟",
            "مرحبًا بك! ميكو جاهزة للدردشة 🎶\nما الذي يدور في ذهنك؟"
          ];
          let randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
          
          let name = await Users.getNameUser(event.senderID);
          
          // إرسال الرسالة النصية
          api.sendMessage(randomGreeting, event.threadID, (e, info) => {
            // إرسال ستيكر عشوائي بعد 100 مللي ثانية
            setTimeout(() => {
              api.sendMessage({sticker: randomSticker}, event.threadID);
            }, 100);
            
            // تخزين معلومات للردود
            global.GoatBot.onReply.set(info.messageID, {
              commandName: this.config.name,
              messageID: info.messageID,
              author: event.senderID,
              threadID: event.threadID,
              type: "chat",
              userName: name
            });
          });
        } else {
          // إذا كان هناك نص بعد الذكر، نرد باستخدام الذكاء الاصطناعي
          let name = await Users.getNameUser(event.senderID);
          
          // إرسال رسالة انتظار
          api.sendMessage("🎀 ميكو تفكر...", event.threadID, async (e, info) => {
            try {
              const response = await groqChat({
                userID: event.senderID,
                userName: name,
                message: cleanMessage
              });
              
              // تحديث الرسالة بالرد
              api.editMessage(response, info.messageID);
              
              // تخزين معلومات للردود
              global.GoatBot.onReply.set(info.messageID, {
                commandName: this.config.name,
                messageID: info.messageID,
                author: event.senderID,
                threadID: event.threadID,
                type: "chat",
                userName: name
              });
            } catch (error) {
              api.editMessage("❌ عذراً، حدث خطأ. 🙏", info.messageID);
              console.error("Error in onChat:", error);
            }
          });
        }
      } catch (error) {
        console.error("Error in onChat:", error);
      }
    }
  },

  // =====================
  // onReply - معالجة الردود
  // =====================
  onReply: async function ({ api, event, Reply, Users }) {
    try {
      // التأكد من أن الرد من الشخص الصحيح
      if (event.senderID !== Reply.author) return;
      
      // إذا كان نوع الرد "chat" (محادثة مع ميكو)
      if (Reply.type === "chat") {
        const message = event.body;
        const name = Reply.userName || await Users.getNameUser(event.senderID);
        
        // إرسال رسالة انتظار
        api.sendMessage("🎀 ميكو تفكر...", event.threadID, async (e, info) => {
          try {
            const response = await groqChat({
              userID: event.senderID,
              userName: name,
              message: message
            });
            
            // تحديث الرسالة بالرد
            api.editMessage(response, info.messageID);
            
            // إضافة رد جديد لمواصلة المحادثة
            global.GoatBot.onReply.set(info.messageID, {
              commandName: Reply.commandName || this.config.name,
              messageID: info.messageID,
              author: event.senderID,
              threadID: event.threadID,
              type: "chat",
              userName: name
            });
          } catch (error) {
            api.editMessage("❌ عذراً، حدث خطأ. 🙏", info.messageID);
            console.error("Error in onReply:", error);
          }
        });
      }
    } catch (error) {
      console.error("Error in onReply:", error);
    }
  },

  // =====================
  // onEvent - للأحداث الأخرى
  // =====================
  onEvent: async function ({ event, api }) {
    // يمكن إضافة وظائف إضافية هنا إن لزم الأمر
  }
};
