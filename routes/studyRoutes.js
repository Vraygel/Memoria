const express = require('express');
const router = express.Router();
const studyController = require('../controllers/studyController');

// Роут для отображения страницы изучения слова
router.get('/words/:id', studyController.showStudyPage);

// Роут для обновления страницы изучения слова
// router.post('/words/:id', studyController.updateStudyPage);

// Роут для заучивания слова
router.post('/words/:id', studyController.repeatWord);
// router.post('/study/:id/repeated', isAuthenticated, studyController.repeatWord); // влючить после всех настроек

// Роут для повторения слова
router.get('/repetition/', studyController.repetitionWordPage);

// Роут для повторения слова
router.post('/repetition/:id', studyController.repetitionWord);

// Роут для заучивания конкретного слова (новая версия изучения)
router.get('/studyWord/:id', studyController.studyWordGet);

// Роут для заучивания конкретного слова (новая версия изучения)
router.post('/studyWord/:id', studyController.studyWordPost);



module.exports = router;
