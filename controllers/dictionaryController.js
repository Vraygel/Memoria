const Dictionary = require('../models/Dictionary');

// Контроллер для страницы со словарями пользователя
exports.dictionariesPage = async (req, res) => {
    try {
        // Получаем ID текущего пользователя
        const userId = req.user._id;
        // Находим все словари, принадлежащие текущему пользователю
        const dictionaries = await Dictionary.find({ user: userId });
        // Рендерим шаблон страницы со словарями и передаем найденные словари
        res.render('dictionaries', { dictionaries });
    } catch (error) {
        console.error(error);
        // В случае ошибки отправляем статус 500 и сообщение об ошибке
        res.status(500).send('Internal Server Error');
    }
};

// Контроллер для создания нового словаря
exports.createDictionary = async (req, res) => {
    try {
        // Получаем идентификатор текущего пользователя
        const userId = req.user._id;

        // Создаем новый словарь и присваиваем ему идентификатор пользователя
        const newDictionary = new Dictionary({
            name: req.body.dictionaryName,
            user: userId
        });

        // Сохраняем словарь
        await newDictionary.save();

        // Перенаправляем пользователя на страницу со словарями
        res.redirect('/dictionaries');
    } catch (error) {
        console.error(error);
        // В случае ошибки отправляем статус 500 и сообщение об ошибке
        res.status(500).send('Internal Server Error');
    }
};

// Контроллер для удаления словаря
exports.deleteDictionary = async (req, res) => {
	try {
			// Получаем идентификатор словаря из запроса
			const dictionaryId = req.query.id;

			// Удаляем словарь из базы данных по его идентификатору
			await Dictionary.findByIdAndDelete(dictionaryId);

			// Перенаправляем пользователя на страницу со списком словарей
			res.redirect('/dictionaries');
	} catch (error) {
			// Обработка ошибки в случае возникновения проблем
			console.error(error);
			res.status(500).send('Internal Server Error');
	}
};

// Контроллер для редактирования словаря
exports.editDictionary = async (req, res) => {
    try {
        // Находим словарь по ID
        const dictionary = await Dictionary.findById(req.params.id);
        if (!dictionary) {
            // Если словарь не найден, возвращаем страницу с сообщением об ошибке
            req.flash('error', 'Словарь не найден');
            return res.redirect('/dictionaries');
        }
        // Отображаем страницу редактирования словаря с данными о словаре
        res.render('editDictionary', { dictionary });
    } catch (error) {
        console.error(error);
        req.flash('error', 'Произошла ошибка при загрузке словаря для редактирования');
        res.redirect('/dictionaries');
    }
};

// Контроллер для обновления словаря
exports.updateDictionaryItem = async (req, res) => {
    try {
        const dictionaryId = req.params.id;
        const { word, translation } = req.body; // Предполагается, что вы отправляете данные о слове и его переводе из формы
        const dictionary = await Dictionary.findByIdAndUpdate(dictionaryId, { $push: { words: { word, translation } } }, { new: true });
        if (!dictionary) {
            return res.status(404).send('Словарь не найден');
        }
				console.log(dictionary);
        res.redirect(`/dictionaries/dictionariesList/${dictionaryId}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Произошла ошибка при обновлении словаря');
    }
};

// Контроллер для обновления словаря
exports.updateDictionary = async (req, res) => {
	try {
			// Находим словарь по ID
			const dictionary = await Dictionary.findById(req.params.id);
			const id = req.params.id;
			if (!dictionary) {
					// Если словарь не найден, возвращаем страницу с сообщением об ошибке
					req.flash('error', 'Словарь не найден');
					return res.redirect('/dictionaries');
			}

			// Обновляем данные словаря
			dictionary.words.push({ enum: 'new', expectation: 'wait', waitingTime: 0, word: req.body.word, translation: req.body.translation });
			console.log(dictionary);

			// Сохраняем обновленный словарь
			await dictionary.save();
			
			req.flash('success', 'Словарь успешно обновлен');
			res.redirect(`/dictionaries/dictionariesList/${id}`);
	} catch (error) {
			console.error(error);
			req.flash('error', 'Произошла ошибка при обновлении словаря');
			res.redirect('/dictionaries');
	}
};

// Контроллер для получения данных о словаре по его ID
exports.getDictionaryById = async (req, res) => {
	try {
			const dictionaryId = req.params.id;
			const dictionary = await Dictionary.findById(dictionaryId);
			if (!dictionary) {
					return res.status(404).send('Словарь не найден');
			}
			res.render('dictionariesList', { dictionary, dictionaryId: dictionaryId });
	} catch (error) {
			console.error(error);
			res.status(500).send('Произошла ошибка при загрузке данных о словаре');
	}
};