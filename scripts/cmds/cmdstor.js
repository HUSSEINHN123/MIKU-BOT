const axios = require('axios');
const availableCmdsUrl = "https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/availableCmds.json";
const cmdUrlsJson = "https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/cmdUrls.json";
const ITEMS_PER_PAGE = 10;

module.exports.config = {
    name: "متجر",
    aliases: ["cs", "cmds", "store"],
    version: "7.0",
    author: "Dipto + تم التعديل بواسطة Ullash",
    description: "متجر الأوامر - عرض وتحميل الأوامر المتاحة",
    category: "خدمات"
};

// =========================
// 🟦 onStart (الأمر الرئيسي)
// =========================
module.exports.onStart = async function ({ api, event, args }) {

    const query = args.join(" ").trim().toLowerCase();

    try {
        const response = await axios.get(availableCmdsUrl);
        let cmds = response.data.cmdName;
        let finalArray = cmds;
        let page = 1;

        if (query) {
            if (!isNaN(query)) {
                page = parseInt(query);
            } else if (query.length === 1) {
                finalArray = cmds.filter(cmd => cmd.cmd.startsWith(query));
                if (!finalArray.length)
                    return api.sendMessage(`❌ | لا توجد أوامر تبدأ بحرف "${query}".`, event.threadID);
            } else {
                finalArray = cmds.filter(cmd => cmd.cmd.includes(query));
                if (!finalArray.length)
                    return api.sendMessage(`❌ | الأمر "${query}" غير موجود.`, event.threadID);
            }
        }

        const totalPages = Math.ceil(finalArray.length / ITEMS_PER_PAGE);
        if (page < 1 || page > totalPages)
            return api.sendMessage(`❌ | رقم صفحة غير صالح. الصفحات المتاحة: 1-${totalPages}`, event.threadID);

        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        const cmdsToShow = finalArray.slice(startIndex, startIndex + ITEMS_PER_PAGE);

        let msg = `╭───✦ ✦ متجر الأوامر ✦ ✦───╮\n`;
        msg += `│ 📄 الصفحة: ${page}/${totalPages}\n`;
        msg += `│ 📦 الإجمالي: ${finalArray.length} أمر\n`;
        msg += `├───────────────────\n`;

        cmdsToShow.forEach((cmd, i) => {
            msg += `│ ${startIndex + i + 1}. ${cmd.cmd}\n`;
            msg += `│   👤 المؤلف: ${cmd.author}\n`;
            msg += `│   📅 التحديث: ${cmd.update || "غير متوفر"}\n`;
            msg += `│   📌 الحالة: ${cmd.status || "متاح"}\n`;
            msg += `├───────────────────\n`;
        });

        msg += `│\n`;
        msg += `│ 💡 للتحميل: رد برقم الأمر\n`;
        msg += `│ 🔍 للبحث: ${module.exports.config.name} <حرف/كلمة>\n`;
        msg += `│ 📑 للصفحات: ${module.exports.config.name} <رقم الصفحة>\n`;
        msg += `╰───────────⧕`;

        api.sendMessage(msg, event.threadID, (err, info) => {
            global.GoatBot.onReply.set(info.messageID, {
                commandName: module.exports.config.name,
                type: "select",
                author: event.senderID,
                page: page,
                cmdList: finalArray
            });
        });

    } catch (err) {
        console.log(err);
        return api.sendMessage("❌ | فشل تحميل قائمة الأوامر. تحقق من اتصالك بالإنترنت.", event.threadID);
    }
};

// =========================
// 🟨 onReply (عند رد المستخدم برقم)
// =========================
module.exports.onReply = async function ({ api, event, Reply }) {

    if (event.senderID !== Reply.author) {
        return api.sendMessage("❌ | هذا الرد ليس لك. قم بتنفيذ الأمر بنفسك.", event.threadID);
    }

    const number = parseInt(event.body);
    const startIndex = (Reply.page - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, Reply.cmdList.length);

    if (isNaN(number) || number < startIndex + 1 || number > endIndex) {
        return api.sendMessage(`❌ | الرجاء إدخال رقم بين ${startIndex + 1} و ${endIndex}`, event.threadID);
    }

    try {
        const selected = Reply.cmdList[number - 1];
        const cmdName = selected.cmd;

        const response = await axios.get(cmdUrlsJson);
        const cmdUrl = response.data[cmdName];

        if (!cmdUrl) {
            return api.sendMessage("❌ | رابط التحميل غير متوفر لهذا الأمر حالياً.", event.threadID);
        }

        await api.unsendMessage(event.messageReply.messageID);

        const msg = `╭───────⭓\n`;
        msg += `│ ✅ تم اختيار الأمر: ${cmdName}\n`;
        msg += `│ ═══════════════\n`;
        msg += `│ 📋 المعلومات:\n`;
        msg += `│   • الاسم: ${selected.cmd}\n`;
        msg += `│   • المؤلف: ${selected.author || "غير معروف"}\n`;
        msg += `│   • آخر تحديث: ${selected.update || "غير محدد"}\n`;
        msg += `│   • الحالة: ${selected.status || "نشط"}\n`;
        msg += `│\n`;
        msg += `│ 🔗 رابط التحميل:\n`;
        msg += `│ ${cmdUrl}\n`;
        msg += `│\n`;
        msg += `│ 📌 تعليمات:\n`;
        msg += `│ 1. انسخ الرابط أعلاه\n`;
        msg += `│ 2. استخدمه لتثبيت الأمر\n`;
        msg += `│ 3. أعد تشغيل البوت\n`;
        msg += `╰─────────────⭓`;

        return api.sendMessage(msg, event.threadID);

    } catch (err) {
        console.log(err);
        return api.sendMessage("❌ | فشل تحميل رابط الأمر. يرجى المحاولة مرة أخرى.", event.threadID);
    }
};

// =========================
// 🟩 onEvent (للتفاعل مع الأحداث الأخرى)
// =========================
module.exports.onEvent = async function ({ api, event }) {
    // يمكن إضافة وظائف إضافية هنا إن لزم الأمر
};

// =========================
// 📝 تعليمات الاستخدام
// =========================
/*
أوامر متجر الأوامر:
- ${module.exports.config.name} : عرض الصفحة الأولى
- ${module.exports.config.name} <رقم> : عرض صفحة محددة
- ${module.exports.config.name} <حرف> : بحث بالأحرف الأولى
- ${module.exports.config.name} <كلمة> : بحث في أسماء الأوامر

الاختصارات:
- cs, cmds, store

مثال:
- متجر 2 : عرض الصفحة الثانية
- متجر ا : عرض الأوامر التي تبدأ بحرف ا
- متجر فيسبوك : البحث عن أوامر تحتوي كلمة فيسبوك
*/
