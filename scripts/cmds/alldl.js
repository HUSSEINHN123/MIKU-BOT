const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const baseApiUrl = async () => {
  const res = await axios.get(
    "https://raw.githubusercontent.com/cyber-ullash/cyber-ullash/refs/heads/main/UllashApi.json"
  );
  return res.data.api2;
};

function detectPlatformByUrl(url) {
  const u = (url || "").toLowerCase();

  if (u.includes("tiktok.com")) return "TikTok";
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "YouTube";
  if (u.includes("instagram.com") || u.includes("instagr.am")) return "Instagram";
  if (u.includes("facebook.com") || u.includes("fb.watch")) return "Facebook";
  if (u.includes("pinterest.com") || u.includes("pin.it")) return "Pinterest";
  if (u.includes("soundcloud.com")) return "SoundCloud";
  if (u.includes("likee.") || u.includes("like-video")) return "Likee";
  if (u.includes("threads.net")) return "Threads";
  if (u.includes("terabox.com") || u.includes("teraboxapp.com")) return "Terabox";
  if (u.includes("spotify.com")) return "Spotify";
  if (u.includes("drive.google.com")) return "Google Drive";
  if (u.includes("twitter.com") || u.includes("x.com")) return "TwitterDown";
  if (u.includes("capcut.com") || u.includes("capcut")) return "CapCut";
  if (u.includes("alldown") || u.includes("all-down")) return "AllDown";

  return "Unknown";
}

module.exports = {
  config: {
    name: "اوتو",
    version: "5.2.0",
    author: "Ullash",
    countDown: 3,
    role: 0,
    description: "تنزيل تلقائي للمقاطع الفيديو من منصات مدعومة",
    category: "وسائط"
  },

  onStart: async function () {},

  onChat: async function ({ message, event }) {
    const text = event.body || "";
    if (!text.startsWith("https://")) return;

    try {
      await message.reaction("💊");

      const apiBase = await baseApiUrl();

      const apiRes = await axios.get(
        `${apiBase}/api/alldl?url=${encodeURIComponent(text)}`
      );

      const raw = apiRes.data || {};
      const data = raw.data || {};

      let videoUrl = data.high || data.low;

      if (!videoUrl) {
        return message.reply("❌ Unable to download video! API returned no video.");
      }

      videoUrl = encodeURI(String(videoUrl).trim());

      await message.reaction("⏳");

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

      const filePath = path.join(cacheDir, "auto.mp4");

      const vidRes = await axios.get(videoUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(filePath, Buffer.from(vidRes.data));

      await message.reaction("☢️");

      let platform = data.platform || detectPlatformByUrl(text);
      const title = data.title || "No Title";

      const info = { platform, title };

      let shortUrl = videoUrl;
      if (global.utils?.shortenURL) {
        try {
          shortUrl = await global.utils.shortenURL(videoUrl);
        } catch {}
      }

      const msg = 
`╭◉━━━━◈━━━━◉╮
│ ✨ إكـتـمـل الـتـحـمـيـل  ⚠️
│ 
│ ☢️ الـمـنـصـة • ${info.platform || "Unknown"}
│ 🕳️ الـعـنـوان   • ${info.title || "No Title"}
│
│ 🌐 الـرابـط • ${shortUrl}
╰◉━━━━◈━━━━◉╯`;

      await message.reply({
        body: msg,
        attachment: fs.createReadStream(filePath)
      });

      try {
        fs.unlinkSync(filePath);
      } catch {}

      await message.reaction("✅");

    } catch (err) {
      console.error("Autodl Download Error:", err.message);
      await message.reaction("❎");
      message.reply("❌ Error downloading the video. Check URL or API.");
    }
  }
};
