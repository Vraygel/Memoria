const twilio = require('twilio');

// Ваши учетные данные Twilio
const accountSid = 'YOUR_ACCOUNT_SID';
const authToken = 'YOUR_AUTH_TOKEN';
const client = new twilio.Twilio(accountSid, authToken);

// Функция для отправки сообщения через WhatsApp
async function sendWhatsAppMessage(to, body) {
    try {
        const message = await client.messages.create({
            body: body,
            from: 'whatsapp:YOUR_TWILIO_NUMBER',
            to: `whatsapp:${to}`
        });
        console.log('Message sent:', message.sid);
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

// Пример использования функции
const chatId = 'USER_WHATSAPP_NUMBER';
const messageText = 'Пора повторить слова из словаря!';
sendWhatsAppMessage(chatId, messageText);
