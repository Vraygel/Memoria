const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

// const { isAuthenticated } = require('../middleware/authMiddleware'); // включить когда произведу полную сборку и настрой приложения

// Маршрут для отображения профиля пользователя
router.get('/profile', profileController.renderProfile);

// Маршрут для обновления номера телефона
router.post('/updatePhoneNumber', profileController.updatePhoneNumber);

// Маршрут для обновления Telegram
router.post('/updateTelegramm', profileController.updateTelegramm);

// Маршрут для обновления имени пользователя
router.post('/updateUsername', profileController.updateUsername);

// Маршрут для обновления email пользователя
router.post('/updateEmail', profileController.updateEmail);

// Маршрут для обновления настроек оповещений пользователя
// router.post('/updateAlerts', isAuthenticated, profileController.updateAlerts); // включить когда произведу полную сборку и настрой приложения
router.post('/updateAlerts', profileController.updateAlerts); // выключить когда произведу полную сборку и настрой приложения





module.exports = router;
