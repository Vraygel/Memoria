const nodemailer = require('nodemailer'); 
require('dotenv').config();

const emailPass = process.env.emailPass;

// Функция для отправки письма подтверждения
const sendConfirmationEmail = async (email, token) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.yandex.com',
        port: 465,
        secure: true, // Используется SSL
        auth: {
            user: 'neverhoteb@yandex.ru',
            pass: 'Ghjcnjqgfhjkm1981_yan'

        },
				logger: true, // Включаем логирование
   			debug: true   // А также отладочные сообщения SMTP
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

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Письмо успешно отправлено:', info.response);
    } catch (error) {
        console.error('Ошибка при отправке письма:', error);
    }
}

module.exports = sendConfirmationEmail;
