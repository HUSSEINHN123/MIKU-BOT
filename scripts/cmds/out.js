const axios = require("axios");
const fs = require("fs-extra");
const request = require("request");
module.exports = {
	config: {
		name: "غادري",
		aliases: ["out"],
		version: "1.0",
		author: "Ullash ッ",
		countDown: 5,
		role: 2,
		shortDescription: "bot will leave gc",
		longDescription: "",
		category: "المطور",
		guide: {
			vi: "{pn} [tid,blank]",
			en: "{pn} [tid,blank]"
		}
	},

	onStart: async function ({ api,event,args, message }) {
 var id;
 if (!args.join(" ")) {
 id = event.threadID;
 } else {
 id = parseInt(args.join(" "));
 }
 return api.sendMessage('▣ | آسفة ، اردت البقاء لكنه امر من المطور ، وداعا !\nاتمنى لكم يوما سعيدا اعتنو بانفسكم 🌺', id, () => api.removeUserFromGroup(api.getCurrentUserID(), id))
		}
	};
