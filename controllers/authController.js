const crypto = require('crypto');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const passport = require('passport');
const uuid = require('uuid');

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
            balance: {
                memoCoin: 0,
                balanceAllTime: 0,
            },
            dictionaries: {
                dictionariesMax: 2,
                dictionariesСreated: 0,
            },
            words: {
                wordsMax: 100,
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
                email: false,
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
					<p>Пожалуйста, подтвердите ваш email, перейдя по следующей ссылке:</p>
					<a href="http://localhost:3000/confirmEmail/${token}">Подтвердить email</a>
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
exports.authenticateUser = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) { // Если произошла ошибка аутентификации
            return next(err);
        }
        if (!user) { // Если пользователь не найден или аутентификация не удалась
            // req.flash('message', 'Пользователь не найден. Не верный логин или пароль');
            return res.redirect('/auth/login'); // Перенаправляем на страницу входа с сообщением об ошибке
        }
        // Если аутентификация прошла успешно
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }

            return res.redirect('/user/profile'); // Перенаправляем на страницу профиля после успешной аутентификации
        });
    })(req, res, next);
};


// Обработка GET-запроса на страницу входа
exports.getLoginPage = (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/user/profile');
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

