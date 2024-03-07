const express = require('express');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const deleteProfileRoute = require('./routes/deleteProfileRoute');
const adminRoutes = require('./routes/adminRoutes');
const dictionaryRoutes = require('./routes/dictionaryRoutes');
const wordRoutes = require('./routes/wordRoutes');
const studyRoutes = require('./routes/studyRoutes');
const forgotPassword = require('./routes/forgotPasswordRoutes'); // Подключаем маршрутизатор для сброса пароля
const resetPassword = require('./routes/resetPasswordRoutes'); // Подключаем маршрутизатор для сброса пароля


const isAuthenticated = require('./middleware/authenticated');
const isAdmin = require('./middleware/isAdmin');









// Подключение к MongoDB
mongoose.connect('mongodb://localhost:27017/myapp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

const app = express();

// Настройка Passport
require('./config/passport')(passport);

// Middleware для обработки данных из форм
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware для сессий
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));




// Middleware для Flash сообщений
app.use(flash());

// Подключение Passport и сессий
app.use(passport.initialize());
app.use(passport.session());

// Настройка шаблонизатора, статических файлов и порта
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Добавляем middleware для проверки аутентификации перед isAdmin
app.use(isAuthenticated);

// Затем добавляем middleware isAdmin
// app.use(isAdmin);




app.get('/', (req, res) => {
  res.redirect('/auth/login');
});

// Подключение маршрутов аутентификации
app.use('/auth', authRoutes);

// Подключаем маршруты профиля пользователя
app.use('/', profileRoutes);

// Подключаем маршруты удаления профиля пользователя
app.use('/', deleteProfileRoute);

// Подключаем маршруты для профиля
app.use('/profile', profileRoutes);

// Подключаем маршруты для администратора
app.use(adminRoutes);
app.use('/admin', adminRoutes);

// Подключение роутов для работы со словарями
app.use('/dictionaries', dictionaryRoutes);

// Подключение роутов для слов
app.use(wordRoutes);

// Подключение роутов для изучения словаря
app.use(studyRoutes);

// Подключаем роут для сброса пароля
app.use('/', forgotPassword);

// Подключаем роут для сброса пароля
app.use('/', resetPassword);






const PORT = process.env.PORT || 3000;

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на ${PORT}`);
});
