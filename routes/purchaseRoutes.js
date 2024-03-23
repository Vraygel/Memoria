const express = require('express');
const router = express.Router();

// Подключение контроллера
const purchaseController = require('../controllers/purchaseController');

// GET запрос на страницу покупки
router.get('/', purchaseController.renderPurchasePage);

// POST запрос для покупки слов
router.post('/words', purchaseController.purchaseWords);

// POST запрос для покупки словарей
router.post('/dictionaries', purchaseController.purchaseDictionaries);

module.exports = router;