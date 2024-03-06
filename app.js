const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Dictionary = require('./models/Dictionary');
const flash = require('connect-flash');
// const TelegramBot = require('node-telegram-bot-api');
const nodemailer = require('nodemailer'); // Для отправки писем подтверждения
const bodyParser = require('body-parser');
const crypto = require('crypto');
const router = express.Router();


require('dotenv').config();

const isAuthenticated = require('./middleware/isAuthenticated');
const isAdmin = require('./middleware/isAdmin');

const app = express();



// // Замените 'YOUR_TELEGRAM_BOT_TOKEN' на ваш токен, который вы получили от BotFather
// const telegrammToken = process.env.telegrammToken
// const bot = new TelegramBot(`${telegrammToken}`, { polling: true });


app.use(bodyParser.urlencoded({ extended: true }));




// Подключение к MongoDB
mongoose.connect('mongodb://localhost:27017/passport-example', { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => {
		console.log('Connected to MongoDB')
	})
	.catch(err => console.error('Error connecting to MongoDB:', err));



// Настройка Express
app.set('view engine', 'ejs');
app.use(flash());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());



app.use((req, res, next) => {
	res.locals.messages = req.flash();
	next();
});



const users = require('./routes/users');
















// // Удаление всех пользователей из базы данных
// // Dictionary.deleteMany({})
//   .then(() => {
//     console.log('All users have been deleted');
//   })
//   .catch((err) => {
//     console.error('Error deleting users:', err);
//   });








// Настройка обслуживания статических файлов из директории "public"
app.use(express.static('public'));


passport.use(new LocalStrategy({
	usernameField: 'userlogin',
	passReqToCallback: true
}, (req, userlogin, password, done) => {
	// Использование req здесь
}));



// Настройка Passport
passport.use(new LocalStrategy({ usernameField: 'userlogin', passReqToCallback: true }, (req, userlogin, password, done) => {
	User.findOne({ userlogin: userlogin })
		.then(user => {
			if (!user) {

				console.log('НЕ верный логин');
				req.flash('error', 'ошибка логина')
				return done(null, false, { message: 'Incorrect name.' }); // Возвращаем сообщение об ошибке

			}
			bcrypt.compare(password, user.password)
				.then(res => {
					if (res) { return done(null, user); }
					else {

						console.log('НЕ верный пароль');
						return done(null, false);

					}
				})
				.catch(err => done(err));
		})
		.catch(err => done(err));
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
	User.findById(id)
		.then(user => {
			done(null, user);
		})
		.catch(err => {
			done(err, null);
		});
});



// Добавляем middleware для проверки аутентификации перед isAdmin
app.use(isAuthenticated);

// Затем добавляем middleware isAdmin
app.use(isAdmin);



// Маршруты
app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res, next) => {

	// Проверяем, если пользователь уже аутентифицирован, перенаправляем его на главную страницу
	if (req.isAuthenticated()) {
		return res.redirect('/profile');
	} else {
		console.log(req.flash('message')); // Проверяем, что флеш-сообщения установлены
		// Иначе рендерим страницу входа
		// res.render('login', { messages: 'Неверный Логин или пароль'}); // Передаем сообщения об ошибках на страницу

		res.render('login'); // Передаем сообщения об ошибках на страницу
		// res.render('login');
	}

});


app.post('/login',
	passport.authenticate('local', {
		failureRedirect: '/login', // Перенаправление на страницу входа
		failureFlash: true, // Включение флеш-сообщений
	}),
	function (req, res) {
		res.redirect(req.user.userstatus === 'admin' ? '/admin' : '/profile'); // Перенаправление на главную страницу в случае успешной аутентификации
	}
);



app.use('/users', users); 
// app.use('/users/register', users)


// app.post('/register', async (req, res) => {
// 	try {
// 		// Генерация временного токена
// 		const token = crypto.randomBytes(20).toString('hex');

// 		const existingUser = await User.findOne({ userlogin: req.body.userlogin });
// 		if (existingUser) {
// 			req.flash('error', 'Пользователь с таким логином уже существует');
// 			return res.redirect('/register');
// 		}

// 		// Хеширование пароля
// 		const hashedPassword = await bcrypt.hash(req.body.password, 10);

// 		// Создание нового пользователя
// 		const user = new User({
// 			_id: uuid.v4(),
// 			userlogin: req.body.userlogin,
// 			password: hashedPassword,
// 			name: req.body.username,
// 			contactinfo: {
// 				email: {
// 					email: req.body.email,
// 					token: token,
// 					confirmation: false
// 				},
// 				phoneNumber: req.body.phoneNumber,
// 				telegramm: req.body.telegramm
// 			},
// 			alerts: {
// 				email: false,
// 				whatsapp: false,
// 				telegramm: false,
// 				push: false,
// 			},
// 		});

// 		// Сохранение пользователя в базе данных
// 		await user.save();

// 		// Отправка письма для подтверждения email
// 		sendConfirmationEmail(req.body.email, token);

// 		// Перенаправление пользователя на страницу профиля
// 		res.redirect('/');
// 		// res.render('confirm_email', { token, error: 'Неверный код подтверждения. Попробуйте еще раз.' });
// 	} catch (error) {
// 		console.error(error);
// 		res.redirect('/');
// 	}
// });



// Обработчик GET запроса для подтверждения email по токену
app.get('/confirm-email/:token', async (req, res) => {
	try {
		const token = req.params.token;

		// Находим пользователя по токену
		const user = await User.findOne({ 'contactinfo.email.token': token });

		// Проверяем, найден ли пользователь и действителен ли токен
		if (!user || user.contactinfo.email.confirmation || !user.contactinfo.email.token || user.contactinfo.email.token !== token) {
			// Если пользователя не найдено, токен уже использован или токен не совпадает, возвращаем ошибку
			return res.status(400).send('Токен недействителен или уже использован.');
		}

		// Обновляем статус подтверждения email и удаляем токен
		user.contactinfo.email.confirmation = true;
		user.contactinfo.email.token = undefined;
		await user.save();

		// Перенаправляем пользователя на страницу, где можно сообщить об успешном подтверждении email
		res.redirect('/email-confirmed');
	} catch (error) {
		console.error(error);
		res.status(500).send('Произошла ошибка при подтверждении email.');
	}
});

// Обработчик GET запроса для страницы с сообщением об успешном подтверждении email
app.get('/email-confirmed', (req, res) => {
	res.render('confirm_email'); // Предполагается, что у вас есть шаблон email_confirmed.ejs
});








// app.get('/login', (req, res) => {

// 	res.render('login');
// });





// Отображение страницы сброса пароля
app.get('/forgot-password', (req, res) => {
	res.render('forgot_password'); // Предполагается, что у вас есть шаблон forgot_password.ejs
});

// Обработка запроса на сброс пароля и отправка письма на электронную почту с ссылкой для сброса пароля
app.post('/forgot-password', async (req, res) => {
	try {
		const { email } = req.body;
		const user = await User.findOne({ 'contactinfo.email.email': email });

		if (!user) {
			// Если пользователь с таким email не найден
			return res.render('forgot_password', { error: 'Пользователь с таким email не найден' });
		}

		// Генерируем уникальный токен для сброса пароля
		const token = crypto.randomBytes(32).toString('hex');
		user.contactinfo.email.token = token;
		await user.save();

		// Отправляем email с ссылкой для сброса пароля
		const transporter = nodemailer.createTransport({
			service: 'Yandex',
			auth: {
				user: 'neverhoteb@yandex.ru',
				pass: 'Ghjcnjqgfhjkm1981_yan'
			}
		});

		const mailOptions = {
			from: 'neverhoteb@yandex.ru',
			to: email,
			subject: 'Сброс пароля Memoria',
			text: `Для сброса пароля перейдите по следующей ссылке: http://example.com/reset-password/${token}`
		};

		transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				console.log(error);
				res.render('forgot_password', { error: 'Ошибка при отправке письма. Попробуйте позже.' });
			} else {
				console.log('Email sent: ' + info.response);
				res.render('forgot_password', { message: 'Письмо с инструкциями по сбросу пароля отправлено на ваш email.' });
			}
		});

	} catch (error) {
		console.error(error);
		res.render('forgot_password', { error: 'Что-то пошло не так. Попробуйте позже.' });
	}
});

// Отображение страницы установки нового пароля
app.get('/reset-password/:token', async (req, res) => {
	try {
		const token = req.params.token;
		const user = await User.findOne({ 'contactinfo.email.token': token });

		if (!user) {
			// Если пользователь с таким токеном не найден
			return res.render('reset_password', { token, error: 'Неверный или истекший токен сброса пароля.', message: null });
		}

		// Отображаем страницу установки нового пароля
		res.render('reset_password', { token, error: null, message: null });

	} catch (error) {
		console.error(error);
		res.render('reset_password', { token, error: 'Что-то пошло не так. Попробуйте позже.', message: null });
	}
});

// Обработка запроса на установку нового пароля и сохранение его в базе данных пользователя
app.post('/reset-password/:token', async (req, res) => {
	try {
		const token = req.params.token;
		const { password, confirmPassword } = req.body;

		if (password !== confirmPassword) {
			return res.render('reset_password', { token, error: 'Пароли не совпадают.', message: null });
		}

		const user = await User.findOne({ 'contactinfo.email.token': token });

		if (!user) {
			return res.render('reset_password', { token, error: 'Неверный или истекший токен сброса пароля.', message: null });
		}

		// Сохраняем новый пароль и сбрасываем токен
		const hashedPassword = await bcrypt.hash(req.body.password, 10);

		user.password = hashedPassword;
		user.contactinfo.email.token = '';
		console.log(user);
		await user.save();

		res.render('/login', { token, error: null, message: 'Пароль успешно изменен.' });

	} catch (error) {
		console.error(error);
		res.render('reset_password', { token, error: 'Что-то пошло не так. Попробуйте позже.', message: null });
	}
});













app.post('/updatePhoneNumber', async (req, res) => {
	try {
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
});

app.post('/updateTelegramm', async (req, res) => {

	try {
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
		req.flash('error', 'Произошла ошибка при обновлении Telegramm');
		res.redirect('/profile');
	}
});

app.post('/updateUsername', async (req, res) => {
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
		req.flash('error', 'Произошла ошибка при обновлении имени');
		res.redirect('/profile');
	}
});

app.post('/updateEmail', async (req, res) => {
	try {
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
		req.flash('error', 'Произошла ошибка при обновлении имени');
		res.redirect('/profile');
	}
});




app.get('/dictionaries', async (req, res) => {
	try {
		const userId = req.user._id;
		// console.log(userId);
		// Найти все словари, принадлежащие текущему пользователю
		const dictionaries = await Dictionary.find({ user: userId });
		// console.log(Dictionary);
		// console.log(dictionaries);

		res.render('dictionaries', { dictionaries });
	} catch (error) {
		console.error(error);
		res.status(500).send('Internal Server Error');
	}
});


app.post('/createDictionary', async (req, res) => {
	try {
		// Получаем идентификатор текущего пользователя
		const userId = req.user._id;

		// Создаем новый словарь и присваиваем ему идентификатор пользователя
		const newDictionary = new Dictionary({
			name: req.body.dictionaryName,
			user: userId
		});

		// Сохраняем словарь
		await newDictionary.save();

		res.redirect('/dictionaries');
	} catch (error) {
		console.error(error);
		res.status(500).send('Internal Server Error');
	}
});


// Маршрут для удаления словаря
app.get('/deleteDictionary', async (req, res) => {
	try {
		const dictionaryId = req.query.id;
		await Dictionary.findByIdAndDelete(dictionaryId);
		res.redirect('/dictionaries');
	} catch (error) {
		console.error(error);
		res.status(500).send('Internal Server Error');
	}
});

// Маршрут для редактирования словаря
app.get('/editDictionary/:id', async (req, res) => {
	try {
		// Находим словарь по ID
		const dictionary = await Dictionary.findById(req.params.id);
		// console.log(dictionary);
		if (!dictionary) {
			// Если словарь не найден, возвращаем страницу с сообщением об ошибке
			req.flash('error', 'Словарь не найден');
			return res.redirect('/dictionaries');
		}
		// Отображаем страницу редактирования словаря с данными о словаре
		res.render('editDictionary', { dictionary });
	} catch (error) {
		console.error(error);
		req.flash('error', 'Произошла ошибка при загрузке словаря для редактирования');
		res.redirect('/dictionaries');
	}
});

app.post('/editDictionary/:id', async (req, res) => {
	try {
		const dictionaryId = req.params.id;
		// console.log(dictionaryId);
		const { word, translation } = req.body; // Предполагается, что вы отправляете данные о слове и его переводе из формы
		const dictionary = await Dictionary.findByIdAndUpdate(dictionaryId, { $push: { words: { word, translation } } }, { new: true });
		if (!dictionary) {
			return res.status(404).send('Словарь не найден');
		}
		res.redirect(`/dictionariesList/${dictionaryId}`);
	} catch (error) {
		console.error(error);
		res.status(500).send('Произошла ошибка при обновлении словаря');
	}
});

// Метод для обновления словаря
app.post('/updateDictionary/:id', async (req, res) => {
	try {
		// Находим словарь по ID
		const dictionary = await Dictionary.findById(req.params.id);
		let id = req.params.id
		if (!dictionary) {
			// Если словарь не найден, возвращаем страницу с сообщением об ошибке
			req.flash('error', 'Словарь не найден');
			return res.redirect('/dictionaries');
		}
		// Обновляем данные словаря
		// dictionary.name = req.body.dictionaryName;
		dictionary.words.push({ enum: 'new', expectation: 'wait', waitingTime: 0, word: req.body.word, translation: req.body.translation })
		console.log(dictionary);

		// Сохраняем обновленный словарь
		await dictionary.save();
		req.flash('success', 'Словарь успешно обновлен');
		res.redirect(`/dictionariesList/${id}`);
	} catch (error) {
		console.error(error);
		req.flash('error', 'Произошла ошибка при обновлении словаря');
		res.redirect('/dictionaries');
	}
});

app.get('/dictionariesList/:id', async (req, res) => {
	try {
		const dictionaryId = req.params.id;
		const dictionary = await Dictionary.findById(dictionaryId); // Предположим, что ваша модель называется Dictionary
		if (!dictionary) {
			return res.status(404).send('Словарь не найден');
		}
		// console.log(dictionary);
		res.render('dictionariesList', { dictionary, dictionaryId: dictionaryId }); // Отправляем данные о словаре в шаблон ejs для отображения
	} catch (error) {
		console.error(error);
		res.status(500).send('Произошла ошибка при загрузке данных о словаре');
	}
});

app.post('/deleteWord/:id', async (req, res) => {
	try {
		const wordId = req.params.id;
		// Найдите слово по его идентификатору и удалите его из словаря
		const dictionary = await Dictionary.findOneAndUpdate(
			{ 'words._id': wordId },
			{ $pull: { words: { _id: wordId } } },
			{ new: true }
		);

		// Проверка, было ли удаление успешным
		if (!dictionary) {
			return res.status(404).send('Слово не найдено');
		}

		res.render('dictionariesList', { dictionary, dictionaryId: '' }); // Отправляем данные о словаре в шаблон ejs для отображения
	} catch (error) {
		console.error(error);
		res.status(500).send('Произошла ошибка при удалении слова');
	}
});

app.get('/editWord/:id', async (req, res) => {
	try {
		const wordId = req.params.id;
		const dictionaryId = req.query.dictionaryId; // Параметр должен называться dictionaryId
		const dictionary = await Dictionary.findById(dictionaryId);
		if (!dictionary) {
			return res.status(404).send('Словарь не найден');
		}
		const word = dictionary.words.id(wordId);
		// console.log(word);
		if (!word) {
			return res.status(404).send('Слово не найдено');
		}
		res.render('editWord', { word, dictionaryId }); // Передаем данные о слове и идентификаторе словаря в шаблон для редактирования
	} catch (error) {
		console.error(error);
		res.status(500).send('Произошла ошибка при загрузке данных о слове');
	}
});


app.post('/editWord/:id', async (req, res) => {
	try {
		const wordId = req.params.id;
		const updatedWordData = req.body; // Предположим, что данные слова отправляются в теле запроса

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

		// Обновляем данные слова
		dictionary.words[wordIndex].word = updatedWordData.word;
		dictionary.words[wordIndex].translation = updatedWordData.translation;

		// Сохраняем обновленный словарь в базе данных
		await dictionary.save();

		// После успешного обновления перенаправляем пользователя обратно на страницу редактирования словаря
		res.redirect(`/dictionariesList/${dictionary._id}`);
	} catch (error) {
		console.error(error);
		res.status(500).send('Произошла ошибка при обновлении слова');
	}
});


app.get('/study/:id', async (req, res) => {

	try {
		const dictionaryId = req.params.id;
		const dictionary = await Dictionary.findById(dictionaryId); // Предположим, что ваша модель называется Dictionary
		if (!dictionary) {
			return res.status(404).send('Словарь не найден');
		}
		res.render('study', { dictionary, dictionaryId: dictionaryId }); // Отправляем данные о словаре в шаблон ejs для отображения
	} catch (error) {
		console.error(error);
		res.status(500).send('Произошла ошибка при загрузке данных о словаре');
	}
});

app.post('/study/:id', async (req, res) => {
	try {
		const dictionary = await Dictionary.findById(req.params.id);
		let id = req.params.id
		res.redirect(`/study/${id}`);
	} catch (error) {
		console.error(error);
		req.flash('error', 'Произошла ошибка при обновлении словаря');
		res.redirect('/dictionaries');
	}
});








// // Middleware для проверки статуса пользователя
// function isAdmin(req, res, next) {
//   // Проверяем, авторизован ли пользователь и имеет ли он статус admin
//   if (req.isAuthenticated() && req.user && req.user.userstatus === 'admin') {
// 			return next(); // Если пользователь админ, пропускаем запрос дальше
//   }
//   // Если пользователь не админ, перенаправляем его на другую страницу или выводим ошибку
//   res.redirect('/profile');
// }


// Маршрут для страницы администратора
app.get('/admin', isAdmin, async (req, res) => {

	try {
		// Здесь ваш код для обработки запроса, например, получение информации о пользователях
		const users = await User.find({});

		// const user = await User.findOne({ userlogin: 'inhoteb' });
		// user.userstatus = 'admin'
		// console.log(user);
		// await user.save();

		const user = await User.findOne();
		console.log(user);

		const dictionaries = await Dictionary.find({});


		// const userId = req.user._id;
		// Рендеринг шаблона с информацией о пользователях
		// const dictionaries = await Dictionary.find({});
		res.render('admin', { users: users, dictionaries: dictionaries });
	} catch (error) {
		console.error('Error:', error);
		res.status(500).send('Internal Server Error');
	}
});

app.post('/deleteUser/:id', async (req, res) => {
	const id = req.params.id;


	try {
		const user = await User.findById(id);

		const deletedUser = await User.findByIdAndDelete(id);
		// console.log(deletedUser);
		console.log(id + " sxldfk j;sadlfajsdf");
		if (deletedUser) {
			res.redirect('/admin'); // Перенаправление после успешного удаления
		} else {
			res.status(404).send('Пользователь не найден');
		}
	} catch (error) {
		console.error(error);
		res.status(500).send('Ошибка при удалении пользователя');
	}
});


// Маршрут для отображения страницы настроек оповещений
app.get('/alerts', isAuthenticated, (req, res) => {
	res.render('alerts', { user: req.user });
});

// Маршрут для обновления настроек оповещений
app.post('/updateAlerts', isAuthenticated, async (req, res) => {
	try {
		// Обновление полей оповещений пользователя на основе данных из формы
		const { email, whatsapp, telegramm, push } = req.body;
		await User.findByIdAndUpdate(req.user._id, { alerts: { email, whatsapp, telegramm, push } });

		// Обновляем данные пользователя в сессии
		req.user.alerts = { email, whatsapp, telegramm, push };

		// Перенаправление пользователя обратно на страницу настроек с сообщением об успешном обновлении
		req.flash('success', 'Настройки оповещений успешно обновлены');
		res.redirect('/profile');
	} catch (error) {
		console.error(error);
		// Перенаправление пользователя с сообщением об ошибке
		req.flash('error', 'Произошла ошибка при обновлении настроек оповещений');
		res.redirect('/profile');
	}
});



app.post('/updateUser/:userId', async (req, res) => {
	try {
		const userId = req.params.userId;
		const updatedData = req.body; // Предполагается, что данные для обновления передаются в теле запроса

		// Найдем пользователя по его идентификатору и обновим его данные
		const user = await User.findByIdAndUpdate(userId, updatedData, { new: true });

		if (!user) {
			// Если пользователь не найден, вернем соответствующий ответ
			return res.status(404).send('Пользователь не найден');
		}

		// Пользователь успешно обновлен, перенаправим его на страницу профиля или другую страницу
		res.redirect('/profile');
	} catch (error) {
		console.error(error);
		// Обработка ошибки
		res.status(500).send('Произошла ошибка');
	}
});

// app.get('/createUser', (req, res) => {
// 	res.render('createUser'); // Рендеринг шаблона страницы создания нового пользователя
// });

// // Проверка аутентификации
// function isAuthenticated(req, res, next) {
// 	if (req.isAuthenticated()) {
// 		return next();
// 	}
// 	res.redirect('/login');
// }




// Запуск сервера
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
