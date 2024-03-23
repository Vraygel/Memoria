// Создаем middleware для проверки аутентификации пользователя
const isAuthenticated = function(req, res, next) {
	
		// Проверяем, авторизован ли пользователь
		if (req.isAuthenticated()) {
			// Если пользователь аутентифицирован, устанавливаем переменную userIsVerified в res.locals и продолжаем выполнение запроса
			res.locals.userIsVerified = true; // Устанавливаем пользователь аутентифицирован
			return next(); // Передаем управление следующему middleware
		} else {
			// Если пользователь не аутентифицирован, перенаправляем его на страницу входа
			console.log(req.path);
			console.log('пользователь не аутентифицирован');
			res.redirect('/auth/login');
		}
}

// Экспортируем middleware isAuthenticated для использования в других частях приложения
module.exports = isAuthenticated;
