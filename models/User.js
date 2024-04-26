const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	_id: String,
	userlogin: String,
	password: String,
	username: String,
	userstatus: String,
	dateRegistration: Object,
	balance: {
		balanceAllTime: Number,
		memoCoin: Number,
	},
	dictionaries: {
		dictionariesСreated: Number,
	},
	words: {
		wordsСreated: Number,
	},
	contactinfo: {
		email: {
			email: String,
			token: String,
			confirmation: Boolean
		},
		phoneNumber: String,
		// telegramm: String,
		chatId: String
	},
	alerts: {
		email: Boolean,
		whatsapp: Boolean,
		telegramm: Boolean,
		push: Boolean,
	}
});

module.exports = mongoose.model('User', userSchema);
