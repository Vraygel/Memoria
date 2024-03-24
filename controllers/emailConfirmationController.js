const User = require('../models/User');

// Контроллер для подтверждения email по токену
exports.confirmEmail = async (req, res) => {
    try {
        const token = req.params.token;

        // Находим пользователя по токену
        const user = await User.findOne({ 'contactinfo.email.token': token });

        // Проверяем, найден ли пользователь и действителен ли токен
        if (!user || user.contactinfo.email.confirmation || !user.contactinfo.email.token || user.contactinfo.email.token !== token) {
            // Если пользователя не найдено, токен уже использован или токен не совпадает, возвращаем ошибку
            req.flash('message', 'Токен недействителен или уже использован.');
            return res.redirect('/user/profile');
        }

        // Обновляем статус подтверждения email и удаляем токен
        user.contactinfo.email.confirmation = true;
        user.contactinfo.email.token = '';
        await user.save();

        // Перенаправляем пользователя на страницу, где можно сообщить об успешном подтверждении 
        req.flash('message', 'Ваш Email успешно подтвержден');
        res.redirect('/user/profile');
    } catch (error) {
        console.error(error);
        req.flash('message', 'Произошла ошибка при подтверждении email. Попробуйте еще раз');
        return res.redirect('/user/profile');
    }
};
