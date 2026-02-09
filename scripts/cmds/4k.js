const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
name: "جودة",
version: "1.0.3",
permission: 0,
credits: "NIROB",
description: "رفع جودة الصورة من خلال الرد عليها",
category: "خدمات",
usages: "رد على صورة",
cooldowns: 5
};

module.exports.onStart = async function({ api, event }) {
try {
// Check if the message is a reply with an image
if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0 || event.messageReply.attachments[0].type !== "photo") {
return api.sendMessage("⚠️ | رد على صورة قبل كتابة الأمر.", event.threadID, event.messageID);
}

const imageUrl = event.messageReply.attachments[0].url;
api.sendMessage("⏳ | جارٍ ترقية صورتك إلى دقة 4K، يُرجى الانتظار...", event.threadID, event.messageID);

const upscaleApi = `https://mahbub-ullash.cyberbot.top/api/4k?imageUrl=${encodeURIComponent(imageUrl)}&size=high`;
const res = await axios.get(upscaleApi);

if (res.data?.success && res.data?.result) {
  const upscaledUrl = res.data.result;
  const tempPath = path.join(__dirname, `cache_${Date.now()}.png`);
  const writer = fs.createWriteStream(tempPath);

  const response = await axios.get(upscaledUrl, { responseType: "stream" });
  response.data.pipe(writer);

  writer.on("finish", () => {
    api.sendMessage(
      { body: "✅ | تمت ترقية الصورة إلى دقة 4K بنجاح!", attachment: fs.createReadStream(tempPath) },
      event.threadID,
      () => fs.unlinkSync(tempPath),
      event.messageID
    );
  });

  writer.on("error", (err) => {
    console.error(err);
    api.sendMessage("❌ Failed to process upscaled image.", event.threadID, event.messageID);
  });

} else {
  api.sendMessage("❌ Failed to upscale image.", event.threadID, event.messageID);
}

} catch (err) {
console.error(err);
api.sendMessage("⚠️ Error while upscaling image: ${err.message}", event.threadID, event.messageID);
}
};
