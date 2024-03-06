const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  _id: String,
  userlogin: String,
  password: String,
	username: String,
	userstatus: String,
	balance: Number,
  contactinfo: {
    email: {
			email: String,
			token: String,
			confirmation: Boolean
		},
    phoneNumber: String,
		telegramm: String,
		chatId: String
  },
	alerts:{
		email: Boolean,
		whatsapp: Boolean,
		telegramm: Boolean,
		push : Boolean,
	}
});

module.exports = mongoose.model('User', userSchema);
