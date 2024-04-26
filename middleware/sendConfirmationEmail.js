const nodemailer = require('nodemailer'); // Для отправки писем подтверждения

require('dotenv').config();
const emailPass = process.env.emailPass

// Функция для отправки письма подтверждения
const sendConfirmationEmail = async function(email, token) {
	const transporter = nodemailer.createTransport({
		host: 'smtp.yandex.com',
    port: 465,
    secure: true, // это значение говорит о том, что используется SSL
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
            <a href="https://memboost.ru/confirm-email/${token}">Подтвердить email</a>
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







module.exports = sendConfirmationEmail;