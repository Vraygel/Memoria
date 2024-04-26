const express = require('express');
const router = express.Router();
const PasswordController = require('../controllers/PasswordController');


// Маршрут для отображения страницы изменения пароля профиля
router.get('/updateUserPassword', PasswordController.updateUserPasswordPage);

// Маршрут для обновления пароля профиля
router.post('/resetPassword', PasswordController.updateUserPassword);

// Маршрут для страницы сброса пароля
router.get('/resetPassword/:token', PasswordController.renderResetPasswordPage);

// Маршрут для обработки запроса на сброс пароля
router.post('/resetPassword/:token', PasswordController.handleResetPasswordRequest);

// Маршрут для страницы с формой сброса пароля
router.get('/forgotPassword', PasswordController.renderForgotPasswordPage);

// Маршрут для обработки запроса на сброс пароля
router.post('/forgotPassword', PasswordController.handleForgotPasswordRequest);

module.exports = router;