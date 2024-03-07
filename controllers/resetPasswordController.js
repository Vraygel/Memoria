const bcrypt = require('bcrypt');
const User = require('../models/User');

// Функция для отображения страницы сброса пароля
exports.renderResetPasswordPage = async (req, res) => {
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
};

// Функция для обработки запроса на установку нового пароля
exports.handleResetPasswordRequest = async (req, res) => {
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
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.contactinfo.email.token = '';
    await user.save();

    res.render('login', { token, error: null, message: 'Пароль успешно изменен.' });

  } catch (error) {
    console.error(error);
    res.render('reset_password', { token, error: 'Что-то пошло не так. Попробуйте позже.', message: null });
  }
};
