const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/User');

module.exports = function(passport) {
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
