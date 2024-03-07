const express = require('express');
const router = express.Router();
const studyController = require('../controllers/studyController');
// const { isAuthenticated } = require('../middlewares/auth'); // влючить после всех настроек

// Роут для отображения страницы изучения словаря
router.get('/study/:id', studyController.showStudyPage);

// Роут для обновления страницы изучения словаря
router.post('/study/:id', studyController.updateStudyPage);

// Роут для повторения слова
router.post('/study/:id/repeated', studyController.repeatWord);
// router.post('/study/:id/repeated', isAuthenticated, studyController.repeatWord); // влючить после всех настроек

module.exports = router;
