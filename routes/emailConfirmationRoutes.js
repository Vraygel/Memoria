const express = require('express');
const router = express.Router();
const emailConfirmationController = require('../controllers/emailConfirmationController');

// Маршрут для подтверждения email по токену
router.get('/:token', emailConfirmationController.confirmEmail);

module.exports = router;
