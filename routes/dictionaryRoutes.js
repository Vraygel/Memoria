const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const dictionaryController = require('../controllers/dictionaryController');

// Роут для страницы со словарями пользователя
router.get('/', dictionaryController.dictionariesPage);

// Роут для создания нового словаря
router.post('/', dictionaryController.createDictionary);

// Роут для удаления словаря
router.post('/deleteDictionary/:id', dictionaryController.deleteDictionary);


// Роут для отображения страницы редактирования словаря
router.get('/editDictionary/:id', dictionaryController.editDictionaryPage);

// Роут для редактирования словаря
router.post('/editDictionary/:id', dictionaryController.editDictionary);



// // Роут для обновления словаря
// router.post('/updateDictionary/:id', dictionaryController.updateDictionaryItem);

// Роут для получения данных о словаре по его ID
router.get('/dictionariesList/:id', express.static(path.join(__dirname, 'uploads')), dictionaryController.getDictionaryById);


module.exports = router;