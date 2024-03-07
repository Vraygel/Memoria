const User = require('../models/User');
const Dictionary = require('../models/Dictionary');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const uuid = require('uuid');

// Контроллер для страницы администратора
exports.adminPage = async (req, res) => {
    try {
        // Получение всех пользователей и словарей из базы данных
        const users = await User.find({});
        const dictionaries = await Dictionary.find({});

        // Рендеринг шаблона с информацией о пользователях и словарях
        res.render('admin', { users, dictionaries });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
};

// Контроллер для отображения страницы создания нового пользователя
exports.renderCreateUserPage = async (req, res) => {
    try {
        // Рендеринг шаблона страницы создания пользователя
        res.render('createUser');
    } catch (error) {
        console.error(error);
        // В случае ошибки выводим сообщение и код ошибки 500
        res.status(500).send('Произошла ошибка');
    }
};

// Контроллер для создания нового пользователя
exports.createUser = async (req, res) => {
    try {
        // Генерация временного токена для подтверждения email
        const token = crypto.randomBytes(20).toString('hex');

        // Проверка, что пользователь с таким логином не существует
        const existingUser = await User.findOne({ userlogin: req.body.userlogin });
        if (existingUser) {
            // Если пользователь уже существует, выводим сообщение об ошибке
            req.flash('error', 'Пользователь с таким логином уже существует');
            return res.redirect('/admin/createUser');
        }

        // Хеширование пароля для сохранения в базе данных
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Создание нового пользователя на основе данных из формы
        const user = new User({
            _id: uuid.v4(), // Генерация уникального ID для нового пользователя
            userlogin: req.body.userlogin,
            password: hashedPassword,
            username: req.body.username,
            userstatus: req.body.userstatus,
            balance: req.body.balance || 0,
            contactinfo: {
                email: {
                    email: req.body.email,
                    token: token,
                    confirmation: false // При создании нового пользователя email еще не подтвержден
                },
                phoneNumber: req.body.phoneNumber,
                telegramm: req.body.telegramm,
                chatId: ''
            },
            alerts: {
                email: req.body.emailNotification === 'on', // Преобразуем значение из формы в boolean
                whatsapp: req.body.whatsappNotification === 'on',
                telegramm: req.body.telegramNotification === 'on',
                push: req.body.pushNotification === 'on',
            },
        });

        // Сохранение нового пользователя в базе данных
        await user.save();

        // Перенаправление пользователя на страницу администратора после успешного создания пользователя
        res.redirect('/admin');
    } catch (error) {
        console.error(error);
        // В случае ошибки перенаправляем пользователя на страницу создания пользователя снова
        res.redirect('/admin/createUser');
    }
};

// Контроллер для удаления пользователя администратором
exports.deleteUser = async (req, res) => {
    const userId = req.params.id;

    try {

        // Находим пользователя по ID и удаляем его из базы данных
        const deletedUser = await User.findByIdAndDelete(userId);


        // // Удаляем все словари, принадлежащие удаляемому пользователю
        await Dictionary.deleteMany({ user: userId });

				// Удаляем все словари пользователя
        // await Dictionary.deleteMany({ user: mongoose.Types.ObjectId(userId) });

        if (deletedUser) {
            res.redirect('/admin'); // Перенаправляем после успешного удаления на страницу администратора
        } else {
            res.status(404).send('Пользователь не найден');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка при удалении пользователя');
    }
};

// Контроллер для страницы редактирования пользователя администратором
exports.editUserPage = async (req, res) => {
	try {
			// Получаем ID пользователя из параметров запроса
			const userId = req.params.id;
			// Находим пользователя по ID
			const user = await User.findById(userId);
			if (!user) {
					// Если пользователь не найден, возвращаем ошибку 404
					return res.status(404).send('Пользователь не найден');
			}
			// Рендерим шаблон страницы редактирования с найденным пользователем
			res.render('editUser', { user });
	} catch (error) {
			console.error(error);
			// В случае ошибки отправляем статус 500 и сообщение об ошибке
			res.status(500).send('Произошла ошибка');
	}
};

// Контроллер для обновления информации о пользователе администратором
exports.updateUser = async (req, res) => {
	try {
			// Находим пользователя по ID
			const user = await User.findById(req.params.id);

			// Обновляем свойства пользователя на основе данных из формы
			user.username = req.body.username;
			user.userstatus = req.body.userstatus;
			user.balance = req.body.balance;
			user.contactinfo.email.email = req.body.email;
			user.contactinfo.phoneNumber = req.body.phoneNumber;
			user.contactinfo.telegramm = req.body.telegramm;
			user.alerts.email = req.body.emailNotification === 'on';
			user.alerts.whatsapp = req.body.whatsappNotification === 'on';
			user.alerts.telegramm = req.body.telegramNotification === 'on';
			user.alerts.push = req.body.pushNotification === 'on';

			// Сохраняем обновленного пользователя в базе данных
			await user.save();

			// Перенаправляем пользователя на страницу администратора после успешного обновления
			res.redirect('/admin');
	} catch (error) {
			console.error(error);
			// В случае ошибки перенаправляем пользователя на страницу редактирования с сообщением об ошибке
			req.flash('error', 'Произошла ошибка при редактировании пользователя');
			res.redirect(`/editUser/${req.params.id}`);
	}
};


