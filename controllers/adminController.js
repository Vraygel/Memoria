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
        res.render('admin', { users, dictionaries, messages: req.flash('message') });
    } catch (error) {
        console.error('Error:', error);
        // req.flash('message', 'Неверный формат email');
        req.flash('message', 'Что-то пошло не так');
        res.redirect('/admin');
    }
};

// Контроллер для отображения страницы создания нового пользователя
exports.renderCreateUserPage = async (req, res) => {
    try {
        // Рендеринг шаблона страницы создания пользователя
        res.render('createUser', { messages: req.flash('message') });
    } catch (error) {
        console.error(error);
        // В случае ошибки выводим сообщение и код ошибки 500
        req.flash('message', 'Что-то пошло не так');
        res.redirect('/admin');
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
            req.flash('message', 'Пользователь с таким логином уже существует');
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
            dateRegistration: new Date(),
            balance: {
                memoCoin: req.body.memoCoin || 0,
                balanceAllTime: 0,
            },
            dictionaries: {
                // dictionariesMax: req.body.maxDictionaries || 2,
                dictionariesСreated: 0,
            },
            words: {
                // wordsMax: req.body.maxWords || 100,
                wordsСreated: 0,
            },
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

        // console.log(user);

        // Сохранение нового пользователя в базе данных
        await user.save();

        // Перенаправление пользователя на страницу администратора после успешного создания пользователя
        res.redirect('/admin');
    } catch (error) {
        console.error(error);
        req.flash('message', 'Что-то пошло не так');
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
            req.flash('message', 'Пользователь успешно удален');
            res.redirect('/admin'); // Перенаправляем после успешного удаления на страницу администратора
        } else {
            req.flash('message', 'Пользователь не найден');
            return res.redirect('/admin');
        }
    } catch (error) {
        console.error(error);
        req.flash('message', 'Ошибка при удалении пользователя');
        return res.redirect('/admin');
    }
};

// Контроллер для страницы редактирования пользователя администратором
exports.editUserPage = async (req, res) => {
	try {
			// Находим пользователя по ID
			const user = await User.findById(req.params.id);
			if (!user) {
					// Если пользователь не найден, возвращаем ошибку 404
                    req.flash('message', 'Пользователь не найден');
                    return res.redirect('/admin');
			}
			// Рендерим шаблон страницы редактирования с найденным пользователем
			res.render('editUser', { user, messages: req.flash('message') });
	} catch (error) {
			console.error(error);
			// В случае ошибки отправляем статус 500 и сообщение об ошибке
			req.flash('message', 'Что-то пошло не так');
        // В случае ошибки перенаправляем пользователя на страницу создания пользователя снова
            res.redirect('/admin/editUser');
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
			user.balance.memoCoin = req.body.memoCoin || 0;
            user.dateRegistration = req.body.dateRegistration || new Date(),
            // user.dictionaries.dictionariesMax = req.body.dictionariesMax || 0,
            // user.words.wordsMax = req.body.wordsMax || 0, 
			user.contactinfo.email.email = req.body.email;
			user.contactinfo.phoneNumber = req.body.phoneNumber;
          	user.alerts.email = req.body.emailNotification === 'on';
			user.alerts.whatsapp = req.body.whatsappNotification === 'on';
			user.alerts.telegramm = req.body.telegramNotification === 'on';
			user.alerts.push = req.body.pushNotification === 'on';

			// Сохраняем обновленного пользователя в базе данных
			await user.save();
            req.flash('message', 'Пользователь успешно сохранен');
			// Перенаправляем пользователя на страницу администратора после успешного обновления
			res.redirect('/admin');
	} catch (error) {
			console.error(error);
			// В случае ошибки перенаправляем пользователя на страницу редактирования с сообщением об ошибке
			req.flash('message', 'Произошла ошибка при редактировании пользователя');
			res.redirect(`/admin/editUser/${req.params.id}`);
	}
};


