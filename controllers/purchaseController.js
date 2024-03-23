// Подключение модуля Express и модуля для работы с шаблонами EJS
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Обработчик GET запроса на страницу покупки
function renderPurchasePage(req, res) {
    res.render('purchase', { messages: req.flash('message') }); // Предполагается, что у вас есть шаблон "purchase.ejs"
}

// Обработчик POST запроса для покупки слов
async function purchaseWords (req, res) {
    const wordCount = req.body.wordCount; // Получение количества слов из тела запроса
   	// Находим пользователя по его ID
		const user = await User.findById(req.user._id);
		if (!user) {
				// Если пользователь не найден, выводим сообщение об ошибке и перенаправляем на страницу профиля
				req.flash('message', 'Пользователь не найден');
				return res.redirect('/user/profile');
		}
		const balansMemoCoin = user.balance.memoCoin
		if(wordCount > balansMemoCoin){
			console.log(`Не достаточно MemoCoin. ${balansMemoCoin} Пополните баланс`);
			req.flash('message', `Не достаточно MemoCoin. ${balansMemoCoin} Пополните баланс`);
			return res.redirect('/user/profile');
		}
		user.balance.memoCoin -= wordCount
		user.words.wordsMax += +wordCount

		await user.save();

		req.flash('message', 'Термины успешно добавлены');
		return res.redirect('/user/profile');
}

// Обработчик POST запроса для покупки словарей
async function purchaseDictionaries(req, res) {
    const dictionaryCount = req.body.dictionaryCount; // Получение количества словарей из тела запроса
    const user = await User.findById(req.user._id);
		if (!user) {
			// Если пользователь не найден, выводим сообщение об ошибке и перенаправляем на страницу профиля
			req.flash('message', 'Пользователь не найден');
			return res.redirect('/user/profile');
	}
		const balansMemoCoin = user.balance.memoCoin
		if(dictionaryCount * 50 > balansMemoCoin){
			console.log(`Не достаточно MemoCoin. ${balansMemoCoin} Пополните баланс`);
			req.flash('message', `Не достаточно MemoCoin. ${balansMemoCoin} Пополните баланс`);
			return res.redirect('/user/profile');
		}
		user.balance.memoCoin -= dictionaryCount * 50
		user.dictionaries.dictionariesMax += +dictionaryCount

		await user.save();

		req.flash('message', 'Разделы успешно добавлены');
		return res.redirect('/user/profile');
}

// Экспорт контроллеров
module.exports = {
    renderPurchasePage,
    purchaseWords,
    purchaseDictionaries
};
