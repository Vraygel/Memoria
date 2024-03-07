const Dictionary = require('../models/Dictionary');

// Контроллер для отображения страницы редактирования слова
exports.getEditWordPage = async (req, res) => {
    try {
        const wordId = req.params.id;
        const dictionaryId = req.query.dictionaryId;
        const dictionary = await Dictionary.findById(dictionaryId);
        if (!dictionary) {
            return res.status(404).send('Словарь не найден');
        }
        const word = dictionary.words.id(wordId);
        if (!word) {
            return res.status(404).send('Слово не найдено');
        }
        res.render('editWord', { word, dictionaryId });
    } catch (error) {
        console.error(error);
        res.status(500).send('Произошла ошибка при загрузке данных о слове');
    }
};

// Контроллер для обновления данных слова
exports.updateWord = async (req, res) => {
    try {
        const wordId = req.params.id;
        const updatedWordData = req.body;

        // Находим словарь, содержащий слово, по идентификатору слова
        const dictionary = await Dictionary.findOne({ 'words._id': wordId });
        if (!dictionary) {
            return res.status(404).send('Словарь не найден');
        }

        // Находим индекс слова в массиве слов
        const wordIndex = dictionary.words.findIndex(word => word._id == wordId);
        if (wordIndex === -1) {
            return res.status(404).send('Слово не найдено');
        }

        // Обновляем данные слова
        dictionary.words[wordIndex].word = updatedWordData.word;
        dictionary.words[wordIndex].translation = updatedWordData.translation;

        // Сохраняем обновленный словарь в базе данных
        await dictionary.save();

        // После успешного обновления перенаправляем пользователя обратно на страницу редактирования словаря
        res.redirect(`/dictionaries/dictionariesList/${dictionary._id}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Произошла ошибка при обновлении слова');
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
					return res.status(404).send('Слово не найдено');
			}
			// После успешного обновления перенаправляем пользователя обратно на страницу редактирования словаря
			res.redirect(`/dictionaries/dictionariesList/${dictionary._id}`);
		
	} catch (error) {
			console.error(error);
			res.status(500).send('Произошла ошибка при удалении слова');
	}
};