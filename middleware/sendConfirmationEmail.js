const nodemailer = require('nodemailer'); // Для отправки писем подтверждения

// Функция для отправки письма подтверждения
const sendConfirmationEmail = async function(email, token) {
	const transporter = nodemailer.createTransport({
		service: 'Yandex',
		auth: {
			user: 'neverhoteb@yandex.ru',
			pass: 'Ghjcnjqgfhjkm1981_yan'
		}
	});

	const mailOptions = {
		from: 'neverhoteb@yandex.ru',
		to: email,
		subject: 'Подтверждение email',
		html: `
            <p>Пожалуйста, подтвердите ваш email, перейдя по следующей ссылке:</p>
            <a href="https://frlpt.site/confirm-email/${token}">Подтвердить email</a>
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