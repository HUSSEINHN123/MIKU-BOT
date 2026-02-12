const fs = require('fs');

module.exports = {
  config: {
    name: "ملف",
    version: "2.0",
    author: "ST | Sheikh Tamim",
    countDown: 2,
    role: 2, // Only bot admin
    shortDescription: "يرسل ملف كود أمر على شكل نص",
    longDescription: "إرسال محتوى ملف نصي محدد للبوت",
    category: "المطور",
    guide: "{pn} <اسم الملف>\nEx: {pn} إسم-الملف"
  },

  onStart: async function ({ message, args, api, event, usersData }) {
    const { threadID, senderID, messageID } = event;
    
    // Bot Admin check
    const botAdmins = global.GoatBot.config?.ADMINBOT || [
        "100015168369582"
    ];//in to this box u and manual set user uid or others user uid for whos can just get access this command
    if (!botAdmins.includes(senderID)) {
      return api.sendMessage("⛔ | أنت غير مصرح لك باستخدام هذا الأمر.", threadID, messageID);
    }

    const fileName = args[0];
    if (!fileName) {
      return api.sendMessage("⚠️ | يرجى تقديم اسم الملف.\nمـثـال: *ملف marry", threadID, messageID);
    }

    const filePath = __dirname + `/${fileName}.js`;
    if (!fs.existsSync(filePath)) {
      return api.sendMessage(`❌ | لـم يـتـم ايـجـاد الـمـلـف الـمـسـمـى بـ: ${fileName}.js داخـل مـجـلـد cmds`, threadID, messageID);
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    api.sendMessage({ body: `📂 |تـفـضـل مـحـتـوى الـمـلـف ${fileName}.js:\n\n${fileContent}` }, threadID);
  }
};
