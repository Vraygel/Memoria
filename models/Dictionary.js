const mongoose = require('mongoose');

const dictionarySchema = new mongoose.Schema({
		name: String,
		user: String,
		isPublic: Boolean,
		words: [
			{ enum: String, expectation: String, waitingTime: String, word: String, translation: String },
		]
});

const Dictionary = mongoose.model('Dictionary', dictionarySchema);

module.exports = Dictionary;

