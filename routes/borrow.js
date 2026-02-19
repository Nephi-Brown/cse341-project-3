// routes/borrow.js
const router = require('express').Router();
const borrowController = require('../controllers/borrow');
const { isAuthenticated } = require('../middleware/authenticate');

router.patch('/:collection/:id/checkout', isAuthenticated, borrowController.checkout);
router.patch('/:collection/:id/return', isAuthenticated, borrowController.returnItem);

module.exports = router;
