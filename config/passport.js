const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/User');
const bot = require('../utils/telegramBot'); // Импорт экземпляра бота

module.exports = function (passport) {
    passport.use(new LocalStrategy({
        usernameField: 'userlogin',
        passReqToCallback: true
    }, (req, userlogin, password, done) => {
        User.find({})
            .then(users => {
                // Делайте что-то с найденными пользователями здесь
            })
            .catch(err => {
                console.error('Ошибка при поиске пользователей:', err);
            });
        User.findOne({ userlogin: userlogin })
            .then(user => {
                if (!user) {
                    console.log('Неверный логин (сообщение из файла passport.js)');
                    req.flash('message', 'Не верный логин');
                    return done(null, false);
                }
                bcrypt.compare(password, user.password)
                    .then(res => {
                        if (res) {

                            // Обрабатываем событие приема сообщения от бота Telegram
                            bot.on('message', async (msg) => {
                                let userId = req.user._id;
                                let userIdTelegrammMemboost = msg.text
                                console.log(msg);
                                if (user.contactinfo.chatId == msg.from.id) {
                                    console.log('Сообщение из чат бота telegramm авторизованный пользователь ' + user.userlogin + " " + msg.text);
                                } else {
                                    if (userId == userIdTelegrammMemboost) {
                                        user.contactinfo.chatId = msg.chat.id;
                                        console.log('Пользователь индетифицирован в чат-боте телеграмм id' + msg.chat.id);
                                        await user.save();
                                    } else {
                                        console.log('Сообщение из чат бота telegramm не авторизованный пользователь' + msg.text);
                                    }
                                }
                            });

                            return done(null, user);
                        } else {
                            console.log('Не верный пароль (сообщение из файла passport.js)');
                            req.flash('message', 'Не верный пароль');
                            return done(null, false);
                        }
                    })
                    .catch(err => done(err));
            })
            .catch(err => done(err));
    }));

    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => {
        User.findById(id)
            .then(user => {

                done(null, user);
            })
            .catch(err => {
                done(err, null);
            });
    });
};
