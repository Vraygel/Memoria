const express = require('express');
const router = express.Router();
const multer = require('multer');
// const upload = multer({ dest: 'uploads/' }); // Папка для сохранения загруженных файлов
const wordController = require('../controllers/wordController');


// Настройка хранилища для сохранения файлов
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Каталог, куда будут сохраняться загруженные файлы
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) // Имя файла
  }
})

// Создание экземпляра multer с настройками хранилища
const upload = multer({ storage: storage })


// Роут для отображения страницы добавления нового слова в словарь
router.get('/addWordPage/:id', wordController.addWordPage);


// Роут для обновления словаря
router.post('/addWord/:id', upload.single('file'), wordController.addWord);

// Роут для обновления словаря из эксель
router.post('/addWordEx/:id', upload.single('excelFile'), wordController.addWordEx);

// Роут для загрузки файла в термин словаря
// router.post('/addWordFile/:id', upload.single('file'), wordController.addWordFile);

// Роут для отображения страницы редактирования слова
router.get('/editWord/:id', wordController.editWordPage);

// Роут для обновления данных слова
router.post('/editWord/:id', wordController.updateWord);

// Роут для удаления слова из словаря
router.post('/deleteWord/:id', wordController.deleteWord);

module.exports = router;