const express = require('express');
const router = express.Router();
const resetPasswordController = require('../controllers/resetPasswordController');

// Маршрут для страницы сброса пароля
router.get('/reset-password/:token', resetPasswordController.renderResetPasswordPage);

// Маршрут для обработки запроса на сброс пароля
router.post('/reset-password/:token', resetPasswordController.handleResetPasswordRequest);

module.exports = router;
