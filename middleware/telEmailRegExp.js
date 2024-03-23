const TEL_REGEXP = /^(\+7|8)[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/
const EMAIL_REGEXP = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/iu;

const telEmailRegExp = function(req, res, next) {
    // Добавляем регулярное выражение в объект res.locals
    res.locals.TEL_REGEXP = TEL_REGEXP;
    res.locals.EMAIL_REGEXP = EMAIL_REGEXP;
    // Передаем управление следующему middleware
    next();
};

module.exports = telEmailRegExp;