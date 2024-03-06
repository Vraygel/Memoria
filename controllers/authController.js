const crypto = require('crypto');
const bcrypt = require('bcrypt');
const User = require('../models/User');
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
