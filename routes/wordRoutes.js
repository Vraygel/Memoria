const express = require('express');
const router = express.Router();
const multer = require('multer');
// const upload = multer({ dest: 'public/uploads/' }); // Папка для сохранения загруженных файлов
const path = require('path');
const termController = require('../controllers/termController');


// Настройка хранилища для сохранения файлов
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/') // Каталог, куда будут сохраняться загруженные файлы
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) // Имя файла
  }
})

// Создание экземпляра multer с настройками хранилища
const upload = multer({ storage: storage })

// Роут для отображения страницы добавления нового слова в словарь
router.get('/addTerm/:id', termController.addTerm);




// Роут для обновления словаря
router.post('/addWord/:id', upload.array('file'), termController.addWord);

// Роут для обновления словаря из эксель
router.post('/addWordEx/:id', upload.single('excelFile'), termController.addWordEx);

// Роут для загрузки файла в термин словаря
// router.post('/addWordFile/:id', upload.single('file'), termController.addWordFile);

// Роут для отображения страницы редактирования слова
router.get('/editWord/:id', termController.editWordPage);

// Роут для обновления данных термина
router.post('/editWord/:id', upload.array('file'), termController.updateWord);

// Роут для удаления слова из словаря
// router.post('/deleteWord/:id', termController.deleteWord);

// Роут для отображения страницы удаления слова из словаря
router.get('/deleteWord/:id', termController.deleteWord);

//Роут для удаления изображения из термина
router.post('/deleteWordImg/:id', termController.deleteWordImg);

//Роут для удаления аудио из термина
router.post('/deleteWordAudio/:id', termController.deleteWordAudio);

// Роут для проигрывания файла
// router.get('/playAudio/:id', wordController.playAudio);

// Роут для получения данных о словаре по его ID
router.get('/termList/:id', express.static(path.join(__dirname, 'uploads')), termController.getDictionaryById);

module.exports = router;


