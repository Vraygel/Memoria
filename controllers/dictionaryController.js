const Dictionary = require('../models/Dictionary');
const User = require('../models/User');

// Контроллер для отображения страницы со словарями пользователя
exports.dictionariesPage = async (req, res) => {
    try {
        // Находим все словари, принадлежащие текущему пользователю
        const dictionaries = await Dictionary.find({ user: req.user._id });
        // Рендерим шаблон страницы со словарями и передаем найденные словари
        res.render('dictionaries', { messages: req.flash('message'), dictionaries });
    } catch (error) {
        console.error(error);
        req.flash('message', 'Что-то пошло не так. Попробуйте еще раз');
        return res.redirect('/profile');
    }
};

// Контроллер для создания нового словаря
exports.createDictionary = async (req, res) => {
    try {
        // Находим пользователя по его ID
        const user = await User.findById(req.user._id);
        if (!user) {
            // Если пользователь не найден, выводим сообщение об ошибке и перенаправляем на страницу профиля
            req.flash('message', 'Пользователь не найден');
            return res.redirect('/user/profile');
        }

        // Находим все словари, принадлежащие текущему пользователю
        const dictionaries = await Dictionary.find({ user: req.user._id });

        if (req.user.dictionaries.dictionariesMax == 0) {
            req.flash('message', 'Вы не можете создать новый раздел. Приобретите больше разделов');
            console.log('Вы не можете создать новый раздел. Приобретите больше словарей')
            return res.redirect('/dictionaries');
        }

        user.dictionaries.dictionariesMax -= 1
        user.dictionaries.dictionariesСreated += 1

        // Создаем новый словарь и присваиваем ему идентификатор пользователя
        const newDictionary = new Dictionary({
            name: req.body.dictionaryName,
            user: req.user._id,
            quantityWords: 0
        });

        await user.save();
        // Сохраняем словарь
        await newDictionary.save();

        req.flash('message', 'Раздел успешно создан');
        // Перенаправляем пользователя на страницу со словарями
        res.redirect('/dictionaries');
    } catch (error) {
        console.error(error);
        req.flash('message', 'Что-то пошло не так. Попробуйте ещё раз.');
        res.redirect('/dictionaries');
    }
};

// Контроллер для удаления словаря
exports.deleteDictionary = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            // Если пользователь не найден, выводим сообщение об ошибке и перенаправляем на страницу профиля
            req.flash('message', 'Пользователь не найден');
            return res.redirect('/dictionaries');
        }

        // Получаем идентификатор словаря из запроса
        const dictionaryId = req.params.id;

        // Находим словарь по ID
        const dictionary = await Dictionary.findById(dictionaryId);
        if (!dictionary) {
            // Если словарь не найден, возвращаем страницу с сообщением об ошибке
            req.flash('message', 'Раздел не найден');
            return res.redirect('/dictionaries');
        }

        const quantityWords = dictionary.quantityWords
        user.words.wordsСreated -= +quantityWords
        user.dictionaries.dictionariesСreated -= 1
    
        // Удаляем словарь из базы данных по его идентификатору
        await Dictionary.findByIdAndDelete(dictionaryId);
        await user.save();
        req.flash('message', 'Раздел успешно удалён');
        // Перенаправляем пользователя на страницу со списком словарей
        res.redirect('/dictionaries');
    } catch (error) {
        // Обработка ошибки в случае возникновения проблем
        console.error(error);
        req.flash('message', 'Что-то пошло не так. Попробуйте ещё раз.');
        return res.redirect('/profile');

    }
};














// // Контроллер для обновления словаря
// exports.updateDictionaryItem = async (req, res) => {
//     try {
//         const dictionaryId = req.params.id;
//         const { word, translation } = req.body; // Предполагается, что вы отправляете данные о слове и его переводе из формы
//         const dictionary = await Dictionary.findByIdAndUpdate(dictionaryId, { $push: { words: { word, translation } } }, { new: true });
//         if (!dictionary) {
//             return res.status(404).send('Словарь не найден');
//         }

//         console.log(dictionary);
//         res.redirect(`/dictionaries/dictionariesList/${dictionaryId}`);
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Произошла ошибка при обновлении словаря');
//     }
// };



// Контроллер для получения данных о словаре по его ID
exports.getDictionaryById = async (req, res) => {
    try {
        const dictionaryId = req.params.id;
        const dictionary = await Dictionary.findById(dictionaryId);
        if (!dictionary) {
            // Если словарь не найден, возвращаем страницу с сообщением об ошибке
            req.flash('message', 'Раздел не найден');
            return res.redirect('/dictionaries');
        }
        res.render('dictionariesList', { dictionary, dictionaryId: dictionaryId, messages: req.flash('message') });
    } catch (error) {
        console.error(error);
        req.flash('message', 'Что-то пошло не так. Попробуйте ещё раз');
        res.redirect('/dictionaries');
    }
};