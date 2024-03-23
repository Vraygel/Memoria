// Подключение middleware для проверки аутентификации
const isAuthenticated = require('./authenticated');

// Middleware для проверки административных прав пользователя
const user = function (req, res, next) {
	// Устанавливаем переменную userIsAdmin в res.locals
	res.locals.user = req.user

	// if (res.locals.user) {
	// 	// Выводим сообщение в консоль для отладки
	// 	console.log('Проверяем аутентификацию пользователя:', res.locals.user.userlogin);
	// }

	return next();
}

// Экспортируем middleware isAdmin для использования в других частях приложения
module.exports = user;
