const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

// Маршрут для отображения профиля пользователя
router.get('/profile', profileController.renderProfile);

// Маршрут для обновления номера телефона
router.post('/updateUserProfil', profileController.updateUserProfil);

// Маршрут для удаления профиля пользователя
router.post('/deleteProfile', profileController.deleteProfile);

// Маршрут для  отображения страницы обратно связи
router.get('/feedback', profileController.renderFeedback);

// Маршрут для отправки обратной связи
router.post('/feedback', profileController.feedback);


module.exports = router;




// // Маршрут для обновления номера телефона
// router.post('/updatePhoneNumber', profileController.updatePhoneNumber);

// // Маршрут для обновления Telegram
// router.post('/updateTelegramm', profileController.updateTelegramm);

// // Маршрут для обновления имени пользователя
// router.post('/updateUsername', profileController.updateUsername);

// // Маршрут для обновления email пользователя
// router.post('/updateEmail', profileController.updateEmail);

// // Маршрут для обновления настроек оповещений пользователя
// router.post('/updateAlerts', profileController.updateAlerts); 