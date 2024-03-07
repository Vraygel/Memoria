// В папке routes создайте файл forgotPasswordRoutes.js
const express = require('express');
const router = express.Router();
const forgotPasswordController = require('../controllers/forgotPasswordController');

// Маршрут для страницы с формой сброса пароля
router.get('/forgot-password', forgotPasswordController.renderForgotPasswordPage);

// Маршрут для обработки запроса на сброс пароля
router.post('/forgot-password', forgotPasswordController.handleForgotPasswordRequest);

module.exports = router;
