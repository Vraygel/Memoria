const User = require('../models/User');
const Dictionary = require('../models/Dictionary'); // Добавляем модель словаря

// Контроллер для удаления профиля пользователя и всех его словарей
exports.deleteProfile = async (req, res) => {
    try {
        // Удаляем профиль пользователя по его ID
        await User.findByIdAndDelete(req.user._id);

        // Удаляем все словари пользователя
        await Dictionary.deleteMany({ user: req.user._id });

        // Вызываем метод logout(), предоставленный Passport для выхода пользователя из сеанса
        req.logout((err) => {
            if (err) {
                console.error('Ошибка при выходе пользователя:', err);
                // Обработка ошибки, если таковая имеется
                return res.redirect('/profile'); // Перенаправление пользователя в случае ошибки
            }
            // После успешного выхода пользователя перенаправляем его на главную страницу
            res.redirect('/');
        });
    } catch (error) {
        console.error('Произошла ошибка при удалении профиля:', error);
        req.flash('error', 'Произошла ошибка при удалении профиля');
        res.redirect('/profile');
    }
};