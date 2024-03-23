const Dictionary = require('../models/Dictionary');
const bot = require('../utils/telegramBot'); // Импорт экземпляра бота
const { sendConfirmationEmail } = require('../utils/email');
const User = require('../models/User');

require('dotenv').config();

// Middleware для сравнения текущей даты с датой из словаря
async function checkingDate(req, res, next) {
	try {
		// Извлекаем все записи из словаря
		const dictionaries = await Dictionary.find();

		dictionaries.forEach(async dictionary => {
			dictionary.words.forEach(async word => {
				const wordDate = new Date(word.waitingTime);
				const wordEnum = word.enum
				const reminderWord = word.reminder
				const currentDate = new Date();
				if (wordDate <= currentDate && wordEnum !== 'new' && reminderWord != true) {
					console.log(`Пора повторить слово "${word.word}" из словаря "${dictionary.name}"`);
					try {
						// Отправка сообщения пользователю после срабатывания таймера
						console.log('Пора повторить это слово!');
						
						// Обновление полей слова в словаре
						const updatedDictionary = await Dictionary.findByIdAndUpdate(
							dictionary._id,
							{
								$set: {
									'words.$[word].expectation': 'waited',
									'words.$[word].waitingTime': '0',
									'words.$[word].reminder': true
								}
							},
							{
								arrayFilters: [{ 'word._id': word._id }],
								new: true
							}
						);

						const user = await User.findOne({ _id: dictionary.user })
						const userChatId = user.contactinfo.chatId

						if (user.alerts.email) {
							const message = `<b>Пора повторить термины!</b>
						\n
						<a href="http://localhost:3000/study/repetition/">Повторять термины!</a>
						`
							const token = ''
							const email = user.contactinfo.email.email
							const mailOptions = {
								from: 'neverhoteb@yandex.ru',
								to: email,
								subject: 'Пора повторять слова',
								html: message
							};
							// Отправка письма для подтверждения email
							sendConfirmationEmail(email, token, mailOptions);
						}
						if (user.alerts.telegramm) {
							const message = `Пора повторить термины!	http://localhost:3000/study/repetition
						`
							if (userChatId != '') {
								function sendMessageToUser(chatId) {
									console.log('Отправлено сообщение в telegramm пользователю:' + user.userlogin);
									// bot.sendMessage(chatId, message, { parse_mode: 'html', disable_web_page_preview: true });
									bot.sendMessage(chatId, message);
								}
								// Отправляем сообщение пользователю
								sendMessageToUser(userChatId);
							}
						}
						if (user.alerts.whatsapp) {
							// Функция для отправки сообщения
						}
					} catch (error) {
						console.error('Error updating word:', error);
					}
				}
			});
		});
	} catch (error) {
		console.error('Error comparing dates:', error);
	}
}

module.exports = checkingDate;
