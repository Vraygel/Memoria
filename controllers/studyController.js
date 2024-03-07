const Dictionary = require('../models/Dictionary');
const bot = require('../utils/telegramBot'); // Импорт экземпляра бота

require('dotenv').config();

// Контроллер для отображения страницы изучения словаря
exports.showStudyPage = async (req, res) => {
    try {
        const dictionaryId = req.params.id;
        const dictionary = await Dictionary.findById(dictionaryId);
        if (!dictionary) {
            return res.status(404).send('Словарь не найден');
        }
        res.render('study', { dictionary, dictionaryId }); // Отправляем данные о словаре в шаблон ejs для отображения
    } catch (error) {
        console.error(error);
        res.status(500).send('Произошла ошибка при загрузке данных о словаре');
    }
};

// Контроллер для обновления страницы изучения словаря
exports.updateStudyPage = async (req, res) => {
    try {
        const dictionary = await Dictionary.findById(req.params.id);
        if (!dictionary) {
            return res.status(404).send('Словарь не найден');
        }
        res.redirect(`/study/${req.params.id}`);
    } catch (error) {
        console.error(error);
        req.flash('error', 'Произошла ошибка при обновлении словаря');
        res.redirect('/dictionaries');
    }
};

// Контроллер для повторения слова
exports.repeatWord = async (req, res) => {
    try {
        const wordId = req.params.id;
        const userChatId = req.user.contactinfo.chatId;
        const complexity = req.body.complexity;

        // Находим слово по его ID и связанную информацию из словаря
        const dictionary = await Dictionary.findOne({ 'words._id': wordId });
        if (!dictionary) {
            return res.status(404).send('Словарь не найден');
        }

        // Находим индекс слова в массиве слов
        const wordIndex = dictionary.words.findIndex(word => word._id == wordId);
        if (wordIndex === -1) {
            return res.status(404).send('Слово не найдено');
        }
				
	      // Обновляем сложность слова в зависимости от выбора пользователя
        let setTime;
        switch (dictionary.words[wordIndex].enum) {
					// В случае, если значение равно 'new'
					case 'new':
						// Действие, которое нужно выполнить
						dictionary.words[wordIndex].enum = 'first';
						setTime = 60000
						break; // Обязательный оператор break, чтобы завершить блок switch
					case 'first':
						// Действие, которое нужно выполнить
						dictionary.words[wordIndex].enum = 'third';
						setTime = 1200000
						break; // Обязательный оператор break, чтобы завершить блок switch
					case 'third':
						// Действие, которое нужно выполнить
						dictionary.words[wordIndex].enum = 'fourth';
						setTime = 21600000
						break; // Обязательный оператор break, чтобы завершить блок switch			
					case 'fourth':
						// Действие, которое нужно выполнить
						dictionary.words[wordIndex].enum = 'fifth';
						setTime = 1512000000
						break; // Обязательный оператор break, чтобы завершить блок switch
					case 'fifth':
						// Действие, которое нужно выполнить
						dictionary.words[wordIndex].enum = 'sixth';
						setTime = 6574365000
						break; // Обязательный оператор break, чтобы завершить блок switch
					case 'sixth':
						// Действие, которое нужно выполнить
						dictionary.words[wordIndex].enum = 'seventh';
						setTime = 15768000000
						break; // Обязательный оператор break, чтобы завершить блок switch
					case 'seventh':
						// Действие, которое нужно выполнить
						dictionary.words[wordIndex].enum = 'eighth';
						setTime = 31536000000
						break; // Обязательный оператор break, чтобы завершить блок switch
					case 'eighth':
						// Действие, которое нужно выполнить
						dictionary.words[wordIndex].enum = 'eighth';
						setTime = 31536000000
						break; // Обязательный оператор break, чтобы завершить блок switch
		
					default:
						// Действие по умолчанию
						console.log('Это не новое слово');
						break; // Необязательный оператор break, но его желательно использовать
				}

        switch (complexity) {
            case 'easy':
                setTime = setTime + (setTime * 0.1);
                break;
            case 'hard':
                setTime = setTime - (setTime * 0.1);
                break;
        }

        // Обновляем данные о времени ожидания и сложности слова
        const newDate = new Date(Date.now() + setTime);
        dictionary.words[wordIndex].expectation = 'wait';
        dictionary.words[wordIndex].waitingTime = newDate;

        // Сохраняем обновленный словарь в базе данных
        await dictionary.save();

				setTimeout(async () => {
					try {
						// Отправка сообщения пользователю после срабатывания таймера
						console.log('Пора повторить это слово!');
						// Обновление полей слова в словаре
						const updatedDictionary = await Dictionary.findByIdAndUpdate(
							dictionary._id,
							{
								$set: {
									'words.$[word].expectation': 'waited',
									'words.$[word].waitingTime': '0'
								}
							},
							{
								arrayFilters: [{ 'word._id': dictionary.words[wordIndex]._id }],
								new: true
							}
						);
		
						// Здесь может быть ваш код для отправки сообщения пользователю
						// Функция для отправки сообщения пользователю с ссылкой
						// let chatId = req.user.contactinfo.chatId
						function sendMessageToUser(chatId, dictionaryId) {
							const message = `Пора повторить слова из словаря! Начните учиться здесь: http://localhost:3000/study/${dictionaryId}`;
							bot.sendMessage(chatId, message);
						}
						// Отправляем сообщение пользователю
						sendMessageToUser(userChatId, dictionary._id);
					} catch (error) {
						console.error('Error updating word:', error);
					}
				}, setTime); // Перевод времени в миллисекунды

        
       

        // Перенаправляем пользователя на страницу изучения слова
        res.redirect(`/study/${dictionary._id}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Произошла ошибка при повторении слова');
    }
};
