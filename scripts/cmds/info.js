const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
	config: {
		name: "المطور",
		aliases: ["owner"],
		author: "ULLASH ",
		role: 0,
		shortDescription: "معلومات حول المطور",
		longDescription: "",
		category: "معلومات",
		guide: "{pn}"
	},

	onStart: async function ({ api, event }) {
		try {
			const ULLASHInfo = {
				name: 'Maher ッ',
				gender: '𝐌𝐚𝐥𝐞',
				age: '19',
				Tiktok: 'ullash01',
				Relationship: '𝐢𝐧 𝐜𝐨𝐦𝐩𝐥𝐢𝐜𝐚𝐭𝐞𝐝',
				religion: '𝐈𝐬𝐥𝐚𝐦',
				facebook: 'https://www.facebook.com/profile.php?id=100086680386976'
			};

			const ULLASH = 'https://files.catbox.moe/do2kb3.jpeg';
			const tmpFolderPath = path.join(__dirname, 'tmp');

			if (!fs.existsSync(tmpFolderPath)) {
				fs.mkdirSync(tmpFolderPath);
			}

			const imgResponse = await axios.get(ULLASH, { responseType: 'arraybuffer' });
			const imgPath = path.join(tmpFolderPath, 'owner_img.jpeg');

			fs.writeFileSync(imgPath, Buffer.from(imgResponse.data, 'binary'));

			const response = `╭─────❁\n│  𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢  \n│
│𝐍𝐚𝐦𝐞: ${ULLASHInfo.name}
│𝐆𝐞𝐧𝐝𝐞𝐫 : ${ULLASHInfo.gender}
│𝐑𝐞𝐥𝐚𝐭𝐢𝐨𝐧𝐬𝐡𝐢𝐩 :${ULLASHInfo.Relationship}
│𝐀𝐠𝐞 :${ULLASHInfo.age}
│𝐑𝐞𝐥𝐢𝐠𝐢𝐨𝐧: ${ULLASHInfo.religion}
│𝐓𝐢𝐤𝐭𝐨𝐤 : ${ULLASHInfo.Tiktok}
│𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤: ${ULLASHInfo.facebook}\n╰────────────❁`;

			await api.sendMessage({
				body: response,
				attachment: fs.createReadStream(imgPath)
			}, event.threadID, event.messageID);

			fs.unlinkSync(imgPath);

			api.setMessageReaction('🐔', event.messageID, (err) => {}, true);
		} catch (error) {
			console.error('Error in ULLASHinfo command:', error);
			return api.sendMessage('An error occurred while processing the command.', event.threadID);
		}
	}
};
