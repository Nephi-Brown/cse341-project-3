// routes/index.js
const router = require('express').Router();
const passport = require('passport');

router.use('/', require('./swagger'));

router.use('/literature', require('./literature'));
router.use('/videogames', require('./videogames'));
router.use('/movies', require('./movies'));
router.use('/music', require('./music'));

router.get('/login', passport.authenticate('github'), (req, res) => {});

router.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

module.exports = router;
