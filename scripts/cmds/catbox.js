const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

module.exports = {
  config: {
    name: "رابط",
    version: "1.2.0",
    author: "CYBER ULLASH",
    countDown: 5,
    role: 0,
    shortDescription: "رفع المرفقات سواء صور ، صوت ، فيديو الى موقع catbox",
    longDescription: "ترد على صورة/مقطع/فيديو وتحصل على رابط مباشر",
    category: "خدمات"
  },

  onStart: async function({ api, event }) {
    let loadingMsg;
    try {
      if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
        return api.sendMessage("❌ | رد على مرفق 𝐉𝐏𝐆/𝐏𝐍𝐆/𝐌𝐏4/𝐌𝐏3 للحصول على رابط", event.threadID, event.messageID);
      }

      loadingMsg = await api.sendMessage("⏳ | جارٍ الرفع الى catbox...", event.threadID);

      const attachment = event.messageReply.attachments[0];
      const fileUrl = attachment.url;
      const type = attachment.type;

      let ext = ".mp3";
      if (type === "photo") ext = ".jpg";
      else if (type === "video") ext = ".mp4";

      const filePath = path.join(__dirname, "cache", `${Date.now()}${ext}`);

      const response = await axios.get(fileUrl, { responseType: "stream" });
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      const form = new FormData();
      form.append("reqtype", "fileupload");
      form.append("fileToUpload", fs.createReadStream(filePath));

      const uploadRes = await axios.post("https://catbox.moe/user/api.php", form, {
        headers: form.getHeaders()
      });

      fs.unlinkSync(filePath);

      const finalLink = uploadRes.data.trim();
      if (!finalLink.startsWith("http")) {
        if (loadingMsg) await api.unsendMessage(loadingMsg.messageID);
        return api.sendMessage("❌ 𝐔𝐩𝐥𝐨𝐚𝐝 𝐟𝐚𝐢𝐥𝐞𝐝. 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐥𝐢𝐧𝐤.", event.threadID, event.messageID);
      }

      if (loadingMsg) await api.unsendMessage(loadingMsg.messageID);

      return api.sendMessage(finalLink, event.threadID, event.messageID);

    } catch (err) {
      if (loadingMsg) await api.unsendMessage(loadingMsg.messageID);
      return api.sendMessage("❌ 𝐔𝐩𝐥𝐨𝐚𝐝 𝐟𝐚𝐢𝐥𝐞𝐝.\n" + err.message, event.threadID, event.messageID);
    }
  }
};
