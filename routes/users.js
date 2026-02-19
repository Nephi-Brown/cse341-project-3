// routes/users.js
const router = require('express').Router();
const usersController = require('../controllers/users');
const { isAuthenticated } = require('../middleware/authenticate');

router.get('/me', isAuthenticated, usersController.getMe);

router.get('/me/logins', isAuthenticated, usersController.getLoginHistory);

router.get('/me/favorites', isAuthenticated, usersController.listFavorites);
router.post('/me/favorites', isAuthenticated, usersController.addFavorite);
router.delete('/me/favorites/:collection/:itemId', isAuthenticated, usersController.removeFavorite);

router.get('/me/borrowing', isAuthenticated, usersController.getBorrowingHistory);

module.exports = router;
