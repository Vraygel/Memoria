const express = require('express');
const router = express.Router();
const indexController = require('../controllers/indexController');

// Маршрут для регистрации нового пользователя
router.get('/', indexController.keyEffective);



module.exports = router;