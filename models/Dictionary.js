const mongoose = require('mongoose');

// Создаем схему для объекта словаря
const dictionarySchema = new mongoose.Schema({
    // Свойство "name" хранит название словаря
    name: String,

    // Свойство "user" хранит информацию о пользователе, создавшем словарь
    user: String,

    // Свойство "isPublic" указывает, является ли словарь общедоступным или приватным
    isPublic: Boolean,

    // Свойство "words" представляет собой массив объектов, каждый из которых содержит информацию о слове в словаре
    words: [
        {   
            // Свойство "time" дата создания термина
            time: String,
            
            // Свойство "dateCreated" дата (отформатированная) создания термина
            dateCreated: String,

            // Свойство "enum" представляет собой перечислимый тип, который может содержать строковые значения
            enum: String,

            // Свойство "reminder" указывает, было ли отправлено напоминание о слове
            reminder: Boolean,

            // Свойство "expectation" хранит информацию о том, что запущен обратный отсчет до повторения варианты: (waited - отчет закончен. wait - отчет не начанался)
            expectation: String,

            // Свойство "waitingTime" указывает время ожидания перед повторным изучением слова
            waitingTime: String,
            formattedDate: String,
            img:{
                availability: Boolean,
                wordFileUrl: String,
                wordFileOriginalname: String,
                wordFileMimetype: String,
            },
            audio:{
                availability: Boolean,
                wordFileUrl: String,
                wordFileOriginalname: String,
                wordFileMimetype: String,
            },
            
            // Свойство "word" содержит само слово
            word: String,

            // Свойство "translation" содержит перевод слова
            translation: String,
            // Свойство "word" содержит само слово
            termLink: String
        }
    ]
});

// Создаем модель для коллекции "Dictionary" на основе схемы
const Dictionary = mongoose.model('Dictionary', dictionarySchema);

// Экспортируем модель для использования в других частях приложения
module.exports = Dictionary;
