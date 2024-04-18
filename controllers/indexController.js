exports.keyEffective = async (req, res) => {
  try {
    res.render('index', { messages: req.flash('message') } );

  } catch (error) {
    console.error(error);
    req.flash('message', 'Что-то пошло не так. Попробуйте позже');
    res.render('index', { messages: req.flash('message') });
  }
};