const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/User');
const nodemailer = require('nodemailer');

require('dotenv').config();
const emailPass = process.env.emailPass



// Контроллер для отображения страницы обновления пароля пользователя
exports.updateUserPasswordPage = async (req, res) => {

  try {

		// Находим пользователя по его ID
		const user = await User.findById(req.user._id);
    if (!user) {
      // Если пользователь с таким токеном не найден
      req.flash('message', 'Пользователь не найден');
      return res.redirect('/auth/login');
    }

    const token = ''
    // Отображаем страницу установки нового пароля
    res.render('resetPassword', { token, messages: req.flash('message') });

  } catch (error) {
    req.flash('message', 'Что-то пошло не так. Попробуйте позже');
    console.error(error);
    res.render('resetPassword', { token, messages: req.flash('message') });
  }

};

// Контроллер для обновления пароля пользователя
exports.updateUserPassword = async (req, res) => {
	try {
		// Находим пользователя по его ID
		const user = await User.findById(req.user._id);
   
		if (!user) {
			req.flash('message', 'Пользователь не найден');
			return res.redirect('/auth/login');
		}

    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      req.flash('message', 'Пароли не совпадают')
      return res.render('resetPassword', { token, messages: req.flash('message') });
    }
    
     // Сохраняем новый парол
     const hashedPassword = await bcrypt.hash(password, 10);
     user.password = hashedPassword;
     user.contactinfo.email.token = '';
     await user.save();
     // Перед перенаправлением сохраняем сообщение в сеансе
     req.flash('message', 'Пароль успешно изменен')
		res.redirect('/user/profile');

	} catch (error) {
		console.error(error);
		req.flash('message', 'Произошла ошибка при изменении пароля');
		res.redirect('/user/profile');
	}
};




// Функция для отображения страницы сброса пароля
exports.renderResetPasswordPage = async (req, res) => {
  try {
    const token = req.params.token;
    const user = await User.findOne({ 'contactinfo.email.token': token });
    console.log(user);

    if (!user) {
      // Если пользователь с таким токеном не найден
      req.flash('message', 'Неверный или истекший токен сброса пароля');
      return res.render('resetPassword', { token, messages: req.flash('message')});
    }

    // Отображаем страницу установки нового пароля
    res.render('resetPassword', { token, messages: req.flash('message') });

  } catch (error) {
    req.flash('message', 'Что-то пошло не так. Попробуйте позже');
    console.error(error);
    res.render('resetPassword', { token, messages: req.flash('message') });
  }
};

// Функция для обработки запроса на установку нового пароля
exports.handleResetPasswordRequest = async (req, res) => {
  try {
    const token = req.params.token;
		const user = await User.findOne({ 'contactinfo.email.token': token });
    const { password, confirmPassword } = req.body;

		if (!user) {
      req.flash('message', 'Неверный или истекший токен сброса пароля')
      return res.render('resetPassword', { token, messages: req.flash('message') });
    }

    if (password !== confirmPassword) {
      req.flash('message', 'Пароли не совпадают')
      return res.render('resetPassword', { token, messages: req.flash('message') });
    }

    
    // Сохраняем новый пароль и сбрасываем токен
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.contactinfo.email.token = '';
    await user.save();
    // Перед перенаправлением сохраняем сообщение в сеансе
    req.flash('message', 'Пароль успешно изменен')
    res.redirect('/auth/login');

  } catch (error) {
    console.error(error);
    req.flash('message', 'Что-то пошло не так. Попробуйте ещё раз')
    res.render('resetPassword', { token, messages: req.flash('message') });
  }
};


// Функция для отображения страницы с формой сброса пароля
exports.renderForgotPasswordPage = (req, res) => {
  res.render('forgotPassword', { messages: req.flash('message') }); // шаблон forgot_password.ejs
};

// Функция для обработки запроса на сброс пароля и отправки письма на электронную почту
exports.handleForgotPasswordRequest = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ 'contactinfo.email.email': email });

    if (!user) {
      // Если пользователь с таким email не найден
      req.flash('message', 'Пользователь не найден');
      return res.render('forgotPassword', { messages: req.flash('message') });
    }

    // Генерируем уникальный токен для сброса пароля
    const token = crypto.randomBytes(32).toString('hex');
    user.contactinfo.email.token = token;
    await user.save();

    // Отправляем email с ссылкой для сброса пароля
    const transporter = nodemailer.createTransport({
      host: 'smtp.yandex.com',
    port: 465,
    secure: true, // это значение говорит о том, что используется SSL
      auth: {
        user: 'neverhoteb@yandex.ru',
        pass: `${emailPass}`
      }
    });

    const mailOptions = {
      from: 'neverhoteb@yandex.ru',
      to: email,
      subject: 'Запрос на сброс пароля Memboost',
      html: `
      Если вы не оформляли данную заявку, то проигнорируйте письмо.<br><br>
      <a href="https://memboost.ru/password/resetPassword/${token}"><b>Сбросить пароль!</b></a><br><br>
      Если данное письмо вы получили по ошибке, проигнорируйте его.
      `
    };

    // Отправка письма
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        req.flash('message', 'Ошибка при отправке письма. Попробуйте позже');
        res.render('forgotPassword', { messages: req.flash('message') });
      } else {
        console.log('Email sent: ' + info.response);
        // Перед перенаправлением сохраняем сообщение в сеансе
        req.flash('message', 'Письмо с инструкциями по сбросу пароля отправлено на ваш email. Если вы не получили письмо, проверьте папку "СПАМ"');
        res.redirect('/auth/login');
      }
    });

  } catch (error) {
    console.error(error);
    req.flash('message', 'Что-то пошло не так. Попробуйте позже');
    res.render('forgotPassword', { messages: req.flash('message') });
  }
};
