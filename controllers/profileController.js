const User = require('../models/User');
const Dictionary = require('../models/Dictionary');
const nodemailer = require('nodemailer');
const bot = require('../utils/telegramBot'); // Импорт экземпляра бота

const bcrypt = require('bcrypt');

require('dotenv').config();
const emailPass = process.env.emailPass
const chatIdTelegramm = process.env.chatIdTelegramm

// Контроллер для отображения профиля пользователя
exports.renderProfile = async (req, res) => {
	try {
		// Находим пользователя по его ID
		const user = await User.findById(req.user._id);
		if (!user) {
			// Если пользователь не найден, выводим сообщение об ошибке и перенаправляем на страницу профиля
			req.flash('message', 'Пользователь не найден');
			return res.redirect('/auth/login');
		}

		// // Обрабатываем событие приема сообщения от бота Telegram
		// bot.on('message', async (msg) => {
		// 	let userId = req.user._id;
		// 	let userIdTelegrammMemoria = msg.text
		// 	if (userId == userIdTelegrammMemoria) {
		// 		user.contactinfo.chatId = msg.chat.id;
		// 		console.log('Пользователь индетифицирован в чат-боте телеграмм id' + msg.chat.id);
		// 		await user.save();
		// 	} else {
		// 		console.log('Сообщение из чат бота telegramm не авторизованный пользователь' + msg.text);
		// 	}
		// });

		// Рендерим шаблон профиля и передаем в него данные пользователя
		res.render('profile', { user, messages: req.flash('message') });
	} catch (error) {
		console.error(error);
		console.error('Произошла ошибка загрузки профиля');
		// Если произошла ошибка, выводим сообщение об ошибке и перенаправляем на страницу профиля
		req.flash('message', 'Произошла ошибка загрузки профиля');
		res.redirect('/auth/login');
	}
};

// Контроллер для обновления профиля пользователя
exports.updateUserProfil = async (req, res) => {
	try {
		// Находим пользователя по его ID
		const user = await User.findById(req.user._id);

		if (!user) {
			req.flash('message', 'Пользователь не найден');
			return res.redirect('/auth/login');
		}

		// Регулярное выражение для валидации email
		const emailRegex = res.locals.EMAIL_REGEXP;
		const userEmail = req.body.useremail;


		// Проверяем, соответствует ли email формату валидного email
		if (userEmail !== '' & !emailRegex.test(userEmail)) {
			req.flash('message', 'Неверный формат email');
			return res.redirect('/user/profile');
		}



		// Регулярное выражение для валидации номера телефона в формате российского номера
		const phoneRegex = res.locals.TEL_REGEXP;
		const phoneNumber = req.body.phoneNumber;

		// Проверяем, соответствует ли номер телефона формату российского номера
		if (phoneNumber !== '' & !phoneRegex.test(phoneNumber)) {
			req.flash('message', 'Неверный формат номера телефона');
			return res.redirect('/user/profile');
		}



		// // Регулярное выражение для валидации Telegramm (только латинские буквы или цифры)
		// const telegrammRegex = /^[a-zA-Z0-9]+$/;
		// const telegramm = req.body.telegramm;

		// // Проверяем, соответствует ли Telegramm формату латинских букв или цифр
		// if (!telegrammRegex.test(telegramm)) {
		// 	// const errorMessage = 'Неверный формат Telegramm';
		// 	req.flash('message', 'Неверный формат Telegramm'); // Добавляем сообщение об ошибке
		// 	return res.redirect('/user/profile');
		// }

		user.username = req.body.username;
		user.contactinfo.email.email = req.body.useremail;
		user.contactinfo.phoneNumber = req.body.phoneNumber;
		// user.contactinfo.telegramm = req.body.telegramm;


		await user.save();

		// Обновляем поля оповещений пользователя на основе данных из формы
		const email = req.body.email === 'on';
		const whatsapp = req.body.whatsapp === 'on';
		const telegramm = req.body.telegramm === 'on';
		const push = req.body.push === 'on';

		await User.findByIdAndUpdate(req.user._id, { alerts: { email, whatsapp, telegramm, push } });

		// Обновляем данные пользователя в сессии
		req.user.alerts = { email, whatsapp, telegramm, push };

		req.flash('message', 'Профиль сохранён');
		res.redirect('/user/profile');

	} catch (error) {
		console.error(error);
		req.flash('message', 'Произошла ошибка при обновлении информации профиля');
		res.redirect('/user/profile');
	}
};

// Контроллер для удаления профиля пользователя и всех его словарей
exports.deleteProfile = async (req, res) => {
	try {
		// Удаляем профиль пользователя по его ID
		await User.findByIdAndDelete(req.user._id);


		// Удаляем все словари пользователя
		await Dictionary.deleteMany({ user: req.user._id });

		// Вызываем метод logout(), предоставленный Passport для выхода пользователя из сеанса
		req.logout((err) => {
			if (err) {
				console.error('Ошибка при выходе пользователя:', err);
				req.flash('message', 'Произошла ошибка при выходе пользователя');
				// Обработка ошибки, если таковая имеется
				return res.redirect('/user/profile'); // Перенаправление пользователя в случае ошибки
			}
			req.flash('message', 'Ваш профиль удалён');
			// После успешного выхода пользователя перенаправляем его на главную страницу
			res.redirect('/');
		});
	} catch (error) {
		console.error('Произошла ошибка при удалении профиля:', error);
		req.flash('message', 'Произошла ошибка при удалении профиля');
		res.redirect('/user/profile');
	}
};

// Контроллер для отображения страницы обратной связи
exports.renderFeedback = async (req, res) => {
	try {

		// Рендерим шаблон профиля и передаем в него данные пользователя
		res.render('feedback', { messages: req.flash('message') });
	} catch (error) {
		console.error(error);
		console.error('Произошла ошибка загрузки обратной связи');
		// Если произошла ошибка, выводим сообщение об ошибке и перенаправляем на страницу профиля
		req.flash('message', 'Произошла ошибка обратной связи');
		res.redirect('/user/profil');
	}
};


// Контроллер для отправки сообщения обратной связи
exports.feedback = async (req, res) => {
	try {
		// Находим пользователя по его ID
		const user = await User.findById(req.user._id);
		if (!user) {
			// Если пользователь не найден, выводим сообщение об ошибке и перенаправляем на страницу профиля
			req.flash('message', 'Пользователь не найден');
			return res.redirect('/auth/login');
		}

		
			const message = `
			Сообещение обратной связи с сайта Memoria
			\n
				${req.body.feedback}
			`
				function sendMessageToUser(chatId) {
					console.log('Отправлено сообщение по обратной связи:' + user.userlogin);
					// bot.sendMessage(chatId, message, { parse_mode: 'html', disable_web_page_preview: true });
					bot.sendMessage(chatId, message);
				}
				// Отправляем сообщение пользователю
				sendMessageToUser(chatIdTelegramm);

		// Отправляем email с ссылкой для сброса пароля
		const transporter = nodemailer.createTransport({
			service: 'Yandex',
			auth: {
				user: 'neverhoteb@yandex.ru',
				pass: `${emailPass}`
			}
		});

		const mailOptions = {
			from: 'neverhoteb@yandex.ru',
			to: 'vraygel@mail.ru',
			subject: 'Сообщение обратной связи с сайта Memoria',
			text: `
			${req.body.feedback}
			`
		};

		// Отправка письма
		transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				console.log(error);
				req.flash('message', 'Ошибка при отправке сообщения. Попробуйте позже');
				res.render('feedback', { messages: req.flash('message') });
			} else {
				console.log('Email sent: ' + info.response);
				// Перенаправляем пользователя на страницу, где можно сообщить об успешном подтверждении 
				req.flash('message', 'Ваш сообщение успешно отправлено');
				res.redirect('/user/profile');
			}
		});










		
	} catch (error) {
		console.error(error);
		console.error('Произошла ошибка загрузки обратной связи');
		// Если произошла ошибка, выводим сообщение об ошибке и перенаправляем на страницу профиля
		req.flash('message', 'Произошла ошибка обратной связи');
		res.redirect('/user/profil');
	}
};








// // Контроллер для обновления номера телефона
// exports.updatePhoneNumber = async (req, res) => {
// 	try {
// 		// Регулярное выражение для валидации номера телефона в формате российского номера
// 		const phoneRegex = res.locals.TEL_REGEXP;
// 		const phoneNumber = req.body.phoneNumber;

// 		// Проверяем, соответствует ли номер телефона формату российского номера
// 		if (!phoneRegex.test(phoneNumber)) {
// 			req.flash('message', 'Неверный формат номера телефона');
// 			return res.redirect('/user/profile');
// 		}

// 		const user = await User.findById(req.user._id);
// 		if (!user) {
// 			req.flash('error', 'Пользователь не найден');
// 			return res.redirect('/auth/login');
// 		}

// 		user.contactinfo.phoneNumber = req.body.phoneNumber;
// 		await user.save();
// 		res.redirect('/user/profile');
// 	} catch (error) {
// 		console.error(error);
// 		req.flash('message', 'Произошла ошибка при обновлении номера телефона');
// 		res.redirect('/user/profile');
// 	}
// };

// // Контроллер для обновления Telegram
// exports.updateTelegramm = async (req, res) => {
// 	try {
// 		// Регулярное выражение для валидации Telegramm (только латинские буквы или цифры)
// 		const telegrammRegex = /^[a-zA-Z0-9]+$/;
// 		const telegramm = req.body.telegramm;

// 		// Проверяем, соответствует ли Telegramm формату латинских букв или цифр
// 		if (!telegrammRegex.test(telegramm)) {
// 			// const errorMessage = 'Неверный формат Telegramm';
// 			req.flash('message', 'Неверный формат Telegramm'); // Добавляем сообщение об ошибке
// 			return res.redirect('/user/profile');
// 		}

// 		const user = await User.findById(req.user._id);
// 		if (!user) {
// 			req.flash('message', 'Пользователь не найден');
// 			return res.redirect('/auth/login');
// 		}

// 		user.contactinfo.telegramm = req.body.telegramm;
// 		await user.save();
// 		res.redirect('/user/profile');
// 	} catch (error) {
// 		console.error(error);
// 		req.flash('message', 'Произошла ошибка при обновлении Telegram');
// 		res.redirect('/user/profile');
// 	}
// };

// // Контроллер для обновления имени пользователя
// exports.updateUsername = async (req, res) => {
// 	try {
// 		const user = await User.findById(req.user._id);
// 		if (!user) {
// 			req.flash('error', 'Пользователь не найден');
// 			return res.redirect('/user/profile');
// 		}

// 		user.username = req.body.username;
// 		await user.save();
// 		res.redirect('/user/profile');
// 	} catch (error) {
// 		console.error(error);
// 		req.flash('error', 'Произошла ошибка при обновлении имени пользователя');
// 		res.redirect('/user/profile');
// 	}
// };

// // Контроллер для обновления email пользователя
// exports.updateEmail = async (req, res) => {
// 	try {
// 		// Регулярное выражение для валидации email
// 		const emailRegex = res.locals.EMAIL_REGEXP;

// 		const userEmail = req.body.useremail;
// 		// Проверяем, соответствует ли email формату валидного email
// 		if (!emailRegex.test(userEmail)) {
// 			req.flash('error', 'Неверный формат email');
// 			return res.redirect('/user/profile');
// 		}

// 		const user = await User.findById(req.user._id);
// 		if (!user) {
// 			req.flash('error', 'Пользователь не найден');
// 			return res.redirect('/user/profile');
// 		}

// 		user.contactinfo.email.email = req.body.useremail;
// 		await user.save();
// 		res.redirect('/user/profile');
// 	} catch (error) {
// 		console.error(error);
// 		req.flash('error', 'Произошла ошибка при обновлении email');
// 		res.redirect('/user/profile');
// 	}
// };

// // Контроллер для обновления настроек оповещений пользователя
// exports.updateAlerts = async (req, res) => {
// 	try {
// 		// Обновляем поля оповещений пользователя на основе данных из формы
// 		const email = req.body.email === 'on';
// 		const whatsapp = req.body.whatsapp === 'on';
// 		const telegramm = req.body.telegramm === 'on';
// 		const push = req.body.push === 'on';

// 		await User.findByIdAndUpdate(req.user._id, { alerts: { email, whatsapp, telegramm, push } });

// 		// Обновляем данные пользователя в сессии
// 		req.user.alerts = { email, whatsapp, telegramm, push };

// 		// Перенаправляем пользователя обратно на страницу настроек с сообщением об успешном обновлении
// 		req.flash('error', 'Настройки оповещений успешно обновлены');
// 		res.redirect('/user/profile');
// 	} catch (error) {
// 		console.error(error);
// 		// Перенаправляем пользователя с сообщением об ошибке
// 		req.flash('error', 'Произошла ошибка при обновлении настроек оповещений');
// 		res.redirect('/user/profile');
// 	}
// };