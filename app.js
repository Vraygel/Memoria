const express = require('express');
const passport = require('passport');

const multer = require('multer');
const session = require('express-session');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const favicon = require('serve-favicon');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const adminRoutes = require('./routes/adminRoutes');
const resetPassword = require('./routes/PasswordRoutes'); // Подключаем маршрутизатор для сброса пароля
const emailConfirmationRoutes = require('./routes/emailConfirmationRoutes');
const dictionaryRoutes = require('./routes/dictionaryRoutes');
const wordRoutes = require('./routes/wordRoutes');
const studyRoutes = require('./routes/studyRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes'); // Импорт роутера для покупок
const indexRoutes = require('./routes/indexRoutes'); // 


const isAuthenticated = require('./middleware/authenticated');
const isAdmin = require('./middleware/isAdmin');
const user = require('./middleware/user');
const telEmailRegExp = require('./middleware/telEmailRegExp');

const checkingDate = require('./utils/checkingDate');


// Подключение к MongoDB
mongoose.connect('mongodb://localhost:27017/passport-example')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

const app = express();

// Подключаем иконку сайта (favicon)
app.use(favicon(path.join(__dirname, 'public', 'image', 'favicon.ico')));

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

// Добавляем middleware user
app.use(user);

// Добавляем middleware user telEmailRegExp
app.use(telEmailRegExp);

app.get('/', (req, res) => {
  res.redirect('/index');
});

// Подключение маршрутов 
app.use('/index', indexRoutes);

// Подключение маршрутов аутентификации
app.use('/auth', authRoutes);

// Подключаем маршруты для профиля
app.use('/user', isAuthenticated, profileRoutes);

// Подключаем роут для сброса пароля
app.use('/password', resetPassword);

// Подключаем маршруты для подтверждения email
app.use('/confirmEmail', emailConfirmationRoutes);

// Подключаем маршруты для администратора
app.use('/admin', isAdmin, isAuthenticated, adminRoutes);

// Подключение роутов для работы со словарями
app.use('/dictionaries', isAuthenticated, dictionaryRoutes);

// Подключение роутов для слов
app.use('/words', isAuthenticated, wordRoutes);

// Подключение роутов для изучения словаря
app.use('/study', isAuthenticated, studyRoutes);

// Подключаем маршруты для покупки слов и словарей
app.use('/purchase', isAuthenticated, purchaseRoutes);

// Устанавливаем интервал для выполнения функции каждые 10 секунд (в миллисекундах)
setInterval(checkingDate, 10000); // 10000 миллисекунд = 10 секунд

const PORT = process.env.PORT || 443;

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на ${PORT}`);
});
