// Создаем middleware для проверки аутентификации пользователя
const isAuthenticated = function(req, res, next) {
	// Проверяем, если запрос не направлен на страницу входа '/login'
	if (req.path !== '/login' && req.path !== '/users/register') {
		// Проверяем, авторизован ли пользователь
		if (req.isAuthenticated()) {
			// Если пользователь аутентифицирован, устанавливаем переменную userIsVerified в res.locals и продолжаем выполнение запроса
			res.locals.userIsVerified = true; // Устанавливаем пользователь аутентифицирован
			return next(); // Передаем управление следующему middleware
		} else {
			// Если пользователь не аутентифицирован, перенаправляем его на страницу входа
			res.redirect('/login');
		}
	} else {
		// Если запрос направлен на страницу входа, пропускаем его дальше без проверки аутентификации
		next();
	}
}

// Экспортируем middleware isAuthenticated для использования в других частях приложения
module.exports = isAuthenticated;
