const TelegramBot = require('node-telegram-bot-api');

require('dotenv').config();

const telegrammToken = process.env.telegrammToken
const bot = new TelegramBot(`${telegrammToken}`, { polling: true });



module.exports = bot;



