const Dictionary = require('../models/Dictionary');
const User = require('../models/User');


// Контроллер для отображения страницы добавления нового слова в словарь
exports.addWordPage = async (req, res) => {
    try {

        // Находим пользователя по его ID
        const user = await User.findById(req.user._id);
        if (!user) {
            // Если пользователь не найден, выводим сообщение об ошибке и перенаправляем на страницу профиля
            req.flash('message', 'Пользователь не найден');
            return res.redirect('/user/profile');
        }

        // if (user.words.wordsMax == 0) {
        //     req.flash('message', 'Вы не можете создать новый термин. Приобретите больше терминов');
        //     console.log('Вы не можете создать новое слово. Приобретите больше слов')
        //     return res.redirect('/dictionaries');
        // }

        // Находим словарь по ID
        const dictionary = await Dictionary.findById(req.params.id);
        if (!dictionary) {
            // Если словарь не найден, возвращаем страницу с сообщением об ошибке
            req.flash('message', 'Раздел не найден');
            return res.redirect('/dictionaries');
        }

        // Отображаем страницу редактирования словаря с данными о словаре
        res.render('addWordPage', { dictionary, messages: req.flash('message') });
    } catch (error) {
        console.error(error);
        req.flash('message', 'Что-то пошло не так. Попробуйте ещё раз');
        res.redirect('/dictionaries');
    }
};

// Контроллер для добавления нового слова в словарь
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
                dictionary.words.push({ enum: 'new', reminder: false, expectation: 'wait', waitingTime: 0, word: word, translation: req.body.translation[index] });
                
            });
        } else{
            dictionary.words.push({ enum: 'new', reminder: false, expectation: 'wait', waitingTime: 0, word: req.body.word, translation: req.body.translation });
        }

        user.words.wordsСreated += 1
        dictionary.quantityWords += 1

        await user.save();
        // Сохраняем обновленный словарь
        await dictionary.save();

        req.flash('message', 'Термин добавлен');
        res.redirect(`/dictionaries/dictionariesList/${id}`);
        // res.redirect(`/study/study/${id}`);
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
        const dictionaryId = req.query.dictionaryId;
        const dictionary = await Dictionary.findById(dictionaryId);
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
        res.render('editWord', { word, dictionaryId, messages: req.flash('message') });
    } catch (error) {
        console.error(error);
        req.flash('message', 'Что-то пошло не так. Попробуйте ещё раз');
        res.redirect('/dictionaries');
    }
};

// Контроллер для изменения данных слова в словаре
exports.updateWord = async (req, res) => {
    try {
        const wordId = req.params.id;
        const updatedWordData = req.body;

        // Находим словарь, содержащий слово, по идентификатору слова
        const dictionary = await Dictionary.findOne({ 'words._id': wordId });
        if (!dictionary) {
            // Если словарь не найден, возвращаем страницу с сообщением об ошибке
            req.flash('message', 'Раздел не найден');
            return res.redirect('/dictionaries');
        }

        // Находим индекс слова в массиве слов
        const wordIndex = dictionary.words.findIndex(word => word._id == wordId);
        if (wordIndex === -1) {
            req.flash('message', 'Термин не найден');
            return res.redirect('/dictionaries');
        }

        // Обновляем данные слова
        dictionary.words[wordIndex].word = updatedWordData.word;
        dictionary.words[wordIndex].translation = updatedWordData.translation;

        // Сохраняем обновленный словарь в базе данных
        await dictionary.save();

        req.flash('message', 'Термин изменён');
        // После успешного обновления перенаправляем пользователя обратно на страницу редактирования словаря
        res.redirect(`/dictionariesList`);
    } catch (error) {
        console.error(error);
        req.flash('message', 'Что-то пошло не так. Попробуйте ещё раз');
        res.redirect('/dictionaries');
    }
};

// Контроллер для удаления слова из словаря
exports.deleteWord = async (req, res) => {
    try {
        const wordId = req.params.id;
        // Найдите слово по его идентификатору и удалите его из словаря
        const dictionary = await Dictionary.findOneAndUpdate(
            { 'words._id': wordId },
            { $pull: { words: { _id: wordId } } },
            { new: true }
        );
        
        // Проверка, было ли удаление успешным
        if (!dictionary) {
            // Если словарь не найден, возвращаем страницу с сообщением об ошибке
            req.flash('message', 'Раздел не найден');
            return res.redirect('/dictionaries');
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            // Если пользователь не найден, выводим сообщение об ошибке и перенаправляем на страницу профиля
            req.flash('message', 'Пользователь не найден');
            return res.redirect('/user/profile');
        }
        dictionary.quantityWords -= 1
        user.words.wordsСreated -= 1

        await user.save();

        const id = dictionary.id
        req.flash('message', 'Термин удален');
        // После успешного обновления перенаправляем пользователя обратно на страницу редактирования словаря
        res.redirect(`/dictionaries/dictionariesList/${id}`);
        // res.redirect(`/dictionaries`);

    } catch (error) {
        console.error(error);
        req.flash('message', 'Что-то пошло не так. Попробуйте ещё раз');
        res.redirect('/dictionaries');
    }
};

// Контроллер для отображения страницы редактирования слова
exports.getEditWordPage = async (req, res) => {
    try {
        const wordId = req.params.id;
        const dictionaryId = req.query.dictionaryId;
        const dictionary = await Dictionary.findById(dictionaryId);
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
        res.render('editWord', { word, dictionaryId });
    } catch (error) {
        console.error(error);
        req.flash('message', 'Что-то пошло не так. Попробуйте ещё раз');
        res.redirect('/dictionaries');
    }
};
