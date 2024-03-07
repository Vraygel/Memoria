const express = require('express');
const router = express.Router();
const wordController = require('../controllers/wordController');

// Роут для отображения страницы редактирования слова
router.get('/editWord/:id', wordController.getEditWordPage);

// Роут для обновления данных слова
router.post('/editWord/:id', wordController.updateWord);

// Роут для удаления слова из словаря
router.post('/deleteWord/:id', wordController.deleteWord);

module.exports = router;
