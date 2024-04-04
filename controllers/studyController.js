const Dictionary = require('../models/Dictionary');
const bot = require('../utils/telegramBot'); // Импорт экземпляра бота
const User = require('../models/User');

require('dotenv').config();

// Контроллер для отображения страницы изучения словаря
exports.showStudyPage = async (req, res) => {
	try {
		
		const dictionaryId = req.params.id;
		const dictionary = await Dictionary.findById(dictionaryId);
		console.log(dictionary)
		if (!dictionary) {
			// Если словарь не найден, возвращаем страницу с сообщением об ошибке
			req.flash('message', 'Словарь не найден');
			return res.redirect('/dictionaries');
	}

	let result = dictionary.words.filter((word) => {
		if (word.enum == 'new') {
			return {
				word: word.word,
				translation: word.translation
			}
		}
		// возвращается новое значение вместо элемента
	});

	console.log(result)
	console.log(result.length)
	if (result.length != 0) {
		res.render('study', { dictionary, dictionaryId, messages: req.flash('message') }); // Отправляем данные о словаре в шаблон ejs для отображения
	} else {
		req.flash('message', 'Нет терминов для запоминания.');
    res.redirect('/dictionaries');
	}

	} catch (error) {
		console.error(error);
		req.flash('message', 'Что-то пошло не так. Попробуйте ещё раз.');
    res.redirect('/dictionaries');
	}
};

// Контроллер для заучивания слова
exports.repeatWord = async (req, res) => {
	try {
		const wordId = req.params.id;

		// Находим слово по его ID и связанную информацию из словаря
		const dictionary = await Dictionary.findOne({ 'words._id': wordId });
		if (!dictionary) {
			// Если словарь не найден, возвращаем страницу с сообщением об ошибке
			 req.flash('message', 'Раздел не найден');
			 return res.redirect('/dictionaries');
	 }

		// Находим индекс слова в массиве слов
		const wordIndex = dictionary.words.findIndex(word => word._id == wordId);
		if (wordIndex === -1) {
			// Если словарь не найден, возвращаем страницу с сообщением об ошибке
			 req.flash('message', 'Термин не найден');
			 return res.redirect('/dictionaries');
	 }
		let setTime;

		// Обновляем сложность слова в зависимости от выбора пользователя
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
				setTime = 25200000
				break; // Обязательный оператор break, чтобы завершить блок switch			
			case 'fourth':
				// Действие, которое нужно выполнить
				dictionary.words[wordIndex].enum = 'fifth';
				setTime = 86400000
				break; // Обязательный оператор break, чтобы завершить блок switch
			case 'fifth':
				// Действие, которое нужно выполнить
				dictionary.words[wordIndex].enum = 'sixth';
				setTime = 1512000000
				break; // Обязательный оператор break, чтобы завершить блок switch
			case 'sixth':
				// Действие, которое нужно выполнить
				dictionary.words[wordIndex].enum = 'seventh';
				setTime = 6574365000
				break; // Обязательный оператор break, чтобы завершить блок switch
			case 'seventh':
				// Действие, которое нужно выполнить
				dictionary.words[wordIndex].enum = 'eighth';
				setTime = 15768000000
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

		// Обновляем данные о времени ожидания и сложности слова
		const newDate = new Date(Date.now() + setTime);
		dictionary.words[wordIndex].expectation = 'wait';
		dictionary.words[wordIndex].waitingTime = newDate;
		dictionary.words[wordIndex].reminder = false;
		// Сохраняем обновленный словарь в базе данных
		await dictionary.save();

		// Перенаправляем пользователя на страницу изучения слова
		res.redirect(`/study/words/${dictionary._id}`);
	} catch (error) {
		console.error(error);
		req.flash('message', 'Что-то пошло не так. Попробуйте ещё раз');
		res.redirect('/dictionaries');
	}
};

// Контроллер для отображения страницы повторения слова
exports.repetitionWordPage = async (req, res) => {
	try {

		// Находим пользователя по его ID
		const user = await User.findById(req.user._id);
		if (!user) {
				// Если пользователь не найден, выводим сообщение об ошибке и перенаправляем на страницу профиля
				req.flash('message', 'Пользователь не найден');
				return res.redirect('/user/profile');
		}

		const userId = user._id
		console.log(userId);


		// , user: user:_id 
		const dictionary = await Dictionary.findOne({ 'words.expectation': 'waited', user: userId});
		console.log(dictionary);
		if (!dictionary) {
			req.flash('message', 'Нет терминов для повторения');
			return res.redirect('/dictionaries')
		}

		let word
		for (const wordItem of dictionary.words) {

			let {expectation} = wordItem

			if (expectation == 'waited'){
	
				word = wordItem

				break
			} else {
				continue
			}
		}

		// Генерируем случайное число между 0 и 1
		const randomNumber = Math.random();
		// Если случайное число меньше 0.5, возвращаем 1, иначе возвращаем 2
		let random = randomNumber < 0.5 ? 1 : 2;

		let wordParameter
		if (random == 1) {
			wordParameter = word.word
		} else {
			wordParameter = word.translation
		}

		res.render('repetitionWord', { word, wordParameter, messages: req.flash('message'), }); // Отправляем данные о словаре в шаблон ejs для отображения

	} catch (error) {
		console.error(error);
		req.flash('message', 'Что-то пошло не так. Попробуйте еще раз');
    return res.redirect('/dictionaries');
	}
};

// Контроллер для повторения слова
exports.repetitionWord = async (req, res) => {
	try {
		const wordId = req.params.id;
		const complexity = req.body.complexity;
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

		let setTime;
		// Обновляем сложность слова в зависимости от выбора пользователя
		
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
				setTime = 25200000
				break; // Обязательный оператор break, чтобы завершить блок switch			
			case 'fourth':
				// Действие, которое нужно выполнить
				dictionary.words[wordIndex].enum = 'fifth';
				setTime = 86400000
				break; // Обязательный оператор break, чтобы завершить блок switch
			case 'fifth':
				// Действие, которое нужно выполнить
				dictionary.words[wordIndex].enum = 'sixth';
				setTime = 1512000000
				break; // Обязательный оператор break, чтобы завершить блок switch
			case 'sixth':
				// Действие, которое нужно выполнить
				dictionary.words[wordIndex].enum = 'seventh';
				setTime = 6574365000
				break; // Обязательный оператор break, чтобы завершить блок switch
			case 'seventh':
				// Действие, которое нужно выполнить
				dictionary.words[wordIndex].enum = 'eighth';
				setTime = 15768000000
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

		// Обновляем данные о времени ожидания и сложности слова
		const newDate = new Date(Date.now() + setTime);
		dictionary.words[wordIndex].expectation = 'wait';
		dictionary.words[wordIndex].waitingTime = newDate;
		dictionary.words[wordIndex].reminder = false;

		// Сохраняем обновленный словарь в базе данных
		await dictionary.save();

		res.redirect(`/study/repetition`);
	} catch (error) {
		console.error(error);
		req.flash('message', 'Что-то пошло не так. Попробуйте еще раз');
    return res.redirect('/dictionaries');
	}
};


exports.studyWordGet = async (req, res) => {
	try {
		const wordId = req.params.id;
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

		const word = dictionary.words[wordIndex]

		res.render('studyWord', { word, dictionary, messages: req.flash('message'), }); // Отправляем данные о словаре в шаблон ejs для отображения
	} catch (error) {
		console.error(error);
		req.flash('message', 'Что-то пошло не так. Попробуйте еще раз');
    return res.redirect('/dictionaries');
	}
};


exports.studyWordPost = async (req, res) => {
	try {
		const wordId = req.params.id;
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

		const word = dictionary.words[wordIndex]

		switch (word.enum) {
			// В случае, если значение равно 'new'
			case 'first':
				// Действие, которое нужно выполнить
				dictionary.words[wordIndex].enum = 'new';
				break; // Обязательный оператор break, чтобы завершить блок switch
			case 'third':
				// Действие, которое нужно выполнить
				dictionary.words[wordIndex].enum = 'new';
				break; // Обязательный оператор break, чтобы завершить блок switch			
			case 'fourth':
				// Действие, которое нужно выполнить
				dictionary.words[wordIndex].enum = 'first';

				break; // Обязательный оператор break, чтобы завершить блок switch
			case 'fifth':
				// Действие, которое нужно выполнить
				dictionary.words[wordIndex].enum = 'third';

				break; // Обязательный оператор break, чтобы завершить блок switch
			case 'sixth':
				// Действие, которое нужно выполнить
				dictionary.words[wordIndex].enum = 'fourth';

				break; // Обязательный оператор break, чтобы завершить блок switch
			case 'seventh':
				// Действие, которое нужно выполнить
				dictionary.words[wordIndex].enum = 'fifth';

				break; // Обязательный оператор break, чтобы завершить блок switch
			case 'eighth':
				// Действие, которое нужно выполнить
				dictionary.words[wordIndex].enum = 'sixth';

				break; // Обязательный оператор break, чтобы завершить блок switch

			default:
				// Действие по умолчанию
				console.log('Это не новое слово');
				break; // Необязательный оператор break, но его желательно использовать
		}

		await dictionary.save();

		res.render('studyWord', { word, dictionary, messages: req.flash('message') }); // Отправляем данные о словаре в шаблон ejs для отображения
	} catch (error) {
		console.error(error);
		req.flash('message', 'Что-то пошло не так. Попробуйте еще раз');
    return res.redirect('/dictionaries');
	}
};













// exports.repetitionWord = async (req, res) => {
// 	try {
// 		const wordId = req.params.id;




// 		const complexity = req.body.complexity;
// 		const dictionary = await Dictionary.findOne({ 'words.expectation': 'waited' });
// 		for (const word of dictionary.words) {
// 			console.log('найденные слова');
// 			console.log(word);

// 			let {expectation} = word
// 			console.log(expectation);
// 			if (expectation == 'waited'){
// 							console.log('найденное слово');
// 				console.log(word);


// 				break
// 			} else {
// 				continue
// 			}







		
// 		if (!dictionary) {
// 			return res.status(404).send('Словарь не найден');
// 		}
// 	// 	db.collection.find({ 
// 	// 		$and: [
// 	// 				{ 'words.enum': { $ne: 'new' } }, // Первое условие
// 	// 				{ field2: { $ne: value2 } }  // Второе условие
// 	// 		]
// 	// });

// 	let setTime;
// 	switch (complexity) {
// 		case 'easy':
// 			setTime = setTime + (setTime * 0.1);
// 			break;
// 		case 'hard':
// 			setTime = setTime - (setTime * 0.1);
// 			break;
// 	}

// 		console.log('найденные словари');
// 		console.log(dictionary);

	
// 		for (const word of dictionary.words) {
// 			console.log('найденные слова');
// 			console.log(word);

// 			let {expectation} = word
// 			console.log(expectation);
// 			if (expectation == 'waited'){
// 				wordIndex = word._id
// 				console.log('найденное слово');
// 				console.log(word);


// 				switch (word.enum) {
// 					// В случае, если значение равно 'new'
// 					case 'new':
// 						// Действие, которое нужно выполнить
// 						word.enum = 'first';
// 						setTime = 60000
// 						break; // Обязательный оператор break, чтобы завершить блок switch
// 					case 'first':
// 						// Действие, которое нужно выполнить
// 						word.enum = 'third';
// 						setTime = 1200000
// 						break; // Обязательный оператор break, чтобы завершить блок switch
// 					case 'third':
// 						// Действие, которое нужно выполнить
// 						word.enum = 'fourth';
// 						setTime = 21600000
// 						break; // Обязательный оператор break, чтобы завершить блок switch			
// 					case 'fourth':
// 						// Действие, которое нужно выполнить
// 						word.enum = 'fifth';
// 						setTime = 1512000000
// 						break; // Обязательный оператор break, чтобы завершить блок switch
// 					case 'fifth':
// 						// Действие, которое нужно выполнить
// 						word.enum = 'sixth';
// 						setTime = 6574365000
// 						break; // Обязательный оператор break, чтобы завершить блок switch
// 					case 'sixth':
// 						// Действие, которое нужно выполнить
// 						word.enum = 'seventh';
// 						setTime = 15768000000
// 						break; // Обязательный оператор break, чтобы завершить блок switch
// 					case 'seventh':
// 						// Действие, которое нужно выполнить
// 						word.enum = 'eighth';
// 						setTime = 31536000000
// 						break; // Обязательный оператор break, чтобы завершить блок switch
// 					case 'eighth':
// 						// Действие, которое нужно выполнить
// 						word.enum = 'eighth';
// 						setTime = 31536000000
// 						break; // Обязательный оператор break, чтобы завершить блок switch
		
// 					default:
// 						// Действие по умолчанию
// 						console.log('Это не новое слово');
// 						break; // Необязательный оператор break, но его желательно использовать
// 				}
		
				
		
// 				// Обновляем данные о времени ожидания и сложности слова
// 				const newDate = new Date(Date.now() + setTime);
// 				word.expectation = 'wait';
// 				word.waitingTime = newDate;
// 				word.reminder = false;
// 				// Сохраняем обновленный словарь в базе данных
// 				await dictionary.save();









// 				break
// 			} else {
// 				continue
// 			}


			
// 		}

// 		res.redirect(`/study/${dictionary._id}`);
// 	} catch (error) {
// 		console.error(error);
// 		res.status(500).send('Произошла ошибка при повторении слова');
// 	}
// };



// // Контроллер для обновления страницы изучения словаря
// exports.updateStudyPage = async (req, res) => {
// 	try {
// 		const dictionary = await Dictionary.findById(req.params.id);
// 		if (!dictionary) {
//        // Если словарь не найден, возвращаем страницу с сообщением об ошибке
// 				req.flash('message', 'Словарь не найден');
// 				return res.redirect('/dictionaries');
//     }
// 		res.redirect(`/study/${req.params.id}`);
// 	} catch (error) {
// 		console.error(error);
// 		req.flash('message', 'Что-то пошло не так. Попробуйте ещё раз');
// 		res.redirect('/dictionaries');
// 	}
// };