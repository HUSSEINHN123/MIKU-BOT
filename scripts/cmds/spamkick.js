module.exports.config = {
 name: "طرد-السبام",
 version: "1.0.0",
 role: 0, 
 author: "Chitron Bhattacharjee - تمت الترجمة بواسطة Ullash",
 usePrefix: true,
 description: { 
 en: "Automatically kick a user who spams messages in a group chat",
 ar: "طرد تلقائي لأي عضو يقوم بالسبام (تكرار الرسائل) في المجموعة"
 },
 category: "مجموعة",
 guide: { 
 en: "[on/off] or [settings]",
 ar: "[تشغيل/إيقاف] أو [الإعدادات]"
 },
 countDown: 5
};

module.exports.onChat = async ({ api, event, usersData, commandName }) => {
 const { senderID, threadID } = event;
 if (!global.antispam) global.antispam = new Map();

 const threadInfo = global.antispam.has(threadID) ? global.antispam.get(threadID) : { users: {} };
 
 if (!(senderID in threadInfo.users)) {
 threadInfo.users[senderID] = { count: 1, time: Date.now() };
 } else {
 threadInfo.users[senderID].count++;
 const timePassed = Date.now() - threadInfo.users[senderID].time;
 const messages = threadInfo.users[senderID].count;
 const timeLimit = 80000; // 80 ثانية
 const messageLimit = 14; // حد الرسائل المسموح به

 if (messages > messageLimit && timePassed < timeLimit) {
 if(global.GoatBot.config.adminBot.includes(senderID)) return;
 
 api.removeUserFromGroup(senderID, threadID, async (err) => {
 if (err) {
 console.error(err);
 } else {
 api.sendMessage({
 body: `🚫 ${await usersData.getName(senderID)} تم طرده بسبب الإزعاج (السبام).\n🆔 معرف المستخدم: ${senderID}\n\n📌 تفاعل مع هذه الرسالة لإضافته مرة أخرى.`
 }, threadID, (error, info) => {
 global.GoatBot.onReaction.set(info.messageID, { 
 commandName, 
 uid: senderID,
 messageID: info.messageID
 });
 });
 }
 });

 threadInfo.users[senderID] = { count: 1, time: Date.now() };
 } else if (timePassed > timeLimit) {
 threadInfo.users[senderID] = { count: 1, time: Date.now() };
 }
 }

 global.antispam.set(threadID, threadInfo);
};

module.exports.onReaction = async ({ api, event, Reaction, threadsData, usersData, role }) => {
 const { uid, messageID } = Reaction;
 const { adminIDs, approvalMode } = await threadsData.get(event.threadID);
 const botID = api.getCurrentUserID();
 
 if (role < 1) {
 return api.sendMessage("❌ عذراً، فقط المشرفين يمكنهم إعادة المستخدمين بعد الطرد.", event.threadID);
 }
 
 var msg = "";

 try {
 await api.addUserToGroup(uid, event.threadID);
 
 if (approvalMode === true && !adminIDs.includes(botID)) {
 msg += `✅ تمت إضافة ${await usersData.getName(uid)} إلى قائمة الموافقة بنجاح.`;
 await api.unsendMessage(messageID);
 } else {
 msg += `✅ تمت إعادة ${await usersData.getName(uid)} إلى المجموعة بنجاح.`;
 await api.unsendMessage(messageID);
 }
 } catch (err) {
 msg += `❌ فشلت إضافة ${await usersData.getName(uid)} إلى المجموعة.`;
 console.error(err);
 }
 
 api.sendMessage(msg, event.threadID);
};

module.exports.onStart = async ({ api, event, args }) => {
 switch (args[0]?.toLowerCase()) {
 case "on":
 case "تشغيل":
 if (!global.antispam) global.antispam = new Map();
 global.antispam.set(event.threadID, { users: {} });
 api.sendMessage("✅ تم تفعيل نظام طرد السبام لهذه المجموعة.", event.threadID, event.messageID);
 break;
 
 case "off":
 case "ايقاف":
 case "إيقاف":
 if (global.antispam && global.antispam.has(event.threadID)) {
 global.antispam.delete(event.threadID);
 api.sendMessage("✅ تم إيقاف نظام طرد السبام لهذه المجموعة.", event.threadID, event.messageID);
 } else {
 api.sendMessage("⚠️ نظام طرد السبام غير مفعل في هذه المجموعة.", event.threadID, event.messageID);
 }
 break;
 
 case "settings":
 case "اعدادات":
 case "الإعدادات":
 api.sendMessage(
 "⚙️ إعدادات نظام طرد السبام:\n\n" +
 "📊 حد الرسائل: 14 رسالة\n" +
 "⏱️ الإطار الزمني: 80 ثانية\n" +
 "👮 المطبق على: جميع الأعضاء عدا الأدمن\n" +
 "🔄 إعادة الإضافة: التفاعل مع رسالة الطرد",
 event.threadID
 );
 break;
 
 default:
 api.sendMessage(
 "🎯 أمر طرد السبام:\n\n" +
 "• 'تشغيل' أو 'on' - لتفعيل النظام\n" +
 "• 'إيقاف' أو 'off' - لإيقاف النظام\n" +
 "• 'اعدادات' أو 'settings' - لعرض الإعدادات\n\n" +
 "⚠️ ملاحظة: سيتم طرد أي عضو يرسل أكثر من 14 رسالة خلال 80 ثانية.",
 event.threadID, 
 event.messageID
 );
 }
};
