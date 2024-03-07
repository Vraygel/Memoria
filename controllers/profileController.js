const User = require('../models/User');
const bot = require('../utils/telegramBot'); // Импорт экземпляра бота

require('dotenv').config();

// Функция для отображения профиля пользователя
exports.renderProfile = async (req, res) => {

	try {
		// Находим пользователя по его ID
		const user = await User.findById(req.user._id);
		if (!user) {
			// Если пользователь не найден, выводим сообщение об ошибке и перенаправляем на страницу профиля
			req.flash('error', 'Пользователь не найден');
			return res.redirect('/profile');
		}

		// Обрабатываем событие приема сообщения от бота Telegram
		bot.on('message', async (msg) => {
			console.log(msg);
			let userloginTelegramm = req.user.contactinfo.telegramm.toLowerCase().trim();
			let userloginTelegrammMemoria = msg.chat.username.toLowerCase().trim();
			if (userloginTelegramm == userloginTelegrammMemoria) {
					user.contactinfo.chatId = msg.chat.id;
					await user.save();
			}
	});


		// Рендерим шаблон профиля и передаем в него данные пользователя
		res.render('profile', { user });
	} catch (error) {
		console.error(error);
		// Если произошла ошибка, выводим сообщение об ошибке и перенаправляем на страницу профиля
		req.flash('error', 'Произошла ошибка');
		res.redirect('/profile');
	}
};

// Регулярное выражение для валидации номера телефона в формате российского номера
const phoneRegex = /^((\+7|7|8)+([0-9]){10})$/;

// Регулярное выражение для валидации email
const emailRegex = /^[\w-]+(\.[\w-]+)*@([a-z0-9-]+\.)+[a-z]{2,}$/i;

// Регулярное выражение для валидации Telegramm (только латинские буквы или цифры)
const telegrammRegex = /^[a-zA-Z0-9]+$/;


// Контроллер для обновления номера телефона
exports.updatePhoneNumber = async (req, res) => {
	try {
		const phoneNumber = req.body.phoneNumber;
		// Проверяем, соответствует ли номер телефона формату российского номера
		if (!phoneRegex.test(phoneNumber)) {
			req.flash('error', 'Неверный формат номера телефона');
			return res.redirect('/profile');
		}

		const user = await User.findById(req.user._id);
		if (!user) {
			req.flash('error', 'Пользователь не найден');
			return res.redirect('/profile');
		}

		user.contactinfo.phoneNumber = req.body.phoneNumber;
		await user.save();
		res.redirect('/profile');
	} catch (error) {
		console.error(error);
		req.flash('error', 'Произошла ошибка при обновлении номера телефона');
		res.redirect('/profile');
	}
};

// Контроллер для обновления Telegram
exports.updateTelegramm = async (req, res) => {
	try {
		const telegramm = req.body.telegramm;
		// Проверяем, соответствует ли Telegramm формату латинских букв или цифр
		if (!telegrammRegex.test(telegramm)) {
			// const errorMessage = 'Неверный формат Telegramm';
			res.locals.errorMessage = 'Неверный формат Telegramm'; // Добавляем сообщение об ошибке в объект locals
			return res.redirect('/profile');
		}

		const user = await User.findById(req.user._id);
		if (!user) {
			req.flash('error', 'Пользователь не найден');
			return res.redirect('/profile');
		}

		user.contactinfo.telegramm = req.body.telegramm;
		await user.save();
		res.redirect('/profile');
	} catch (error) {
		console.error(error);
		req.flash('error', 'Произошла ошибка при обновлении Telegram');
		res.redirect('/profile');
	}
};

// Контроллер для обновления имени пользователя
exports.updateUsername = async (req, res) => {
	try {
		const user = await User.findById(req.user._id);
		if (!user) {
			req.flash('error', 'Пользователь не найден');
			return res.redirect('/profile');
		}

		user.username = req.body.username;
		await user.save();
		res.redirect('/profile');
	} catch (error) {
		console.error(error);
		req.flash('error', 'Произошла ошибка при обновлении имени пользователя');
		res.redirect('/profile');
	}
};

// Контроллер для обновления email пользователя
exports.updateEmail = async (req, res) => {
	try {
		const userEmail = req.body.useremail;
		// Проверяем, соответствует ли email формату валидного email
		if (!emailRegex.test(userEmail)) {
			req.flash('error', 'Неверный формат email');
			return res.redirect('/profile');
		}

		const user = await User.findById(req.user._id);
		if (!user) {
			req.flash('error', 'Пользователь не найден');
			return res.redirect('/profile');
		}

		user.contactinfo.email.email = req.body.useremail;
		await user.save();
		res.redirect('/profile');
	} catch (error) {
		console.error(error);
		req.flash('error', 'Произошла ошибка при обновлении email');
		res.redirect('/profile');
	}
};

// Контроллер для обновления настроек оповещений пользователя
exports.updateAlerts = async (req, res) => {
	try {
		// Обновляем поля оповещений пользователя на основе данных из формы
		const email = req.body.email === 'on';
		const whatsapp = req.body.whatsapp === 'on';
		const telegramm = req.body.telegramm === 'on';
		const push = req.body.push === 'on';

		await User.findByIdAndUpdate(req.user._id, { alerts: { email, whatsapp, telegramm, push } });

		// Обновляем данные пользователя в сессии
		req.user.alerts = { email, whatsapp, telegramm, push };

		// Перенаправляем пользователя обратно на страницу настроек с сообщением об успешном обновлении
		req.flash('success', 'Настройки оповещений успешно обновлены');
		res.redirect('/profile');
	} catch (error) {
		console.error(error);
		// Перенаправляем пользователя с сообщением об ошибке
		req.flash('error', 'Произошла ошибка при обновлении настроек оповещений');
		res.redirect('/profile');
	}
};


