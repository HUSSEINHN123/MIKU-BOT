const axios = require("axios");
const fs = require("fs");
const path = require("path");

const TASK_JSON = path.join(__dirname, "midj_tasks.json");
if (!fs.existsSync(TASK_JSON)) fs.writeFileSync(TASK_JSON, "{}");

const BASE_URL = async () => {
  const rakib = await axios.get("https://gitlab.com/Rakib-Adil-69/shizuoka-command-store/-/raw/main/apiUrls.json");
  return rakib.data.mj;
}

module.exports = {
  config: {
    name: "ميد",
    aliases: ["mj"],
    author: "Rakib Adil",
    version: "2.4.70",
    role: 0,
    shortDescription: "توليد الصور بالذكاء الاصطناعي بأسلوب MidJourney",
    longDescription: "قم بإنشاء صور بنمط MidJourney وتكبيرها باستخدام واجهة برمجة تطبيقات xnil..",
    category: "image",
    guide: "{pn} <prompt>"
  },

  ST: async function ({ args, message, event }) {
    const prompt = args.join(" ").trim();
    if (!prompt) return message.reply("⚠️ | المرجو ادخال برومبت بعد الأمر.");

    const loading = await message.reply("Generating image, please wait.. 🎨");
    await message.reaction("⏳", event.messageID);

    try {
      const res = await axios.get(`${await BASE_URL()}/imagine`, {
        params: { prompt: encodeURIComponent(prompt) }
      });

      const data = res.data;
      if (!data || !data.murl) {
        await message.unsend(loading.messageID);
        await message.reaction("❌", event.messageID);
        return message.reply("❌ | فشل إنشاء الصورة. يرجى المحاولة مرة أخرى لاحقاً.");
      }

      const taskId = data.taskId || "unknown";
      const murl = data.murl;

      const tasks = JSON.parse(fs.readFileSync(TASK_JSON, "utf8"));
      tasks[event.threadID] = taskId;
      fs.writeFileSync(TASK_JSON, JSON.stringify(tasks, null, 2));

      await message.unsend(loading.messageID);
      await message.reaction("✅", event.messageID);

      const img = await global.utils.getStreamFromURL(murl);
      const sent = await message.reply({
        body: `🧠 الـبـرومـبـت : ${prompt}\n💬 رد بـ U1-U2-U3-U4 مـن أجـل الـحـصـول عـلـى الـصـورة..`,
        attachment: img
      });

      global.GoatBot.onReply.set(sent.messageID, {
        commandName: module.exports.config.name,
        taskId,
        prompt
      });
    } catch (err) {
      console.error("Generation error:", err.message || err);
      await message.unsend(loading.messageID);
      await message.reaction("❌", event.messageID);
      return message.reply("❌ Generation failed. Try again later.");
    }
  },

  onReply: async function ({ event, Reply, message }) {
    const input = (event.body || "").trim().toLowerCase();
    const validActions = ["u1", "u2", "u3", "u4", "v1", "v2", "v3", "v4"];
    if (!validActions.includes(input)) return;

    const cid = input.replace(/[uv]/, "");
    const mode = input.startsWith("v") ? "variation" : "upscale";
    const processing = await message.reply(`🔄 | جـارٍ الـمـعـالـجـة ${input.toUpperCase()} (${mode})...`);
    await message.reaction("⏳", event.messageID);

    try {
      const endpoint = mode === "upscale" ? "up" : "var";
      const url = `${await BASE_URL()}/${endpoint}?tid=${Reply.taskId}&cid=${cid}`;

      const res = await axios.get(url);
      const data = res.data;

      if (!data || !data.url) {
        await message.unsend(processing.messageID);
        await message.reaction("❌", event.messageID);
        return message.reply(`❌ ${mode} failed for ${input.toUpperCase()}.`);
      }

      await message.unsend(processing.messageID);
      await message.reaction("✅", event.messageID);

      const img = await global.utils.getStreamFromURL(data.url);
      const sent = await message.reply({
        body: `✅ ${mode === "upscale" ? "رفـع جـودتـها" : "الـمـتـغـيـرات"} ${input.toUpperCase()} تـم.\n💬 رد عـلـى الـرسـالـة مـجـددا بـيـن U1 إلـى U4.. `,
        attachment: img
      });

      global.GoatBot.onReply.set(sent.messageID, {
        commandName: Reply.commandName,
        taskId: data.tid || Reply.taskId,
        prompt: Reply.prompt
      });
    } catch (err) {
      console.error(`${mode} error:`, err.message || err);
      await message.unsend(processing.messageID);
      await message.reaction("❌", event.messageID);
      message.reply(`❌ Error while processing ${input.toUpperCase()}. Try again later.`);
    }
  }
};
