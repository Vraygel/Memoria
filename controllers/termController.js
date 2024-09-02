const Dictionary = require('../models/Dictionary');
const User = require('../models/User');
const ExcelJS = require('exceljs');
const fs = require('fs');
// const player = require('play-sound')();




// Контроллер для отображения страницы добавления нового слова в словарь
exports.addTerm = async (req, res) => {
    try {
        // Находим пользователя по его ID
        const user = await User.findById(req.user._id);
        if (!user) {
            // Если пользователь не найден, выводим сообщение об ошибке и перенаправляем на страницу профиля
            req.flash('message', 'Пользователь не найден');
            return res.redirect('/user/profile');
        }

        // Находим словарь по ID
        const dictionary = await Dictionary.findById(req.params.id);
        if (!dictionary) {
            // Если словарь не найден, возвращаем страницу с сообщением об ошибке
            req.flash('message', 'Раздел не найден');
            return res.redirect('/dictionaries');
        }

        // Отображаем страницу редактирования словаря с данными о словаре
        res.render('addTerm', { messages: req.flash('message'), dictionary });
    } catch (error) {
        console.error(error);
        req.flash('message', 'Что-то пошло не так. Попробуйте ещё раз');
        res.redirect('/dictionaries');
    }
};


// Контроллер для добавления нового слова в словарь моя старая версия
exports.addWord = async (req, res) => {
    try {
        // Находим словарь по ID
        const dictionary = await Dictionary.findById(req.params.id);
        const id = req.params.id;
        if (!dictionary) {
            // Если словарь не найден, возвращаем страницу с сообщением об ошибке
            req.flash('message', 'Раздел не найден');
            return res.redirect('/dictionaries');
        }

        // Находим пользователя по его ID
        const user = await User.findById(req.user._id);
        if (!user) {
            // Если пользователь не найден, выводим сообщение об ошибке и перенаправляем на страницу профиля
            req.flash('message', 'Пользователь не найден');
            return res.redirect('/user/profile');
        }

        // Обновляем данные словаря
        if (Array.isArray(req.body.word)) {
            req.body.word.forEach((word, index) => {
                const files = req.files;
                let img = {}
                let audio = {}

                if (!files || files.length === 0) {
                    img = {}
                    audio = {}
                }

                for (const file of files) {

                    if (file.mimetype == 'image/gif' || file.mimetype == 'image/png' || file.mimetype == 'image/jpeg') {
                        img = {
                            availability: true,
                            wordFileUrl: file.path,
                            wordFileOriginalname: file.originalname,
                            wordFileMimetype: file.mimetype,
                        }
                    }
                    if (file.mimetype == 'audio/wav' || file.mimetype == 'audio/mpeg') {
                        audio = {
                            availability: true,
                            wordFileUrl: file.path,
                            wordFileOriginalname: file.originalname,
                            wordFileMimetype: file.mimetype,
                        }
                    }
                }

                dictionary.words.push({ enum: 'new', reminder: false, expectation: 'wait', waitingTime: 0, img, audio, word: word, translation: req.body.translation[index] });

            });
        } else {
            const files = req.files;

            let img = {}
            let audio = {}

            if (!files || files.length === 0) {
                img = {}
                audio = {}
            }

            for (const file of files) {

                if (file.mimetype == 'image/gif' || file.mimetype == 'image/png' || file.mimetype == 'image/jpeg') {
                    img = {
                        availability: true,
                        wordFileUrl: file.path,
                        wordFileOriginalname: file.originalname,
                        wordFileMimetype: file.mimetype,
                    }
                }
                if (file.mimetype == 'audio/wav' || file.mimetype == 'audio/mpeg') {
                    audio = {
                        availability: true,
                        wordFileUrl: file.path,
                        wordFileOriginalname: file.originalname,
                        wordFileMimetype: file.mimetype,
                    }
                }
            }
            // Форматирование даты
            const newDate = new Date(Date.now());
            const padZero = (num) => (num < 10 ? '0' + num : num);
            const formattedDate = `${padZero(newDate.getDate())}/${padZero(newDate.getMonth() + 1)}/${newDate.getFullYear()}`;
            dictionary.words.push({
                time: newDate,
                dateCreated: formattedDate,
                enum: 'new',
                reminder: false,
                expectation: 'wait',
                waitingTime: 0,
                img,
                audio,
                word: req.body.word,
                translation: req.body.translation,
                termLink: req.body.term__link
             });
        }

        // Сохраняем обновленный словарь
        await dictionary.save();

        req.flash('message', 'Термин добавлен');

        res.redirect(`/words/termList/${id}`);
    } catch (error) {
        console.error(error);
        req.flash('message', 'Что-то пошло не так. Попробуйте ещё раз');
        res.redirect('/dictionaries');
    }
};

// Контроллер для добавления новых слов в словарь из эксель
exports.addWordEx = async (req, res) => {
    try {
        // Находим словарь по ID
        const dictionary = await Dictionary.findById(req.params.id);
        const id = req.params.id;
        if (!dictionary) {
            // Если словарь не найден, возвращаем страницу с сообщением об ошибке
            req.flash('message', 'Раздел не найден');
            return res.redirect('/dictionaries');
        }

        // Находим пользователя по его ID
        const user = await User.findById(req.user._id);
        if (!user) {
            // Если пользователь не найден, выводим сообщение об ошибке и перенаправляем на страницу профиля
            req.flash('message', 'Пользователь не найден');
            return res.redirect('/user/profile');
        }

        // Проверяем, был ли файл загружен на сервер
        if (!req.file) {
            return res.status(400).send('Файл Excel не был загружен');
        }

        // Получаем путь к загруженному файлу из запроса
        const filePath = req.file.path;

        // Открываем файл Excel
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);

        // Получаем первый лист
        const worksheet = workbook.getWorksheet(1);

        // Проходимся по каждой строке (начиная со второй, так как первая обычно содержит заголовки)
        worksheet.eachRow(async (row, rowNumber) => {
            if (rowNumber > 1) {
                dictionary.words.push({ enum: 'new', reminder: false, expectation: 'wait', waitingTime: 0, word: row.getCell(1).value, translation: row.getCell(2).value });

                user.words.wordsСreated += 1
                dictionary.quantityWords += 1
            }
        });

        console.log('Импорт завершен успешно');
        // Удаляем загруженный файл после использования
        // Это необязательно, но полезно для очистки места
        fs.unlinkSync(req.file.path);

        await user.save();
        // Сохраняем обновленный словарь
        await dictionary.save();

        req.flash('message', 'Термин добавлен');
        res.redirect(`/words/termList/${id}`);

    } catch (error) {
        console.error(error);
        req.flash('message', 'Что-то пошло не так. Попробуйте ещё раз');
        res.redirect('/dictionaries');
    }
};


// Контроллер для отображения страницы редактирования слова
exports.editWordPage = async (req, res) => {
    try {
        const wordId = req.params.id;

        const dictionary = await Dictionary.findOne({ 'words._id': wordId });

        if (!dictionary) {
            // Если словарь не найден, возвращаем страницу с сообщением об ошибке
            req.flash('message', 'Раздел не найден');
            return res.redirect('/dictionaries');
        }

        const word = dictionary.words.id(wordId);
        if (!word) {
            req.flash('message', 'Термин не найден');
            return res.redirect('/dictionaries');
        }
        // req.flash('message', 'Слово успешно изменено');
        res.render('editWord', { dictionary, word, messages: req.flash('message') });
    } catch (error) {
        console.error(error);
        req.flash('message', 'Что-то пошло не так. Попробуйте ещё раз');
        res.redirect('/dictionaries');
    }
};

// Контроллер для изменения данных слова в словаре
exports.updateWord = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            // Если пользователь не найден, выводим сообщение об ошибке и перенаправляем на страницу профиля
            req.flash('message', 'Пользователь не найден');
            return res.redirect('/user/profile');
        }
        const wordId = req.params.id;
        const updatedWordData = req.body;

        // Находим словарь, содержащий слово, по идентификатору слова
        const dictionary = await Dictionary.findOne({ 'words._id': wordId });
        if (!dictionary) {
            // Если словарь не найден, возвращаем страницу с сообщением об ошибке
            req.flash('message', 'Раздел не найден');
            return res.redirect('/dictionaries');
        }

        const id = dictionary._id

        // Находим индекс слова в массиве слов
        const wordIndex = dictionary.words.findIndex(word => word._id == wordId);
        if (wordIndex === -1) {
            req.flash('message', 'Термин не найден');
            return res.redirect('/dictionaries');
        }

        const files = req.files;

        let img = {}
        let audio = {}

        if (!files || files.length === 0) {
            img = {}
            audio = {}
        }
        for (const file of files) {

            if (file.mimetype == 'image/gif' || file.mimetype == 'image/png' || file.mimetype == 'image/jpeg') {
                img = {
                    availability: true,
                    wordFileUrl: file.path,
                    wordFileOriginalname: file.originalname,
                    wordFileMimetype: file.mimetype,
                }
                dictionary.words[wordIndex].img = img;
            }
            if (file.mimetype == 'audio/wav' || file.mimetype == 'audio/mpeg') {
                audio = {
                    availability: true,
                    wordFileUrl: file.path,
                    wordFileOriginalname: file.originalname,
                    wordFileMimetype: file.mimetype,
                }
                dictionary.words[wordIndex].audio = audio
            }
        }

        // Обновляем данные слова
        dictionary.words[wordIndex].word = updatedWordData.word;
        dictionary.words[wordIndex].translation = updatedWordData.translation;
        
        
        // Сохраняем обновленный словарь в базе данных
        await dictionary.save();

        req.flash('message', 'Термин изменён');
        // После успешного обновления перенаправляем пользователя обратно на страницу редактирования словаря
        res.redirect(`/words/termList/${id}`);
        // res.redirect(`/termList`);
    } catch (error) {
        console.error(error);
        req.flash('message', 'Что-то пошло не так. Попробуйте ещё раз');
        res.redirect('/dictionaries');
    }
};

// Контроллер для удаления слова из словаря
exports.deleteWord = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            // Если пользователь не найден, выводим сообщение об ошибке и перенаправляем на страницу профиля
            req.flash('message', 'Пользователь не найден');
            return res.redirect('/user/profile');
        }
        const wordId = req.params.id;
        console.log("Интетификатор слова " + wordId);
        
        // Находим словарь, содержащий слово, по идентификатору слова
        const dictionary = await Dictionary.findOne({ 'words._id': wordId });
        // console.log(dictionary);
        
        if (!dictionary) {
            // Если словарь не найден, возвращаем страницу с сообщением об ошибке
            req.flash('message', 'Раздел не найден');
            return res.redirect('/dictionaries');
        }

        const id = dictionary._id
        
        // Находим индекс слова в массиве слов
        const wordIndex = dictionary.words.findIndex(word => word._id == wordId);
        if (wordIndex === -1) {
            req.flash('message', 'Термин не найден');
            return res.redirect('/dictionaries');
        }

        let urlImg = dictionary.words[wordIndex].img.wordFileUrl;
        let urlAudio = dictionary.words[wordIndex].audio.wordFileUrl;
        
        if (urlImg) {
             //удаляем файлы

        fs.unlink(urlImg, (err) => {
            if (err) console.error(err);
            console.log("Файл успешно удален.");
        });
        }

        if (urlAudio) {
            fs.unlink(urlAudio, (err) => {
                if (err) console.error(err);
                console.log("Файл успешно удален.");
            });
        }

       // Найдите слово по его идентификатору и удалите его из словаря
        dictionary.words.splice(wordIndex, 1);
        
        await dictionary.save();

        req.flash('message', 'Термин удален');
        // После успешного обновления перенаправляем пользователя обратно на страницу редактирования словаря
        res.redirect(`/words/termList/${id}`);
        // res.redirect(`/dictionaries`);

    } catch (error) {
        console.error(error);
        req.flash('message', 'Что-то пошло не так. Попробуйте ещё раз');
        res.redirect('/dictionaries');
    }
};


// Контроллер для удаления изображения термина
exports.deleteWordImg = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            // Если пользователь не найден, выводим сообщение об ошибке и перенаправляем на страницу профиля
            req.flash('message', 'Пользователь не найден');
            return res.redirect('/user/profile');
        }

        const wordId = req.params.id;

        const dictionary = await Dictionary.findOne({ 'words._id': wordId });

        if (!dictionary) {
            // Если словарь не найден, возвращаем страницу с сообщением об ошибке
            req.flash('message', 'Раздел не найден');
            return res.redirect('/dictionaries');
        }

        const dictionaryId = dictionary._id

        // Находим индекс слова в массиве слов
        const wordIndex = dictionary.words.findIndex(word => word._id == wordId);
        if (wordIndex === -1) {
            req.flash('message', 'Термин не найден');
            return res.redirect('/dictionaries');
        }

        // находим урл файлов

        let urlImg = dictionary.words[wordIndex].img.wordFileUrl;

        if (urlImg) {
             //удаляем файлы
        fs.unlink(urlImg, (err) => {
            if (err) console.error(err);
            console.log("Файл успешно удален.");
        });
        }

        dictionary.words[wordIndex].img = {}

        const word = dictionary.words[wordIndex]

        // Сохраняем обновленный словарь в базе данных
        await dictionary.save();

        req.flash('message', 'Изображение удалено');
        // После успешного обновления перенаправляем пользователя обратно на страницу редактирования словаря
        res.render('editWord', { dictionary, word, dictionaryId, messages: req.flash('message') });
        // res.redirect(`/dictionaries`);

    } catch (error) {
        console.error(error);
        req.flash('message', 'Что-то пошло не так. Попробуйте ещё раз');
        res.redirect('/dictionaries');
    }
};

// Контроллер для удаления аудио термина
exports.deleteWordAudio = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            // Если пользователь не найден, выводим сообщение об ошибке и перенаправляем на страницу профиля
            req.flash('message', 'Пользователь не найден');
            return res.redirect('/user/profile');
        }

        const wordId = req.params.id;

        const dictionary = await Dictionary.findOne({ 'words._id': wordId });

        if (!dictionary) {
            // Если словарь не найден, возвращаем страницу с сообщением об ошибке
            req.flash('message', 'Раздел не найден');
            return res.redirect('/dictionaries');
        }

        const dictionaryId = dictionary._id

        // Находим индекс слова в массиве слов
        const wordIndex = dictionary.words.findIndex(word => word._id == wordId);
        if (wordIndex === -1) {
            req.flash('message', 'Термин не найден');
            return res.redirect('/dictionaries');
        }

        // находим урл файлов

        let urlImg = dictionary.words[wordIndex].img.wordFileUrl;

        if (urlImg) {
             //удаляем файлы
        fs.unlink(urlImg, (err) => {
            if (err) console.error(err);
            console.log("Файл успешно удален.");
        });
        }

        dictionary.words[wordIndex].audio = {}

        const word = dictionary.words[wordIndex]

        // Сохраняем обновленный словарь в базе данных
        await dictionary.save();

        req.flash('message', 'Аудио удалено');
        // После успешного обновления перенаправляем пользователя обратно на страницу редактирования словаря
        res.render('editWord', { dictionary, word, dictionaryId, messages: req.flash('message') });
        // res.redirect(`/dictionaries`);

    } catch (error) {
        console.error(error);
        req.flash('message', 'Что-то пошло не так. Попробуйте ещё раз');
        res.redirect('/dictionaries');
    }
};




// // Контроллер для отображения страницы с терминами раздела
exports.getDictionaryById = async (req, res) => {
    try {
        const dictionaryId = req.params.id;
        const dictionary = await Dictionary.findById(dictionaryId);
        if (!dictionary) {
            // Если словарь не найден, возвращаем страницу с сообщением об ошибке
            req.flash('message', 'Раздел не найден 5');
            return res.redirect('/dictionaries');
        }
        res.render('termList', { dictionary, dictionaryId: dictionaryId, messages: req.flash('message') });
    } catch (error) {
        console.error(error);
        req.flash('message', 'Что-то пошло не так. Попробуйте ещё раз');
        res.redirect('/dictionaries');
    }
};



// Контроллер для отображения страницы редактирования слова
// exports.getEditWordPage = async (req, res) => {
//     try {
//         const wordId = req.params.id;
//         const dictionaryId = req.query.dictionaryId;
//         const dictionary = await Dictionary.findById(dictionaryId);
//         if (!dictionary) {
//             // Если словарь не найден, возвращаем страницу с сообщением об ошибке
//             req.flash('message', 'Раздел не найден');
//             return res.redirect('/dictionaries');
//         }
//         const word = dictionary.words.id(wordId);
//         if (!word) {
//             req.flash('message', 'Термин не найден');
//             return res.redirect('/dictionaries');
//         }
//         res.render('editWord', { word, dictionaryId });
//     } catch (error) {
//         console.error(error);
//         req.flash('message', 'Что-то пошло не так. Попробуйте ещё раз');
//         res.redirect('/dictionaries');
//     }
// };

// Контроллер для проигрывания аудиофайла
// exports.playAudio = async (req, res) => {
//     try {
//         const wordId = req.params.id;
//         const updatedWordData = req.body;

//         // Находим словарь, содержащий слово, по идентификатору слова
//         const dictionary = await Dictionary.findOne({ 'words._id': wordId });
//         if (!dictionary) {
//             // Если словарь не найден, возвращаем страницу с сообщением об ошибке
//             req.flash('message', 'Раздел не найден');
//             return res.redirect('/dictionaries');
//         }

//         // Находим индекс слова в массиве слов
//         const wordIndex = dictionary.words.findIndex(word => word._id == wordId);
//         if (wordIndex === -1) {
//             req.flash('message', 'Термин не найден');
//             return res.redirect('/dictionaries');
//         }

//         // Путь к вашему аудиофайлу
//         // console.log(dictionary.words[wordIndex].wordFileOriginalname); 
//         const audioFile = dictionary.words[wordIndex].wordFileUrl; 
//         // const audioFile = '/uploads/word.wordFileOriginalname';
//         console.log(audioFile);
//         // Воспроизведение аудиофайла
//         player.play(audioFile, (err) => {
//             if (err) {
//                 console.error('Произошла ошибка при воспроизведении:', err);
//             }
//             console.log('Аудиофайл успешно воспроизведен');
//         });




        
//         // res.redirect(`/termList`);
//     } catch (error) {
//         console.error(error);
//         req.flash('message', 'Что-то пошло не так. Попробуйте ещё раз');
//         res.redirect('/dictionaries');
//     }
// };

