const express = require('express');
const router = express.Router();
const isAdmin = require('../middleware/isAdmin');
const adminController = require('../controllers/adminController');


// Маршрут для страницы администратора
router.get('/', adminController.adminPage);

// Маршрут для удаления пользователя администратором
router.post('/deleteUser/:id', adminController.deleteUser);

// Маршрут для отображения страницы создания пользователя администратором
router.get('/createUser', adminController.renderCreateUserPage);

// Маршрут для создания нового пользователя администратором
router.post('/createUser', adminController.createUser);

// Роут для страницы редактирования пользователя администратором
router.get('/editUser/:id', adminController.editUserPage);

// Роут для обновления информации о пользователе администратором
router.post('/editUser/:id', adminController.updateUser);






module.exports = router;
