const crypto = require('crypto');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Dictionary = require('../models/Dictionary');
const passport = require('passport');
const uuid = require('uuid');
const bot = require('../utils/telegramBot'); // Импорт экземпляра бота
const { sendConfirmationEmail } = require('../utils/email');




// Обработка GET-запроса на страницу регистрации
exports.getRegisterPage = (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/profile');
    } else {
        res.render('register', { messages: req.flash('message') } );
    }
};

// Обработка регистрации нового пользователя
exports.registerUser = async (req, res) => {
    try {
        // Генерация временного токена
        const token = crypto.randomBytes(20).toString('hex');

        // Проверка, существует ли пользователь с таким логином
        const existingUser = await User.findOne({ userlogin: req.body.userlogin });
        if (existingUser) {
            console.log('error', 'Пользователь с таким логином уже существует');
            req.flash('message', 'Пользователь с таким логином уже существует');
            return res.redirect('/auth/register');
        }

        // Проверка, существует ли пользователь с таким Email
        const existingUserEmail = await User.findOne({ 'contactinfo.email.email': req.body.email });
        if (existingUserEmail) {
            console.log('error', 'Пользователь с таким Email уже существует');
            req.flash('message', 'Пользователь с таким Email уже существует');
            return res.redirect('/auth/register');
        }

        // Хеширование пароля
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Создание нового пользователя
        const user = new User({
            _id: uuid.v4(),
            userlogin: req.body.userlogin,
            password: hashedPassword,
            username: req.body.username,
            userstatus: 'user',
            dateRegistration: new Date(),
            balance: {
                memoCoin: 0,
                balanceAllTime: 0,
            },
            dictionaries: {
                // dictionariesMax: 2,
                dictionariesСreated: 0,
            },
            words: {
                // wordsMax: 100,
                wordsСreated: 0,
            },
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
                email: true,
                whatsapp: false,
                telegramm: false,
                push: false,
            },
        });

        // Сохранение пользователя в базе данных
        await user.save();

        const mailOptions = {
			from: 'neverhoteb@yandex.ru',
			to: req.body.email,
			subject: 'Подтверждение email',
			html: `
					<p>Пожалуйста, подтвердите ваш email:</p>
					<a href="https://memboost.ru/confirmEmail/${token}">Подтвердить email</a>
			`
	    };

        // Отправка письма для подтверждения email
        sendConfirmationEmail(req.body.email, token, mailOptions);

        // Перенаправление пользователя на страницу входа
        res.redirect('/auth/login');
        // res.render('confirm_email', { token, error: 'Неверный код подтверждения. Попробуйте еще раз.' });
    } catch (error) {
        console.error(error);
        res.redirect('/');
    }
};

// Аутентификация пользователя
exports.authenticateUser = async (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        console.log(info);
        
        if (err) { // Если произошла ошибка аутентификации
            return next(err);
        }
        if (!user) { // Если пользователь не найден или аутентификация не удалась
            console.log(user);
            console.log('пользователь не найден или аутентификация не удалась');
            
            return res.redirect('/auth/login'); // Перенаправляем на страницу входа с сообщением об ошибке
        }
        // Если аутентификация прошла успешно
        req.logIn(user, async (err) => {
            if (err) {
                return next(err);
            }


            // Находим пользователя по его ID
            const user = await User.findById(req.user._id);
            if (!user) {
                // Если пользователь не найден, выводим сообщение об ошибке и перенаправляем на страницу профиля
                req.flash('message', 'Пользователь не найден');
                return res.redirect('/user/profile');
            }

            // Находим все словари, принадлежащие текущему пользователю
            const dictionaries = await Dictionary.find({ user: req.user._id });

            if(dictionaries == 0){
                return res.redirect('/user/profile');
            }

            // Обрабатываем событие приема сообщения от бота Telegram
            bot.on('message', async (msg) => {
                let userId = req.user._id;
                let userIdTelegrammMemboost = msg.text
                console.log(msg);
                if (user.contactinfo.chatId == msg.from.id) {
                    console.log('Сообщение из чат бота telegramm авторизованный пользователь ' + user.userlogin + " " + msg.text);
                } else {
                    if (userId == userIdTelegrammMemboost) {
                        user.contactinfo.chatId = msg.chat.id;
                        console.log('Пользователь индетифицирован в чат-боте телеграмм id' + msg.chat.id);
                        await user.save();
                    } else {
                        console.log('Сообщение из чат бота telegramm не авторизованный пользователь' + msg.text);
                    }
                }
            });

            return res.redirect('/study/repetition'); // Перенаправляем на страницу профиля после успешной аутентификации
        });
    })(req, res, next);
};


// Обработка GET-запроса на страницу входа
exports.getLoginPage = (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/study/repetition');
    } else {
        res.render('login', { messages: req.flash('message') } );
    }
};

// Функция для выхода пользователя из системы
exports.logoutUser = (req, res) => {
    // Вызываем метод logout(), предоставленный Passport для выхода пользователя из сеанса
    req.logout((err) => {
        if (err) {
            console.error('Ошибка при выходе пользователя:', err);
            // Обработка ошибки, если таковая имеется
            req.flash('message', 'Ошибка при выходе пользователя');
            return res.redirect('/user/profile', { messages: req.flash('message') }); // Перенаправление пользователя в случае ошибки
        }
        // После успешного выхода пользователя перенаправляем его на главную страницу
        res.redirect('/');
    });
};