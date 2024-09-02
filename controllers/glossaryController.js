const Dictionary = require('../models/Dictionary');
const User = require('../models/User');

// Контроллер для отображения страницы создания нового раздела
exports.createGlossaryPage = async (req, res) => {
    try {
        // Находим пользователя по его ID
        const user = await User.findById(req.user._id);
        if (!user) {
            // Если пользователь не найден, выводим сообщение об ошибке и перенаправляем на страницу профиля
            req.flash('message', 'Пользователь не найден');
            return res.redirect('/user/profile');
        }
        const edit = false

        // Рендерим шаблон страницы создания нового раздела 
        res.render('createGlossary', { messages: req.flash('message'), edit })
    } catch (error) {
        console.error(error);
        req.flash('message', 'Что-то пошло не так. Попробуйте ещё раз.');
        res.redirect('/dictionaries');
    }
};

// Контроллер для создания нового раздела
exports.createGlossary = async (req, res) => {
    try {
        // Находим пользователя по его ID
        const user = await User.findById(req.user._id);
        if (!user) {
            // Если пользователь не найден, выводим сообщение об ошибке и перенаправляем на страницу профиля
            req.flash('message', 'Пользователь не найден');
            return res.redirect('/user/profile');
        }

        // Создаем новый словарь и присваиваем ему идентификатор пользователя
        const newDictionary = new Dictionary({
            name: req.body.dictionaryName,
            user: req.user._id,
        });

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

// Контроллер для отображения страницы редактирования названия раздела
exports.editGlossaryPage = async (req, res) => {
    try {
         // Находим пользователя по его ID
         const user = await User.findById(req.user._id);
         if (!user) {
             // Если пользователь не найден, выводим сообщение об ошибке и перенаправляем на страницу профиля
             req.flash('message', 'Пользователь не найден');
             return res.redirect('/user/profile');
         }

        // Получаем идентификатор словаря из запроса
        const dictionaryId = req.params.id;

        // Находим словарь по ID
        const dictionary = await Dictionary.findById(dictionaryId);
        if (!dictionary) {
            // Если словарь не найден, возвращаем страницу с сообщением об ошибке
            req.flash('message', 'Раздел не найден 1');
            return res.redirect('/dictionaries');
        }

        const edit = true
        // Рендерим шаблон страницы со словарями и передаем найденные словари
        res.render('createGlossary', { messages: req.flash('message'), dictionary, edit });
    } catch (error) {
        console.error(error);
        req.flash('message', 'Что-то пошло не так. Попробуйте еще раз');
        return res.redirect('/user/profile');
    }
};


// Контроллер для сохранения нового названия раздела
exports.editGlossary = async (req, res) => {
    try {
        // Находим пользователя по его ID
        const user = await User.findById(req.user._id);
        if (!user) {
            // Если пользователь не найден, выводим сообщение об ошибке и перенаправляем на страницу профиля
            req.flash('message', 'Пользователь не найден');
            return res.redirect('/user/profile');
        }

         // Получаем идентификатор словаря из запроса
         const dictionaryId = req.params.id;

         await Dictionary.findByIdAndUpdate(dictionaryId, {name: req.body.dictionaryName} );

        req.flash('message', 'Раздел успешно сохранён');
        // Перенаправляем пользователя на страницу со словарями
        res.redirect('/dictionaries');
    } catch (error) {
        console.error(error);
        req.flash('message', 'Что-то пошло не так. Попробуйте ещё раз.');
        res.redirect('/dictionaries');
    }
};

// Контроллер для удаления словаря
exports.deleteGlossary = async (req, res) => {
    try {
        const dictionaryId = req.params.id;
        // Находим пользователя по его ID
        const user = await User.findById(req.user._id);
        if (!user) {
            // Если пользователь не найден, выводим сообщение об ошибке и перенаправляем на страницу профиля
            req.flash('message', 'Пользователь не найден');
            return res.redirect('/user/profile');
        }

        // Удаляем словарь из базы данных по его идентификатору
        await Dictionary.findByIdAndDelete(dictionaryId);

        req.flash('message', 'Раздел успешно удалён');
        // Перенаправляем пользователя на страницу со списком словарей
        res.redirect('/dictionaries');
    } catch (error) {
        // Обработка ошибки в случае возникновения проблем
        console.error(error);
        req.flash('message', 'Что-то пошло не так. Попробуйте ещё раз.');
        return res.redirect('/user/profile');

    }
};


// Контроллер для отображения страницы со словарями пользователя
exports.GlossarysPage = async (req, res) => {
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

        // Рендерим шаблон страницы со словарями и передаем найденные словари
        res.render('dictionaries', { messages: req.flash('message'), dictionaries});
    } catch (error) {
        console.error(error);
        req.flash('message', 'Что-то пошло не так. Попробуйте еще раз');
        return res.redirect('/user/profile');
    }
};














