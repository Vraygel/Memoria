const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const glossaryController = require('../controllers/glossaryController');


// Роут для для отображения страницы создания нового раздела
router.get('/createGlossary/', glossaryController.createGlossaryPage);

// Роут для создания нового словаря
router.post('/', glossaryController.createGlossary);

// Роут для отображения страницы редактирования словаря
router.get('/editGlossary/:id', glossaryController.editGlossaryPage);

// Роут для для сохранения нового названия раздела
router.post('/editGlossary/:id', glossaryController.editGlossary);

// Роут для удаления словаря
router.get('/deleteGlossary/:id', glossaryController.deleteGlossary);


// Роут для страницы со словарями пользователя
router.get('/', glossaryController.GlossarysPage);






module.exports = router;