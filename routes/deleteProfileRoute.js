const express = require('express');
const router = express.Router();
const deleteProfileController = require('../controllers/deleteProfileController');

// Маршрут для удаления профиля пользователя
router.post('/deleteProfile', deleteProfileController.deleteProfile);

module.exports = router;
