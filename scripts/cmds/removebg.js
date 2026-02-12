const axios = require("axios");
const fs = require("fs-extra");
const { shorten } = require("tinyurl");

const baseApiUrl = async () => {
  const base = await axios.get(
    `https://raw.githubusercontent.com/cyber-ullash/cyber-ullash/refs/heads/main/UllashApi.json`
  );
  return base.data.api2;
};

(async () => {
  global.apis = {
    UllashApi: await baseApiUrl()
  };
})();

module.exports = {
  config: {
    name: "ازالة",
    aliases: ["rbg"],
    version: "2.0",
    role: 0,
    author: "MAHBUB ULLASH",
    category: "خدمات",
    cooldowns: 5,
    guide: {
      en: "رد على صورة لإزالة الخلفية"
    }
  },

  onStart: async ({ api, event }) => {
    try {
      if (!event.messageReply || !event.messageReply.attachments[0]?.url) {
        return api.sendMessage("📸 | المرجو الرد على صورة !", event.threadID, event.messageID);
      }

      const imgUrl = event.messageReply.attachments[0].url;

      api.sendMessage("🕟 | 𝚁𝚎𝚖𝚘𝚟𝚒𝚗𝚐 𝙱𝚊𝚌𝚔𝚐𝚛𝚘𝚞𝚗𝚍, 𝚙𝚕𝚎𝚊𝚜𝚎 𝚠𝚊𝚒𝚝...", event.threadID, async (err, info) => {
        try {
          const shortURL = await shorten(imgUrl);

          const apiUrl = `${global.apis.UllashApi}/api/remove-background?imageUrl=${shortURL}`;

          const result = await axios.get(apiUrl);

          if (!result.data.result) {
            return api.sendMessage("❌ API Error: No result image found!", event.threadID, event.messageID);
          }

          const finalImage = result.data.result;
          const buffer = (await axios.get(finalImage, { responseType: "arraybuffer" })).data;

          const filePath = __dirname + `/cache/removedbg_${Date.now()}.png`;
          fs.writeFileSync(filePath, Buffer.from(buffer, "binary"));

          api.unsendMessage(info.messageID);

          api.sendMessage(
            {
              body: "✨ | 𝙷𝚎𝚛𝚎'𝚜 𝚢𝚘𝚞𝚛 𝚒𝚖𝚊𝚐𝚎 (𝙱𝙶 𝚁𝚎𝚖𝚘𝚟𝚎𝚍)!",
              attachment: fs.createReadStream(filePath)
            },
            event.threadID,
            () => fs.unlinkSync(filePath),
            event.messageID
          );

        } catch (err) {
          api.sendMessage(`❌ 𝙴𝚛𝚛𝚘𝚛: ${err.message}`, event.threadID, event.messageID);
        }
      });

    } catch (e) {
      api.sendMessage("❌ An error occurred while processing your request.", event.threadID);
    }
  }
};
