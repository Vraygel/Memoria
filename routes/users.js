const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const uuid = require('uuid');
const sendConfirmationEmail = require('../middleware/sendConfirmationEmail');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const telegrammToken = process.env.telegrammToken
const bot = new TelegramBot(`${telegrammToken}`, { polling: true });

// Обработчик POST запроса для регистрации
router.post('/register', async (req, res) => {
	try {
		// Генерация временного токена
		const token = crypto.randomBytes(20).toString('hex');

		const existingUser = await User.findOne({ userlogin: req.body.userlogin });
		if (existingUser) {
			req.flash('error', 'Пользователь с таким логином уже существует');
			return res.redirect('/user/register');
		}

		// Хеширование пароля
		const hashedPassword = await bcrypt.hash(req.body.password, 10);

		// Создание нового пользователя
		const user = new User({
			_id: uuid.v4(),
			userlogin: req.body.userlogin,
			password: hashedPassword,
			username: req.body.username,
			userstatus: req.body.userstatus,
			balance: 0,
			contactinfo: {
				email: {
					email: req.body.email,
					token: token,
					confirmation: false
				},
				phoneNumber: req.body.phoneNumber,
				telegramm: req.body.telegramm,
				chatId: ''
			},
			alerts: {
				email: false,
				whatsapp: false,
				telegramm: false,
				push: false,
			},
		});

		// Сохранение пользователя в базе данных
		await user.save();

		// Отправка письма для подтверждения email
		sendConfirmationEmail(req.body.email, token);

		// Перенаправление пользователя на страницу профиля
		res.redirect('/');
		// res.render('confirm_email', { token, error: 'Неверный код подтверждения. Попробуйте еще раз.' });
	} catch (error) {
		console.error(error);
		res.redirect('/');
	}
});

router.get('/register', (req, res) => {
	res.render('register'); // Передаем flash сообщения в шаблон

});

router.post('/deleteProfile', async (req, res) => {
	try {
		await User.findByIdAndDelete(req.user._id);
		req.logout(() => {
			res.redirect('/');
		});
	} catch (error) {
		console.error(error);
		req.flash('error', 'Произошла ошибка при удалении профиля');
		res.redirect('/profile');
	}
});

router.get('/logout', (req, res) => {
	req.logout(() => {
		res.redirect('/');
	});
});

router.get('/editUser/:id', async (req, res) => {
	try {
		const userId = req.params.id;
		console.log(userId);
		const user = await User.findById(userId);
		if (!user) {
			// Обработка случая, когда пользователь не найден
			return res.status(404).send('Пользователь не найден');
		}
		// Рендеринг шаблона страницы редактирования с найденным пользователем
		res.render('editUser', { user: user });
	} catch (error) {
		console.error(error);
		// Обработка ошибки
		res.status(500).send('Произошла ошибка');
	}
});

router.post('/editUser/:id', async (req, res) => {
	try {
			const user = await User.findById(req.params.id);
	
		// Изменение свойств пользователя
		user.username = req.body.username,
		user.userstatus = req.body.userstatus,
		user.balance = req.body.balance,
		user.contactinfo.email.email = req.body.email,
		user.contactinfo.phoneNumber = req.body.phoneNumber,
		user.contactinfo.telegramm = req.body.telegramm,
		user.alerts.email = req.body.emailNotification === 'on' ? true : false,
		user.alerts.whatsapp = req.body.whatsappNotification === 'on' ? true : false,
		user.alerts.telegramm = req.body.telegramNotification === 'on' ? true : false,
		user.alerts.push = req.body.pushNotification === 'on' ? true : false
	

		// Сохранение пользователя в базе данных
		console.log(user);
		await user.save();

		// Перенаправление пользователя на страницу профиля
		res.redirect('/admin');
		// res.render('confirm_email', { token, error: 'Неверный код подтверждения. Попробуйте еще раз.' });
	} catch (error) {
		console.error(error);
		console.log('Произошла ошибка при редактировании пользователя');
		req.flash('error', 'Произошла ошибка при редактировании пользователя');
		res.redirect('/editUser');
	}
});

router.get('/createUser', async (req, res) => {
	try {
		// Рендеринг шаблона страницы редактирования с найденным пользователем
		res.render('createUser');
	} catch (error) {
		console.error(error);
		// Обработка ошибки
		res.status(500).send('Произошла ошибка');
	}
});

router.post('/createUser', async (req, res) => {
	try {
		// Генерация временного токена
		const token = crypto.randomBytes(20).toString('hex');

		const existingUser = await User.findOne({ userlogin: req.body.userlogin });
		if (existingUser) {
			req.flash('error', 'Пользователь с таким логином уже существует');
			return res.redirect('/users/createUser');
		}

		// Хеширование пароля
		const hashedPassword = await bcrypt.hash(req.body.password, 10);

		// Создание нового пользователя
		const user = new User({
			_id: uuid.v4(),
			userlogin: req.body.userlogin,
			password: hashedPassword,
			username: req.body.username,
			userstatus: req.body.userstatus,
			balance: req.body.balance || 0,
			contactinfo: {
				email: {
					email: req.body.email,
					token: token,
					confirmation: false
				},
				phoneNumber: req.body.phoneNumber,
				telegramm: req.body.telegramm,
				chatId: ''
			},
			alerts: {
				email: req.body.emailNotification === 'on' ? true : false,
				whatsapp: req.body.whatsappNotification === 'on' ? true : false,
				telegramm: req.body.telegramNotification === 'on' ? true : false,
				push: req.body.pushNotification === 'on' ? true : false,
			},
		});

		// Сохранение пользователя в базе данных
		await user.save();

		// Перенаправление пользователя на страницу профиля
		res.redirect('/admin');
		// res.render('confirm_email', { token, error: 'Неверный код подтверждения. Попробуйте еще раз.' });
	} catch (error) {
		console.error(error);
		res.redirect('/createUser');
	}
});

router.get('/profile', async (req, res) => {
	res.render('profile', { user: req.user });
	try {
		const user = await User.findById(req.user._id);
		if (!user) {
			req.flash('error', 'Пользователь не найден');
			return res.redirect('/profile');
		}

		// Отдельно обрабатываем событие приема сообщения от бота
		bot.on('message', async (msg) => {
			let userloginTelegramm = req.user.contactinfo.telegramm.toLowerCase().trim();
			let userloginTelegrammMemoria = msg.chat.userlogin.toLowerCase().trim();
			if (userloginTelegramm == userloginTelegrammMemoria) {
				user.contactinfo.chatId = msg.chat.id;
				await user.save();
			}
		});

	} catch (error) {
		console.error(error);
		req.flash('error', 'Произошла ошибка');
		console.log('ыва фыва фыва фыва фыва');
		res.redirect('/profile');
	}
});


router.post('/study/:id/repeated', async (req, res) => {
	try {
		const wordId = req.params.id;
		console.log(req.user.contactinfo.telegramm);
		const chatId = req.user.contactinfo.chatId
		// console.log(wordId);
		const complexity = req.body.complexity; // Получаем значение из поля "complexity"

		// Найдем словарь, содержащий слово, по идентификатору слова
		const dictionary = await Dictionary.findOne({ 'words._id': wordId });
		if (!dictionary) {
			return res.status(404).send('Словарь не найден');
		}

		// Найдем индекс слова в массиве слов
		const wordIndex = dictionary.words.findIndex(word => word._id == wordId);
		if (wordIndex === -1) {
			return res.status(404).send('Слово не найдено');
		}
		dictionary.words[wordIndex].expectation = 'wait';
		let setTime

		switch (dictionary.words[wordIndex].enum) {
			// В случае, если значение равно 'new'
			case 'new':
				// Действие, которое нужно выполнить
				dictionary.words[wordIndex].enum = 'first';
				setTime = 60000
				break; // Обязательный оператор break, чтобы завершить блок switch
			case 'first':
				// Действие, которое нужно выполнить
				dictionary.words[wordIndex].enum = 'third';
				setTime = 1200000
				break; // Обязательный оператор break, чтобы завершить блок switch
			case 'third':
				// Действие, которое нужно выполнить
				dictionary.words[wordIndex].enum = 'fourth';
				setTime = 21600000
				break; // Обязательный оператор break, чтобы завершить блок switch			
			case 'fourth':
				// Действие, которое нужно выполнить
				dictionary.words[wordIndex].enum = 'fifth';
				setTime = 1512000000
				break; // Обязательный оператор break, чтобы завершить блок switch
			case 'fifth':
				// Действие, которое нужно выполнить
				dictionary.words[wordIndex].enum = 'sixth';
				setTime = 6574365000
				break; // Обязательный оператор break, чтобы завершить блок switch
			case 'sixth':
				// Действие, которое нужно выполнить
				dictionary.words[wordIndex].enum = 'seventh';
				setTime = 15768000000
				break; // Обязательный оператор break, чтобы завершить блок switch
			case 'seventh':
				// Действие, которое нужно выполнить
				dictionary.words[wordIndex].enum = 'eighth';
				setTime = 31536000000
				break; // Обязательный оператор break, чтобы завершить блок switch
			case 'eighth':
				// Действие, которое нужно выполнить
				dictionary.words[wordIndex].enum = 'eighth';
				setTime = 31536000000
				break; // Обязательный оператор break, чтобы завершить блок switch

			default:
				// Действие по умолчанию
				console.log('Это не новое слово');
				break; // Необязательный оператор break, но его желательно использовать
		}

		switch (complexity) {
			case 'easy':
				setTime = setTime + (setTime * 0.1)
				console.log(setTime);
				break;
			case 'hard':
				setTime = setTime - setTime * 0.1
				console.log(setTime);
				break;
		}

		function addMillisecondsToCurrentDate(milliseconds) {
			// Получаем текущую дату
			let currentDate = new Date();
			// Прибавляем заданное количество миллисекунд
			currentDate.setTime(currentDate.getTime() + milliseconds);
			// Возвращаем полученную дату
			return currentDate;
		}

		const newDate = addMillisecondsToCurrentDate(setTime);

		dictionary.words[wordIndex].waitingTime = newDate;

		setTimeout(async () => {
			try {
				// Отправка сообщения пользователю после срабатывания таймера
				console.log('Пора повторить это слово!');
				// Обновление полей слова в словаре
				const updatedDictionary = await Dictionary.findByIdAndUpdate(
					dictionary._id,
					{
						$set: {
							'words.$[word].expectation': 'waited',
							'words.$[word].waitingTime': '0'
						}
					},
					{
						arrayFilters: [{ 'word._id': dictionary.words[wordIndex]._id }],
						new: true
					}
				);

				// Здесь может быть ваш код для отправки сообщения пользователю
				// Функция для отправки сообщения пользователю с ссылкой
				let chatId = req.user.contactinfo.chatId
				function sendMessageToUser(chatId, dictionaryId) {
					const message = `Пора повторить слова из словаря! Начните учиться здесь: http://localhost:3000/study/${dictionaryId}`;
					bot.sendMessage(chatId, message);
				}
				sendMessageToUser(chatId, dictionary._id);
			} catch (error) {
				console.error('Error updating word:', error);
			}
		}, setTime); // Перевод времени в миллисекунды

		// Сохраняем обновленный словарь в базе данных
		await dictionary.save();

		// После успешного обновления перенаправляем пользователя обратно на страницу редактирования словаря
		res.redirect(`/study/${dictionary._id}`);
	} catch (error) {
		console.error(error);
		res.status(500).send('Произошла ошибка при обновлении слова');
	}
});

module.exports = router;