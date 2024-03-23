const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Маршрут для регистрации нового пользователя
router.post('/register', authController.registerUser);

// Маршрут для отображения страницы регистрации
router.get('/register', authController.getRegisterPage);

// Маршрут для аутентификации пользователя
router.post('/login', authController.authenticateUser);

// Маршрут для отображения страницы входа
router.get('/login', authController.getLoginPage);

// Маршрут для выхода пользователя из системы
router.get('/logout', authController.logoutUser);



module.exports = router;
