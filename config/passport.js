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
        console.log('Найденные пользователи:', users);
        // Делайте что-то с найденными пользователями здесь
    })
    .catch(err => {
        console.error('Ошибка при поиске пользователей:', err);
    });
        User.findOne({ userlogin: userlogin })
            .then(user => {
                if (!user) {
                    console.log('Неверный логин');
                    req.flash('error', 'Ошибка логина');
                    return done(null, false, { message: 'Incorrect name.' });
                }
                bcrypt.compare(password, user.password)
                    .then(res => {
                        if (res) { 
                            return done(null, user); 
                        } else {
                            console.log('Неверный пароль');
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
