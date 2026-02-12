const axios = require("axios");

module.exports.config = {
  name: "تخيل",
  version: "2.0",
  role: 0,
  author: "Dipto",
  description: "توليد صور من فلوكس",
  category: "Image gen",
  guide: "{pn} [برومبت] --ratio 1024x1024\n{pn} [prompt]",
  countDown: 15,
};

module.exports.onStart = async ({ message, event, args, api }) => {
  try {
    const prompt = args.join(" ");
    const waitMsg = await message.reply(' ⏱️ | يرجى الانتظار...');
    api.setMessageReaction("⌛", event.messageID, () => {}, true);

    
    const response = await axios.get(`https://mahbub-ullash.cyberbot.top/api/flux?prompt=${encodeURIComponent(prompt)}`, {
      responseType: 'stream',
    });

    api.setMessageReaction("✅", event.messageID, () => {}, true);
    message.unsend(waitMsg.messageID);

    await message.reply({
      body: `✔️ | تـفـضـل صـورتـك 🖼️`,
      attachment: response.data,
    });

  } catch (e) {
    console.log("Flux Error:", e);
    message.reply("Error: " + e.message);
  }
};
