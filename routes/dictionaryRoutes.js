const express = require('express');
const router = express.Router();
const dictionaryController = require('../controllers/dictionaryController');

// Роут для страницы со словарями пользователя
router.get('/', dictionaryController.dictionariesPage);

// Роут для создания нового словаря
router.post('/', dictionaryController.createDictionary);

// Роут для удаления словаря
router.post('/deleteDictionary/:id', dictionaryController.deleteDictionary);





// // Роут для обновления словаря
// router.post('/updateDictionary/:id', dictionaryController.updateDictionaryItem);

// Роут для получения данных о словаре по его ID
router.get('/dictionariesList/:id', dictionaryController.getDictionaryById);


module.exports = router;