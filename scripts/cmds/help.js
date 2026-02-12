fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;
const doNotDelete = "[ᗰIKᑌ ᗩI]"; 

module.exports = {
  config: {
    name: "اوامر",
    version: "1.17",
    author: "maher",
    aliases:["أوامر","الاوامر","help"],
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "قم بالاطلاع على الوامر و كيفية استعمالها",
    },
    longDescription: {
      en: "إطلع على قائمة الاوامر المتاحة وكيفبة استخدام كل امر على حدة",
    },
    category: "النظام",
    guide: {
      en: "{pn} *اوامر اسم-الامر ",
    },
    priority: 1,
  },

  onStart: async function ({ message, args, event, threadsData, role }) {
    const { threadID } = event;
    const threadData = await threadsData.get(threadID);
    const prefix = getPrefix(threadID);

    if (args.length === 0) {
      const categories = {};
      let msg = "╭───────❁";

      msg += `\n🅜🅘🅚🅤 🅐🅘 🅜🅔🅝🅤\n╰────────────❁`; 

      for (const [name, value] of commands) {
        if (value.config.role > 1 && role < value.config.role) continue;

        const category = value.config.category || "Uncategorized";
        categories[category] = categories[category] || { commands: [] };
        categories[category].commands.push(name);
      }

      Object.keys(categories).forEach((category) => {
        if (category !== "info") {
          msg += `\n╭─────✰『  ${category.toUpperCase()}  』`;


          const names = categories[category].commands.sort();
          for (let i = 0; i < names.length; i += 3) {
            const cmds = names.slice(i, i + 2).map((item) => `⭔${item}`);
            msg += `\n│${cmds.join(" ".repeat(Math.max(1, 5 - cmds.join("").length)))}`;
          }

          msg += `\n╰────────────✰`;
        }
      });

      const totalCommands = commands.size;
      msg += `\n\n╭─────✰[إسـتـمـتـع مـع مـيـكـو]\n│>إجـمـالـي عـدد الاوامـر: [${totalCommands}] أمـر\n│أكـتـب :[ ${prefix}أوامر <إسم-الامر> مـن اجـل مـزيـد مـن الـمـعـلومـات.]\n╰────────────✰`;
      msg += ``;
      msg += `\n╭─────✰\n│ ♥︎╣[❉ᗰIKᑌ ᗩI❉]╠♥︎\n╰────────────✰`; 

 				const helpListImages = [ "https://i.ibb.co/NBKQ3YH/7173-miku-nakano.jpg",
                                  "https://i.ibb.co/nMnqPBL8/miku-nakano-header-by-calmwrld-deosd1x-fullview.jpg",
                                  "https://i.ibb.co/v62Wc4Tw/miku-nakano-by-ayayotsuba-ded3rp7-fullview.jpg"];


      const helpListImage = helpListImages[Math.floor(Math.random() * helpListImages.length)];

      await message.reply({
        body: msg,
        attachment: await global.utils.getStreamFromURL(helpListImage)
      });
    } else {
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));

      if (!command) {
        await message.reply(`Command "${commandName}" not found.`);
      } else {
        const configCommand = command.config;
        const roleText = roleTextToString(configCommand.role);
        const author = configCommand.author || "Unknown";

        const longDescription = configCommand.longDescription ? configCommand.longDescription.en || "No description" : "No description";

        const guideBody = configCommand.guide?.en || "No guide available.";
        const usage = guideBody.replace(/{p}/g, prefix).replace(/{n}/g, configCommand.name);

        const response = `
  ╭───⊙
  │ 🔶 ${configCommand.name}
  ├── مـعـلـومـات
  │ 📝 الـوصـف: ${longDescription}
  │ 👑 الـمـؤلـف: ${author}
  │ ⚙ إرشـادات: ${usage}
  ├── كـيـفـيـة الاسـتـعـمـال
  │ 🔯 الاصـدار: ${configCommand.version || "1.0"}
  │ ♻ الـدور: ${roleText}
  ╰────────────⊙`;

        await message.reply(response);
      }
    }
  },
};

function roleTextToString(roleText) {
  switch (roleText) {
    case 0:
      return "0 (All users)";
    case 1:
      return "1 (Group administrators)";
    case 2:
      return "2 (Admin bot)";
    default:
      return "Unknown role";
  }
}
