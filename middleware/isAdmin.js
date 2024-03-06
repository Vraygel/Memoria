// Подключение middleware для проверки аутентификации
const isAuthenticated = require('./isAuthenticated');

// Middleware для проверки административных прав пользователя
const isAdmin = function(req, res, next) {
	// Устанавливаем переменную userIsAdmin в res.locals
	res.locals.userIsAdmin = req.isAuthenticated() && req.user && req.user.userstatus === 'admin';

	// Выводим сообщение в консоль для отладки
	// console.log('Проверяем, является ли пользователь администратором:', res.locals.userIsAdmin);

	// Проверяем, является ли пользователь администратором
	if (res.locals.userIsAdmin) {
		// Если пользователь администратор, передаем управление следующему middleware
		return next();
	}

	// Если пользователь не администратор, пропускаем запрос дальше без изменений
	next();
}

// Экспортируем middleware isAdmin для использования в других частях приложения
module.exports = isAdmin;
