const fs = require("fs-extra");

module.exports = {
	config: {
		name: "رست",
		version: "1.1",
		author: "NTKhang",
		countDown: 5,
		role: 2,
		description: {
			vi: "Khởi động lại bot",
			en: "إعادة تشغيل البوت"
		},
		category: "المطور",
		guide: {
			vi: "   {pn}: Khởi động lại bot",
			en: "   {pn}: إعادة تشغيل البوت"
		}
	},

	langs: {
		vi: {
			restartting: "🔄 | Đang khởi động lại bot..."
		},
		en: {
			restartting: "🔄 | جـارٍ إعـادة الـتـشـغـيـل..."
		}
	},

	onLoad: function ({ api }) {
		const pathFile = `${__dirname}/tmp/restart.txt`;
		if (fs.existsSync(pathFile)) {
			const [tid, time] = fs.readFileSync(pathFile, "utf-8").split(" ");
			api.sendMessage(`✅ | تـمـت إعـادة تـشـغـيـل الـبـوت بـنـجـاح\n⏰ | الـوقـت : ${(Date.now() - time) / 1000}s`, tid);
			fs.unlinkSync(pathFile);
		}
	},

	onStart: async function ({ message, event, getLang }) {
		const pathFile = `${__dirname}/tmp/restart.txt`;
		fs.writeFileSync(pathFile, `${event.threadID} ${Date.now()}`);
		await message.reply(getLang("restartting"));
		process.exit(2);
	}
};
