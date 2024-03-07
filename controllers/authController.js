const crypto = require('crypto');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const passport = require('passport');
const uuid = require('uuid');

const { sendConfirmationEmail } = require('../utils/email');

// Обработка регистрации нового пользователя
exports.registerUser = async (req, res) => {
    try {
        // Генерация временного токена
        const token = crypto.randomBytes(20).toString('hex');

        // Проверка, существует ли пользователь с таким логином
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
};

// Аутентификация пользователя
exports.authenticateUser = (req, res, next) => {
	passport.authenticate('local', (err, user, info) => {
			if (err) { // Если произошла ошибка аутентификации
					return next(err);
			}
			if (!user) { // Если пользователь не найден или аутентификация не удалась
					req.flash('error', 'Invalid username or password');
					return res.redirect('/auth/login'); // Перенаправляем на страницу входа с сообщением об ошибке
			}
			// Если аутентификация прошла успешно
			req.logIn(user, (err) => {
					if (err) {
							return next(err);
					}
					return res.redirect('/profile'); // Перенаправляем на страницу профиля после успешной аутентификации
			});
	})(req, res, next);
};


// Обработка GET-запроса на страницу входа
exports.getLoginPage = (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/profile');
    } else {
        res.render('login');
    }
};

// Функция для выхода пользователя из системы
exports.logoutUser = (req, res) => {
	// Вызываем метод logout(), предоставленный Passport для выхода пользователя из сеанса
	req.logout((err) => {
			if (err) {
					console.error('Ошибка при выходе пользователя:', err);
					// Обработка ошибки, если таковая имеется
					return res.redirect('/'); // Перенаправление пользователя в случае ошибки
			}
			// После успешного выхода пользователя перенаправляем его на главную страницу
			res.redirect('/');
	});
};

