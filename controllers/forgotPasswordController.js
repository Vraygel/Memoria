const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('../models/User');

require('dotenv').config();

const emailPass = process.env.emailPass

// Функция для отображения страницы с формой сброса пароля
exports.renderForgotPasswordPage = (req, res) => {
  res.render('forgot_password'); // Предполагается, что у вас есть шаблон forgot_password.ejs
};

// Функция для обработки запроса на сброс пароля и отправки письма на электронную почту
exports.handleForgotPasswordRequest = async (req, res) => {
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
        pass: `${emailPass}`
      }
    });

    const mailOptions = {
      from: 'neverhoteb@yandex.ru',
      to: email,
      subject: 'Сброс пароля Memoria',
      text: `Для сброса пароля перейдите по следующей ссылке: http://example.com/reset-password/${token}`
    };

    // Отправка письма
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
};
