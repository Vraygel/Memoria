const nodemailer = require('nodemailer');
require('dotenv').config();

const emailPass = process.env.emailPass

// Функция для отправки письма подтверждения
const sendConfirmationEmail = async function(email, token) {
	// Проверяем, был ли передан адрес электронной почты
	if (!email) {
			console.error('Не удалось отправить письмо: адрес электронной почты не указан.');
			return; // Возвращаемся из функции
	}

	const transporter = nodemailer.createTransport({
			service: 'Yandex',
			auth: {
					user: 'neverhoteb@yandex.ru',
					pass: `${emailPass}`
			}
	});

	const mailOptions = {
			from: 'neverhoteb@yandex.ru',
			to: email,
			subject: 'Подтверждение email',
			html: `
					<p>Пожалуйста, подтвердите ваш email, перейдя по следующей ссылке:</p>
					<a href="http://example.com/confirm-email/${token}">Подтвердить email</a>
			`
	};

	transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
					console.error('Ошибка при отправке письма:', error);
			} else {
					console.log('Письмо успешно отправлено:', info.response);
			}
	});
}


module.exports = { sendConfirmationEmail };
